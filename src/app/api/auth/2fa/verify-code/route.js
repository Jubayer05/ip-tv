import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email, code, visitorId, deviceInfo } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Email and code are required" },
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

    // Check if code exists and is not expired
    if (!user.twoFactorCode || !user.twoFactorCodeExpires) {
      return NextResponse.json(
        {
          success: false,
          error: "No 2FA code found. Please request a new one.",
        },
        { status: 400 }
      );
    }

    if (new Date() > user.twoFactorCodeExpires) {
      // Clear expired code using updateOne
      await User.updateOne(
        { email: email },
        {
          $unset: {
            twoFactorCode: "",
            twoFactorCodeExpires: "",
          },
        }
      );

      return NextResponse.json(
        {
          success: false,
          error: "2FA code has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Verify code
    if (user.twoFactorCode !== code) {
      return NextResponse.json(
        { success: false, error: "Invalid 2FA code" },
        { status: 400 }
      );
    }

    // Clear the used code using updateOne
    await User.updateOne(
      { email: email },
      {
        $unset: {
          twoFactorCode: "",
          twoFactorCodeExpires: "",
        },
      }
    );

    // Add device as trusted if visitorId is provided
    if (visitorId && deviceInfo) {
      await user.addTrustedDevice(visitorId, deviceInfo);
    }

    return NextResponse.json({
      success: true,
      message: "2FA verification successful",
    });
  } catch (error) {
    console.error("2FA verify code error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
