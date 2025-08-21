import { connectToDatabase } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email, firstName, lastName, username } = await request.json();

    

    // Validation - firstName and lastName are required
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, first name, and last name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Check if username is taken (if username is provided)
    if (username) {
      const existingUsername = await User.findOne({
        "profile.username": username,
      });
      if (existingUsername) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        );
      }
    }

    // Create verification token with user data (firstName, lastName, username)
    console.log("About to create token with userData:", {
      firstName,
      lastName,
      username: username || null,
    });

    const verificationToken = await VerificationToken.createToken(email, {
      firstName,
      lastName,
      username: username || null,
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(
      email,
      verificationToken.token,
      firstName
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Verification email sent successfully. Please check your email to complete registration.",
      email: email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
