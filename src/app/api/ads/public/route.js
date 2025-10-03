import { connectToDatabase } from "@/lib/db";
import Ad from "@/models/Ad";
import { NextResponse } from "next/server";

// GET - Fetch active ads for public display
export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 10;

    const ads = await Ad.find({ isActive: true })
      .select("title description imageUrl linkUrl sortOrder")
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: ads,
    });
  } catch (error) {
    console.error("Error fetching public ads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
