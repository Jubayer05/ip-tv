import { connectToDatabase } from "@/lib/db";
import RankSystem from "@/models/RankSystem";
import { NextResponse } from "next/server";

// GET - Fetch all rank systems
export async function GET(request) {
  try {
    await connectToDatabase();

    const rankSystems = await RankSystem.find({ isActive: true })
      .sort({ order: 1 })
      .select("-__v");

    return NextResponse.json({
      success: true,
      data: rankSystems,
    });
  } catch (error) {
    console.error("Error fetching rank systems:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rank systems" },
      { status: 500 }
    );
  }
}

// POST - Create new rank system
export async function POST(request) {
  try {
    // TODO: Add proper admin authentication here
    // For now, allowing all POST requests - implement proper auth middleware

    await connectToDatabase();
    const body = await request.json();

    // Validate required fields
    if (
      !body.name ||
      !body.benefits ||
      !body.spending ||
      !body.discount ||
      !body.order
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if name already exists
    const existingRank = await RankSystem.findOne({ name: body.name });
    if (existingRank) {
      return NextResponse.json(
        { success: false, error: "Rank name already exists" },
        { status: 400 }
      );
    }

    // Check if order already exists
    const existingOrder = await RankSystem.findOne({ order: body.order });
    if (existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order number already exists" },
        { status: 400 }
      );
    }

    const rankSystem = new RankSystem(body);
    await rankSystem.save();

    return NextResponse.json({
      success: true,
      data: rankSystem,
      message: "Rank system created successfully",
    });
  } catch (error) {
    console.error("Error creating rank system:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create rank system" },
      { status: 500 }
    );
  }
}
