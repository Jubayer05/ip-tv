import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email, visitorId } = await request.json();

    if (!email || !visitorId) {
      return NextResponse.json(
        { success: false, error: "Email and visitorId are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Bypass 2FA for admin-created users - they are automatically trusted
    if (user.createdByAdmin) {
      return NextResponse.json({
        success: true,
        isTrusted: true, // Admin-created users bypass 2FA
      });
    }

    // Check if device is trusted
    const isTrusted = user.isDeviceTrusted(visitorId);

    return NextResponse.json({
      success: true,
      isTrusted,
    });
  } catch (error) {
    console.error("Check device error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
