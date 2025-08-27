"use client";
import { useAuth } from "@/contexts/AuthContext";
import { createContext, useContext, useEffect, useState } from "react";

const UserSpendingContext = createContext({});

export const useUserSpending = () => {
  const context = useContext(UserSpendingContext);
  if (context === undefined) {
    throw new Error(
      "useUserSpending must be used within a UserSpendingContextProvider"
    );
  }
  return context;
};

export const UserSpendingContextProvider = ({ children }) => {
  const { user } = useAuth();
  const [userSpending, setUserSpending] = useState({
    totalSpent: 0,
    currentRank: null,
    nextRank: null,
    progressToNextRank: 0,
    rankHistory: [],
    loading: true,
    error: null,
  });

  // Calculate user rank based on spending
  const calculateUserRank = (totalSpent, rankSystems) => {
    if (!rankSystems || rankSystems.length === 0) {
      return {
        currentRank: null,
        nextRank: null,
        progressToNextRank: 0,
      };
    }

    // Sort rank systems by spending requirement (ascending)
    const sortedRanks = [...rankSystems].sort(
      (a, b) => a.spending.min - b.spending.min
    );

    let currentRank = null;
    let nextRank = null;
    let progressToNextRank = 0;

    // Find current rank
    for (let i = sortedRanks.length - 1; i >= 0; i--) {
      if (totalSpent >= sortedRanks[i].spending.min) {
        currentRank = sortedRanks[i];
        break;
      }
    }

    // Find next rank
    if (currentRank) {
      const currentIndex = sortedRanks.findIndex(
        (rank) => rank._id === currentRank._id
      );
      if (currentIndex < sortedRanks.length - 1) {
        nextRank = sortedRanks[currentIndex + 1];

        // Calculate progress to next rank
        const currentMin = currentRank.spending.min;
        const nextMin = nextRank.spending.min;
        const userSpending = totalSpent;

        if (nextMin > currentMin) {
          progressToNextRank = Math.min(
            100,
            ((userSpending - currentMin) / (nextMin - currentMin)) * 100
          );
        }
      }
    }

    return {
      currentRank,
      nextRank,
      progressToNextRank,
    };
  };

  // Fetch user's completed orders and calculate spending
  const fetchUserSpending = async () => {
    if (!user?.email) {
      setUserSpending((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      setUserSpending((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch user's completed orders
      const ordersResponse = await fetch(
        `/api/orders/user?email=${encodeURIComponent(user.email)}&isAdmin=false`
      );

      if (!ordersResponse.ok) {
        throw new Error(`HTTP error! status: ${ordersResponse.status}`);
      }

      const ordersData = await ordersResponse.json();

      console.log(ordersData);

      if (!ordersData.success) {
        throw new Error(ordersData.error || "Failed to fetch orders");
      }

      // Filter only completed orders and calculate total spending
      const completedOrders =
        ordersData.orders?.filter(
          (order) =>
            order.status === "completed" || order.status === "Completed"
        ) || [];

      const totalSpent = completedOrders.reduce((sum, order) => {
        return sum + (order.totalAmount || 0);
      }, 0);

      // Fetch rank systems to calculate current rank
      const rankResponse = await fetch("/api/admin/rank-system");
      const rankData = await rankResponse.json();

      let rankSystems = [];
      if (rankData.success) {
        rankSystems = rankData.data;
      }

      // Calculate user rank
      const { currentRank, nextRank, progressToNextRank } = calculateUserRank(
        totalSpent,
        rankSystems
      );

      // Create rank history
      const rankHistory = rankSystems
        .filter((rank) => rank.spending.min <= totalSpent)
        .sort((a, b) => a.spending.min - b.spending.min);

      setUserSpending({
        totalSpent,
        currentRank,
        nextRank,
        progressToNextRank,
        rankHistory,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching user spending:", error);
      setUserSpending({
        totalSpent: 0,
        currentRank: null,
        nextRank: null,
        progressToNextRank: 0,
        rankHistory: [],
        loading: false,
        error: error.message,
      });
    }
  };

  // Refresh user spending data
  const refreshUserSpending = () => {
    fetchUserSpending();
  };

  useEffect(() => {
    fetchUserSpending();
  }, [user?.email]);

  const value = {
    ...userSpending,
    refreshUserSpending,
  };

  return (
    <UserSpendingContext.Provider value={value}>
      {children}
    </UserSpendingContext.Provider>
  );
};
