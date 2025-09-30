import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email, visitorId } = await request.json();

    if (!email || !visitorId) {
      return NextResponse.json(
        { success: false, error: "Email and visitor ID are required" },
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

    // Check if device is trusted
    const isTrustedDevice = user.isDeviceTrusted(visitorId);

    return NextResponse.json({
      success: true,
      isTrustedDevice,
      user: {
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Trusted device check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check trusted device" },
      { status: 500 }
    );
  }
}
