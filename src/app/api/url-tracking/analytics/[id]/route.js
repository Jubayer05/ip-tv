import { connectToDatabase } from "@/lib/db";
import UrlClickTracking from "@/models/UrlClickTracking";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all"; // 1day, 7days, 30days, all

    // Calculate date filter based on period
    let dateFilter = {};
    if (period !== "all") {
      const now = new Date();
      let startDate = new Date();

      if (period === "1day") {
        startDate.setDate(now.getDate() - 1);
      } else if (period === "7days") {
        startDate.setDate(now.getDate() - 7);
      } else if (period === "30days") {
        startDate.setDate(now.getDate() - 30);
      }

      dateFilter = {
        lastClickAt: { $gte: startDate },
      };
    }

    // Get all clicks for this URL tracking with date filter
    const clicks = await UrlClickTracking.find({
      urlTrackingId: id,
      ...dateFilter,
    }).sort({ lastClickAt: -1 });

    // Aggregate statistics
    const stats = {
      totalClicks: clicks.reduce((sum, click) => sum + click.clickCount, 0),
      uniqueVisitors: clicks.length,
      byPlatform: {},
      byCountry: {},
      byBrowser: {},
      byOS: {},
    };

    clicks.forEach((click) => {
      // Count by platform
      const platform = click.deviceInfo?.platform || "Unknown";
      stats.byPlatform[platform] =
        (stats.byPlatform[platform] || 0) + click.clickCount;

      // Count by country
      const country = click.location?.country || "Unknown";
      stats.byCountry[country] =
        (stats.byCountry[country] || 0) + click.clickCount;

      // Count by browser
      const browser = click.deviceInfo?.browser || "Unknown";
      stats.byBrowser[browser] =
        (stats.byBrowser[browser] || 0) + click.clickCount;

      // Count by OS
      const os = click.deviceInfo?.os || "Unknown";
      stats.byOS[os] = (stats.byOS[os] || 0) + click.clickCount;
    });

    return NextResponse.json({
      success: true,
      data: {
        clicks,
        stats,
        period,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
