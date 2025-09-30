import { connectToDatabase } from "@/lib/db";
import RankSystem from "@/models/RankSystem";
import { NextResponse } from "next/server";

// GET - Fetch single rank system
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const rankSystem = await RankSystem.findById(id).select("-__v");
    if (!rankSystem) {
      return NextResponse.json(
        { success: false, error: "Rank system not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rankSystem,
    });
  } catch (error) {
    console.error("Error fetching rank system:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rank system" },
      { status: 500 }
    );
  }
}

// PUT - Update rank system
export async function PUT(request, { params }) {
  try {
    // TODO: Add proper admin authentication here
    // For now, allowing all PUT requests - implement proper auth middleware

    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    // Check if rank system exists
    const existingRank = await RankSystem.findById(id);
    if (!existingRank) {
      return NextResponse.json(
        { success: false, error: "Rank system not found" },
        { status: 404 }
      );
    }

    // If name is being updated, check for duplicates
    if (body.name && body.name !== existingRank.name) {
      const duplicateName = await RankSystem.findOne({ name: body.name });
      if (duplicateName) {
        return NextResponse.json(
          { success: false, error: "Rank name already exists" },
          { status: 400 }
        );
      }
    }

    // If order is being updated, check for duplicates
    if (body.order && body.order !== existingRank.order) {
      const duplicateOrder = await RankSystem.findOne({ order: body.order });
      if (duplicateOrder) {
        return NextResponse.json(
          { success: false, error: "Order number already exists" },
          { status: 400 }
        );
      }
    }

    const updatedRank = await RankSystem.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).select("-__v");

    return NextResponse.json({
      success: true,
      data: updatedRank,
      message: "Rank system updated successfully",
    });
  } catch (error) {
    console.error("Error updating rank system:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update rank system" },
      { status: 500 }
    );
  }
}

// DELETE - Delete rank system (hard delete)
export async function DELETE(request, { params }) {
  try {
    // TODO: Add proper admin authentication here
    // For now, allowing all DELETE requests - implement proper auth middleware

    await connectToDatabase();
    const { id } = await params;

    const rankSystem = await RankSystem.findById(id);
    if (!rankSystem) {
      return NextResponse.json(
        { success: false, error: "Rank system not found" },
        { status: 404 }
      );
    }

    // Hard delete by removing the document completely
    await RankSystem.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Rank system deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting rank system:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete rank system" },
      { status: 500 }
    );
  }
}
