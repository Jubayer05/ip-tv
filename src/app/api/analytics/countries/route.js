import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const sortBy = searchParams.get("sortBy") || "users";
    const search = searchParams.get("search");

    // Build filter object
    const filter = {};
    if (search) {
      filter["profile.country"] = { $regex: search, $options: "i" };
    }

    // Get country-wise user statistics
    const countryStatsPipeline = [
      {
        $match: {
          ...filter,
          "profile.country": { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$profile.country",
          users: { $sum: 1 },
          totalSpent: { $sum: "$rank.totalSpent" },
          totalBalance: { $sum: "$balance" },
        },
      },
    ];

    // Get country-wise order statistics
    const countryOrderStatsPipeline = [
      {
        $match: {
          status: "completed",
          userId: { $exists: true },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $match: {
          "user.profile.country": { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$user.profile.country",
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
    ];

    // Execute both pipelines
    const [userStats, orderStats] = await Promise.all([
      User.aggregate(countryStatsPipeline),
      Order.aggregate(countryOrderStatsPipeline),
    ]);

    // Merge the results
    const countryMap = new Map();

    // Add user statistics
    userStats.forEach((stat) => {
      countryMap.set(stat._id, {
        country: stat._id,
        users: stat.users,
        totalSpent: stat.totalSpent || 0,
        totalBalance: stat.totalBalance || 0,
        orders: 0,
        revenue: 0,
        averageOrderValue: 0,
      });
    });

    // Add order statistics
    orderStats.forEach((stat) => {
      const existing = countryMap.get(stat._id);
      if (existing) {
        existing.orders = stat.orders;
        existing.revenue = stat.revenue;
        existing.averageOrderValue = stat.averageOrderValue;
      } else {
        countryMap.set(stat._id, {
          country: stat._id,
          users: 0,
          totalSpent: 0,
          totalBalance: 0,
          orders: stat.orders,
          revenue: stat.revenue,
          averageOrderValue: stat.averageOrderValue,
        });
      }
    });

    // Convert to array and sort
    let countryData = Array.from(countryMap.values());

    // Sort based on sortBy parameter
    switch (sortBy) {
      case "revenue":
        countryData.sort((a, b) => b.revenue - a.revenue);
        break;
      case "orders":
        countryData.sort((a, b) => b.orders - a.orders);
        break;
      case "alphabetical":
        countryData.sort((a, b) => a.country.localeCompare(b.country));
        break;
      default: // users
        countryData.sort((a, b) => b.users - a.users);
    }

    // Add ranking and market share
    const totalUsers = countryData.reduce(
      (sum, country) => sum + country.users,
      0
    );
    const totalRevenue = countryData.reduce(
      (sum, country) => sum + country.revenue,
      0
    );

    countryData = countryData.map((country, index) => ({
      ...country,
      rank: index + 1,
      marketShare: totalUsers > 0 ? (country.users / totalUsers) * 100 : 0,
    }));

    // Calculate analytics
    const analytics = {
      totalCountries: countryData.length,
      totalUsers,
      totalRevenue,
      topCountry: countryData.length > 0 ? countryData[0].country : "N/A",
    };

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedData = countryData.slice(skip, skip + limit);
    const total = countryData.length;
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: paginatedData,
      analytics,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching country analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch country analytics" },
      { status: 500 }
    );
  }
}
