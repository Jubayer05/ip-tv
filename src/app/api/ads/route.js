import { connectToDatabase } from "@/lib/db";
import Ad from "@/models/Ad";
import { NextResponse } from "next/server";

// GET - Fetch all ads
export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    let query = {};

    if (isActive !== null) query.isActive = isActive === "true";

    const ads = await Ad.find(query)
      .populate("createdBy", "name email")
      .sort({ sortOrder: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: ads,
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ads" },
      { status: 500 }
    );
  }
}

// POST - Create new ad
export async function POST(request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const { userId } = data;

    // Validate required fields
    const requiredFields = ["title", "description", "imageUrl", "linkUrl"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const ad = new Ad({
      ...data,
      createdBy: userId,
    });

    await ad.save();
    await ad.populate("createdBy", "name email");

    return NextResponse.json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create ad" },
      { status: 500 }
    );
  }
}
