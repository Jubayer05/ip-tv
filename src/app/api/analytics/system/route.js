import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const paymentMethod = searchParams.get("paymentMethod");
    const search = searchParams.get("search");

    // Build filter object
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (paymentMethod && paymentMethod !== "all") {
      if (paymentMethod === "manual") {
        filter.paymentGateway = { $in: ["None", "Manual"] };
      } else {
        filter.paymentGateway = paymentMethod;
      }
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "contactInfo.fullName": { $regex: search, $options: "i" } },
        { "contactInfo.email": { $regex: search, $options: "i" } },
      ];
    }

    // Calculate analytics
    const analyticsPipeline = [
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
        },
      },
    ];

    const analytics = await Order.aggregate(analyticsPipeline);
    const analyticsData = analytics[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      completedOrders: 0,
      pendingOrders: 0,
    };

    // Get most popular plans
    const popularPlansPipeline = [
      { $match: { status: "completed" } },
      { $unwind: "$products" },
      {
        $group: {
          _id: {
            planName: "$products.planName",
            duration: "$products.duration",
            devicesAllowed: "$products.devicesAllowed",
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$products.price" },
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 },
      {
        $project: {
          planName: "$_id.planName",
          duration: "$_id.duration",
          devicesAllowed: "$_id.devicesAllowed",
          totalOrders: 1,
          totalRevenue: 1,
        },
      },
    ];

    const popularPlans = await Order.aggregate(popularPlansPipeline);

    // Get device statistics
    const deviceStatsPipeline = [
      { $match: { status: "completed" } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.devicesAllowed",
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          deviceCount: "$_id",
          totalOrders: 1,
        },
      },
    ];

    const deviceStatsRaw = await Order.aggregate(deviceStatsPipeline);
    const totalDeviceOrders = deviceStatsRaw.reduce(
      (sum, stat) => sum + stat.totalOrders,
      0
    );
    const deviceStats = deviceStatsRaw.map((stat) => ({
      ...stat,
      percentage:
        totalDeviceOrders > 0
          ? Math.round((stat.totalOrders / totalDeviceOrders) * 100)
          : 0,
    }));

    // Get most popular plan name
    if (popularPlans.length > 0) {
      analyticsData.mostPopularPlan = popularPlans[0].planName || "Unknown";
    }

    // Get orders with pagination
    const skip = (page - 1) * limit;
    const orders = await Order.find(filter)
      .populate("userId", "email profile.firstName profile.lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: orders,
      analytics: analyticsData,
      popularPlans,
      deviceStats,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching system analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch system analytics" },
      { status: 500 }
    );
  }
}
