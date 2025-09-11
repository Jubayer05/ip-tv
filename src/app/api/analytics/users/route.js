import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const rank = searchParams.get("rank");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build filter object
    const filter = {};

    if (rank && rank !== "all") {
      filter["rank.level"] = rank;
    }

    if (status && status !== "all") {
      switch (status) {
        case "active":
          filter.isActive = true;
          break;
        case "inactive":
          filter.isActive = false;
          break;
        case "with_plan":
          filter["currentPlan.isActive"] = true;
          break;
        case "expired_plan":
          filter["currentPlan.isActive"] = true;
          filter["currentPlan.expireDate"] = { $lt: new Date() };
          break;
      }
    }

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { "profile.firstName": { $regex: search, $options: "i" } },
        { "profile.lastName": { $regex: search, $options: "i" } },
        { "profile.username": { $regex: search, $options: "i" } },
        { "profile.country": { $regex: search, $options: "i" } },
      ];
    }

    // Calculate analytics
    const analyticsPipeline = [
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalBalance: { $sum: "$balance" },
          totalSpending: { $sum: "$rank.totalSpent" },
          activePlans: {
            $sum: {
              $cond: [{ $eq: ["$currentPlan.isActive", true] }, 1, 0],
            },
          },
        },
      },
    ];

    const analytics = await User.aggregate(analyticsPipeline);
    const analyticsData = analytics[0] || {
      totalUsers: 0,
      totalBalance: 0,
      totalSpending: 0,
      activePlans: 0,
    };

    // Get users with pagination
    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .select("-twoFactorCode -twoFactorCodeExpires -firebaseUid")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: users,
      analytics: analyticsData,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user analytics" },
      { status: 500 }
    );
  }
}
