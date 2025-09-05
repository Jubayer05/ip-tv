import { connectToDatabase } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      username,
      referralCode,
      recaptchaToken,
    } = body;

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: "reCAPTCHA verification required" },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA with Google
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=6LdAb78rAAAAAKUj7PC7u_NqvaFPyruSbxTwBho3&response=${recaptchaToken}`,
      { method: "POST" }
    );

    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }

    await connectToDatabase();

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

    // Create verification token with user data (firstName, lastName, username, referralCode)
    const verificationToken = await VerificationToken.createToken(email, {
      firstName,
      lastName,
      username: username || null,
      referralCode: referralCode ? String(referralCode).toUpperCase() : null,
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
