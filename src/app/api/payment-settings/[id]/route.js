import { connectToDatabase } from "@/lib/db";
import PaymentSettings from "@/models/PaymentSettings";
import { NextResponse } from "next/server";

// GET single payment setting
export async function GET(request, { params }) {
  try {
    const { id } = await params; // Await params

    await connectToDatabase();

    const setting = await PaymentSettings.findById(id);
    if (!setting) {
      return NextResponse.json(
        { error: "Payment setting not found" },
        { status: 404 }
      );
    }

    // Return without sensitive data
    const { apiKey, apiSecret, ...safeData } = setting.toObject();

    return NextResponse.json({
      success: true,
      data: safeData,
    });
  } catch (error) {
    console.error("Get payment setting error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment setting" },
      { status: 500 }
    );
  }
}

// PUT update payment setting
export async function PUT(request, { params }) {
  try {
    const { id } = await params; // Await params
    const data = await request.json();

    await connectToDatabase();

    const setting = await PaymentSettings.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!setting) {
      return NextResponse.json(
        { error: "Payment setting not found" },
        { status: 404 }
      );
    }

    // Return without sensitive data
    const { apiKey, apiSecret, ...safeData } = setting.toObject();

    return NextResponse.json({
      success: true,
      data: safeData,
    });
  } catch (error) {
    console.error("Update payment setting error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update payment setting" },
      { status: 500 }
    );
  }
}

// DELETE payment setting
export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // Await params

    await connectToDatabase();

    const setting = await PaymentSettings.findByIdAndDelete(id);
    if (!setting) {
      return NextResponse.json(
        { error: "Payment setting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment setting deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment setting error:", error);
    return NextResponse.json(
      { error: "Failed to delete payment setting" },
      { status: 500 }
    );
  }
}
