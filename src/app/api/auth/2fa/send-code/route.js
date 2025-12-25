import { connectToDatabase } from "@/lib/db";
import { send2FACodeEmail } from "@/lib/email";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user or create if not exists (for admin-created or social login users)
    let user = await User.findOne({ email });
    if (!user) {
      // Create user in MongoDB for users that exist in Firebase but not MongoDB
      // This can happen with admin-created users or social login
      try {
        user = await User.create({
          email,
          profile: {
            firstName: email.split("@")[0],
            lastName: "",
            username: email.split("@")[0],
          },
          role: "user",
          isActive: true,
          emailVerified: true,
        });
      } catch (createError) {
        console.error("Failed to create user for 2FA:", createError);
        return NextResponse.json(
          { success: false, error: "User account setup failed. Please contact support." },
          { status: 500 }
        );
      }
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code in user document with expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Use updateOne instead of save() to avoid validation issues
    const updateResult = await User.updateOne(
      { email: email },
      {
        $set: {
          twoFactorCode: code,
          twoFactorCodeExpires: expiresAt,
        },
      }
    );

    if (!updateResult.acknowledged) {
      return NextResponse.json(
        { success: false, error: "Failed to save 2FA code" },
        { status: 500 }
      );
    }

    // Verify the code was actually stored
    await User.findOne({ email });

    // Send email - use firstName if available, otherwise use email
    const firstName = user.profile?.firstName || email.split("@")[0];
    const emailSent = await send2FACodeEmail(email, code, firstName);

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: "Failed to send 2FA code" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "2FA code sent successfully",
      expiresIn: 5 * 60 * 1000, // 5 minutes in milliseconds
    });
  } catch (error) {
    console.error("2FA send code error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
