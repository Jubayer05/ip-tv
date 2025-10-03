import { connectToDatabase } from "@/lib/db";
import Ad from "@/models/Ad";
import { NextResponse } from "next/server";

// GET - Fetch single ad
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const ad = await Ad.findById(id).populate("createdBy", "name email");

    if (!ad) {
      return NextResponse.json(
        { success: false, error: "Ad not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error("Error fetching ad:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ad" },
      { status: 500 }
    );
  }
}

// PUT - Update ad
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const data = await request.json();

    const ad = await Ad.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!ad) {
      return NextResponse.json(
        { success: false, error: "Ad not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update ad" },
      { status: 500 }
    );
  }
}

// DELETE - Delete ad
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const ad = await Ad.findByIdAndDelete(id);

    if (!ad) {
      return NextResponse.json(
        { success: false, error: "Ad not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ad deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete ad" },
      { status: 500 }
    );
  }
}
