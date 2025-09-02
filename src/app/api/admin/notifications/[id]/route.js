import { connectToDatabase } from "@/lib/db";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

// GET - Get single notification
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const notification = await Notification.findById(params.id);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update notification
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const notification = await Notification.findByIdAndUpdate(
      params.id,
      {
        ...body,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
        validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification updated successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = {};
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const notification = await Notification.findByIdAndDelete(params.id);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
