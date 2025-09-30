import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { targetUsers, customFilters } = await request.json();

    await connectToDatabase();

    // Fetch all users and orders
    const allUsers = await User.find({ isActive: true }).select(
      "email profile.firstName profile.lastName profile.country role rank.totalSpent"
    );
    const allOrders = await Order.find({}).select(
      "userId guestEmail status paymentStatus totalAmount"
    );

    // Get all user IDs who have completed orders
    const completedOrders = allOrders.filter(
      (order) =>
        order.status === "completed" && order.paymentStatus === "completed"
    );
    const purchasedUserIds = new Set(
      completedOrders
        .filter((order) => order.userId)
        .map((order) => order.userId.toString())
    );

    // Calculate total spent per user from orders
    const userTotalSpent = {};
    completedOrders.forEach((order) => {
      if (order.userId) {
        const userId = order.userId.toString();
        userTotalSpent[userId] =
          (userTotalSpent[userId] || 0) + (order.totalAmount || 0);
      }
    });

    // Get guest emails who have orders
    const guestEmails = new Set(
      allOrders
        .filter((order) => order.guestEmail && !order.userId)
        .map((order) => order.guestEmail.toLowerCase())
    );

    // Filter users based on target category
    let filteredUsers = [];

    if (targetUsers === "all") {
      filteredUsers = allUsers;
    } else if (targetUsers === "guest") {
      filteredUsers = allUsers.filter((user) =>
        guestEmails.has(user.email.toLowerCase())
      );
    } else if (targetUsers === "loggedIn") {
      filteredUsers = allUsers;
    } else if (targetUsers === "purchased") {
      filteredUsers = allUsers.filter((user) =>
        purchasedUserIds.has(user._id.toString())
      );
    } else if (targetUsers === "loggedInNoPurchase") {
      filteredUsers = allUsers.filter(
        (user) => !purchasedUserIds.has(user._id.toString())
      );
    }

    // Apply custom filters
    if (customFilters) {
      // Country filter - multi-select
      if (
        customFilters.countries &&
        customFilters.countries.length > 0 &&
        !customFilters.countries.includes("all")
      ) {
        filteredUsers = filteredUsers.filter((user) =>
          customFilters.countries.includes(user.profile?.country)
        );
      }

      // Role filter - multi-select
      if (customFilters.roles && customFilters.roles.length > 0) {
        filteredUsers = filteredUsers.filter((user) =>
          customFilters.roles.includes(user.role)
        );
      }

      // Min spent filter - using calculated total from orders
      if (customFilters.minSpent) {
        const minSpent = parseFloat(customFilters.minSpent);
        filteredUsers = filteredUsers.filter(
          (user) => (userTotalSpent[user._id.toString()] || 0) >= minSpent
        );
      }
    }

    // Format user data for preview
    const users = filteredUsers.slice(0, 100).map((user) => ({
      _id: user._id,
      name: `${user.profile?.firstName || ""} ${
        user.profile?.lastName || ""
      }`.trim(),
      email: user.email,
      country: user.profile?.country || null,
      role: user.role,
      totalSpent: userTotalSpent[user._id.toString()] || 0,
    }));

    return NextResponse.json({
      success: true,
      users,
      total: filteredUsers.length,
      showing: users.length,
    });
  } catch (error) {
    console.error("Preview users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
