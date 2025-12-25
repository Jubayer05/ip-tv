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
  const { user, getAuthToken } = useAuth();
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

  // Fetch user's rank and spending data
  const fetchUserSpending = async () => {
    if (!user?.email) {
      setUserSpending((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      setUserSpending((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch user's profile which includes stored rank data
      const profileResponse = await fetch(
        `/api/users/profile?email=${encodeURIComponent(user.email)}`
      );

      if (!profileResponse.ok) {
        throw new Error(`HTTP error! status: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();

      if (!profileData.success) {
        throw new Error(profileData.error || "Failed to fetch profile");
      }

      // Use stored rank data from user profile
      const storedRank = profileData.data?.rank || {
        level: "bronze",
        totalSpent: 0,
        discountPercentage: 5,
      };

      const totalSpent = storedRank.totalSpent || 0;

      // Fetch rank systems to get full rank details
      const rankResponse = await fetch("/api/admin/rank-system");
      const rankData = await rankResponse.json();

      let rankSystems = [];
      if (rankData.success) {
        rankSystems = rankData.data;
      }

      // Find current rank details from rank systems based on stored level
      let currentRank = null;
      let nextRank = null;
      let progressToNextRank = 0;

      if (rankSystems.length > 0) {
        // Sort rank systems by spending requirement (ascending)
        const sortedRanks = [...rankSystems].sort(
          (a, b) => a.spending.min - b.spending.min
        );

        // Find the rank that matches the stored level or calculate based on totalSpent
        currentRank = sortedRanks.find(
          (rank) => rank.name.toLowerCase() === storedRank.level?.toLowerCase()
        );

        // If no match by name, calculate based on totalSpent
        if (!currentRank) {
          for (let i = sortedRanks.length - 1; i >= 0; i--) {
            if (totalSpent >= sortedRanks[i].spending.min) {
              currentRank = sortedRanks[i];
              break;
            }
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

            if (nextMin > currentMin) {
              progressToNextRank = Math.min(
                100,
                ((totalSpent - currentMin) / (nextMin - currentMin)) * 100
              );
            }
          }
        }
      }

      // If we have stored rank but couldn't find in rank systems, create a basic rank object
      if (!currentRank && storedRank.level) {
        currentRank = {
          name: storedRank.level.charAt(0).toUpperCase() + storedRank.level.slice(1),
          discount: storedRank.discountPercentage || 0,
          spending: { min: totalSpent },
        };
      }

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
