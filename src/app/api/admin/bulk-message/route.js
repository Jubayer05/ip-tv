import { connectToDatabase } from "@/lib/db";
import { sendBulkNotificationEmail } from "@/lib/email";
import Order from "@/models/Order";
import User from "@/models/User";
import { NextResponse } from "next/server";

// Rate limiting for bulk emails (in-memory, resets on server restart)
let lastBulkEmailTime = 0;
const BULK_EMAIL_COOLDOWN = 3600000; // 1 hour between bulk emails (in milliseconds)
const MAX_RECIPIENTS_PER_BULK = 50; // Maximum recipients per bulk email

export async function POST(request) {
  try {
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastEmail = now - lastBulkEmailTime;

    if (timeSinceLastEmail < BULK_EMAIL_COOLDOWN) {
      const remainingMinutes = Math.ceil(
        (BULK_EMAIL_COOLDOWN - timeSinceLastEmail) / 60000
      );
      return NextResponse.json(
        {
          error: `Bulk email cooldown active. Please wait ${remainingMinutes} minute(s) before sending another bulk email.`,
          cooldownRemaining: remainingMinutes,
        },
        { status: 429 }
      );
    }

    const { subject, message, targetUsers, customFilters } =
      await request.json();

    // Validate input
    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

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
      // Guest users - users who have orders but never logged in (guestEmail in orders)
      filteredUsers = allUsers.filter((user) =>
        guestEmails.has(user.email.toLowerCase())
      );
    } else if (targetUsers === "loggedIn") {
      // All logged in users (all users in User collection)
      filteredUsers = allUsers;
    } else if (targetUsers === "purchased") {
      // Users with at least one completed order
      filteredUsers = allUsers.filter((user) =>
        purchasedUserIds.has(user._id.toString())
      );
    } else if (targetUsers === "loggedInNoPurchase") {
      // Logged in users who never made a purchase
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

    if (filteredUsers.length === 0) {
      return NextResponse.json(
        { error: "No users found matching the criteria" },
        { status: 404 }
      );
    }

    // Extract emails and validate count
    const emails = filteredUsers
      .map((user) => user.email)
      .filter((email) => email && email.trim().length > 0);

    if (emails.length === 0) {
      return NextResponse.json(
        { error: "No valid email addresses found" },
        { status: 400 }
      );
    }

    // Check recipient limit
    if (emails.length > MAX_RECIPIENTS_PER_BULK) {
      return NextResponse.json(
        {
          error: `Too many recipients (${emails.length}). Maximum allowed is ${MAX_RECIPIENTS_PER_BULK} recipients per bulk email. Please filter your selection.`,
          recipientCount: emails.length,
          maxAllowed: MAX_RECIPIENTS_PER_BULK,
        },
        { status: 400 }
      );
    }

    // Update last bulk email time before sending
    lastBulkEmailTime = now;

    // Send bulk email
    const emailSent = await sendBulkNotificationEmail(emails, subject, message);

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send bulk email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Bulk notification sent successfully to ${emails.length} users`,
      recipientCount: emails.length,
      users: filteredUsers.map((user) => ({
        email: user.email,
        name: user.profile.firstName + " " + (user.profile.lastName || ""),
      })),
    });
  } catch (error) {
    console.error("Bulk notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();

    // Fetch all users and orders
    const allUsers = await User.find({ isActive: true }).select(
      "email profile.country"
    );
    const allOrders = await Order.find({}).select(
      "userId guestEmail status paymentStatus"
    );

    // Get completed orders
    const completedOrders = allOrders.filter(
      (order) =>
        order.status === "completed" && order.paymentStatus === "completed"
    );

    // Get all user IDs who have completed orders
    const purchasedUserIds = new Set(
      completedOrders
        .filter((order) => order.userId)
        .map((order) => order.userId.toString())
    );

    // Get guest emails from orders
    const guestEmails = new Set(
      allOrders
        .filter((order) => order.guestEmail && !order.userId)
        .map((order) => order.guestEmail.toLowerCase())
    );

    // Calculate stats
    const totalUsers = allUsers.length;

    // Guest users - those who made orders but are in user collection (had guest checkout then registered)
    const guestUsers = allUsers.filter((user) =>
      guestEmails.has(user.email.toLowerCase())
    ).length;

    // All logged in users = all users in User collection
    const loggedInUsers = totalUsers;

    // Users with at least one completed order
    const purchasedUsers = allUsers.filter((user) =>
      purchasedUserIds.has(user._id.toString())
    ).length;

    // Logged in but never purchased
    const loggedInNoPurchase = totalUsers - purchasedUsers;

    // Extract unique countries from users
    const countriesSet = new Set();
    allUsers.forEach((user) => {
      if (user.profile?.country) {
        countriesSet.add(user.profile.country);
      }
    });
    const countries = Array.from(countriesSet).sort();

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        guestUsers,
        loggedInUsers,
        purchasedUsers,
        loggedInNoPurchase,
      },
      countries,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
