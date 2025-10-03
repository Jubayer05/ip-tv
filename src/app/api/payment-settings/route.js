import { connectToDatabase } from "@/lib/db";
import PaymentSettings from "@/models/PaymentSettings";
import { NextResponse } from "next/server";

// GET all payment settings
export async function GET() {
  try {
    await connectToDatabase();

    const settings = await PaymentSettings.find().sort({
      sortOrder: 1,
      createdAt: 1,
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get payment settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment settings" },
      { status: 500 }
    );
  }
}

// POST new payment setting
export async function POST(request) {
  try {
    const data = await request.json();

    await connectToDatabase();

    // Check if gateway already exists
    const existing = await PaymentSettings.findOne({ gateway: data.gateway });
    if (existing) {
      return NextResponse.json(
        { error: "Payment gateway already exists" },
        { status: 400 }
      );
    }

    const setting = new PaymentSettings(data);
    await setting.save();

    // Return without sensitive data
    const { apiKey, apiSecret, ...safeData } = setting.toObject();

    return NextResponse.json({
      success: true,
      data: safeData,
    });
  } catch (error) {
    console.error("Create payment setting error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment setting" },
      { status: 500 }
    );
  }
}
