import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Check OTP from memory store
    global.guestOtps = global.guestOtps || new Map();
    const storedData = global.guestOtps.get(email);

    if (!storedData) {
      return NextResponse.json(
        { error: "OTP not found or expired" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > storedData.expiresAt) {
      global.guestOtps.delete(email);
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      global.guestOtps.delete(email);
      return NextResponse.json(
        { error: "Too many failed attempts" },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts++;
      global.guestOtps.set(email, storedData);
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // OTP is valid, fetch orders for this email
    await connectToDatabase();
    const orders = await Order.find({
      $or: [{ "contactInfo.email": email }, { guestEmail: email }],
    })
      .populate("products")
      .sort({ createdAt: -1 })
      .lean();

    // Clean up OTP
    global.guestOtps.delete(email);

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      orders: orders,
    });
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
