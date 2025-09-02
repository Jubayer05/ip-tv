import { connectToDatabase } from "@/lib/db";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

// GET /api/reviews/stats - Get review statistics
export async function GET() {
  try {
    await connectToDatabase();

    const stats = await Review.getAverageRating();

    const result = stats[0] || {
      averageRating: 0,
      totalReviews: 0,
      starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching review stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review stats" },
      { status: 500 }
    );
  }
}
