import { connectToDatabase } from "@/lib/db";
import UniqueName from "@/models/UniqueName";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// GET - Fetch single unique name by ID
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        },
        { status: 400 }
      );
    }

    const uniqueName = await UniqueName.findById(id);

    if (!uniqueName) {
      return NextResponse.json(
        {
          success: false,
          error: "Unique name not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: uniqueName,
    });
  } catch (error) {
    console.error("Error fetching unique name:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch unique name",
      },
      { status: 500 }
    );
  }
}

// PUT - Update unique name by ID
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const { name, reviewUsed } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        },
        { status: 400 }
      );
    }

    // Build update object
    const updateData = {};
    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (reviewUsed !== undefined) {
      updateData.reviewUsed = reviewUsed;
    }

    const uniqueName = await UniqueName.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!uniqueName) {
      return NextResponse.json(
        {
          success: false,
          error: "Unique name not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Unique name updated successfully",
      data: uniqueName,
    });
  } catch (error) {
    console.error("Error updating unique name:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "Name already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update unique name",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete unique name by ID
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        },
        { status: 400 }
      );
    }

    const uniqueName = await UniqueName.findByIdAndDelete(id);

    if (!uniqueName) {
      return NextResponse.json(
        {
          success: false,
          error: "Unique name not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Unique name deleted successfully",
      data: uniqueName,
    });
  } catch (error) {
    console.error("Error deleting unique name:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete unique name",
      },
      { status: 500 }
    );
  }
}
