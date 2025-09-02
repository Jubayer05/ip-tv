import { connectToDatabase } from "@/lib/db";
import { sendBulkNotificationEmail } from "@/lib/email";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
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

    // Build query based on target users and filters
    let query = { isActive: true };

    if (targetUsers === "all") {
      // Send to all active users
    } else if (targetUsers === "premium") {
      query["rank.level"] = { $in: ["gold", "platinum", "diamond"] };
    } else if (targetUsers === "new") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.createdAt = { $gte: thirtyDaysAgo };
    } else if (targetUsers === "inactive") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.lastLogin = { $lt: thirtyDaysAgo };
    }

    // Apply custom filters if provided
    if (customFilters) {
      if (customFilters.country) {
        query["profile.country"] = customFilters.country;
      }
      if (customFilters.role) {
        query.role = customFilters.role;
      }
      if (customFilters.minSpent) {
        query["rank.totalSpent"] = { $gte: customFilters.minSpent };
      }
    }

    // Get all matching users
    const users = await User.find(query).select(
      "email profile.firstName profile.lastName"
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: "No users found matching the criteria" },
        { status: 404 }
      );
    }

    // Extract emails
    const emails = users.map((user) => user.email);

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
      users: users.map((user) => ({
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

    // Get user statistics for the bulk notification form
    const stats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          premiumUsers: {
            $sum: {
              $cond: [
                { $in: ["$rank.level", ["gold", "platinum", "diamond"]] },
                1,
                0,
              ],
            },
          },
          newUsers: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    "$createdAt",
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  ],
                },
                1,
                0,
              ],
            },
          },
          inactiveUsers: {
            $sum: {
              $cond: [
                {
                  $lt: [
                    "$lastLogin",
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      stats: stats[0] || {
        totalUsers: 0,
        premiumUsers: 0,
        newUsers: 0,
        inactiveUsers: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
