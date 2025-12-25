import { connectToDatabase } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import Settings from "@/models/Settings";
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
      country,
      countryCode,
    } = body;

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

    // Verify reCAPTCHA only if token is provided
    if (recaptchaToken) {
      // Get reCAPTCHA secret key from database
      const settings = await Settings.getSettings();
      const secretKey = settings.apiKeys?.recaptcha?.secretKey;

      if (!secretKey) {
        return NextResponse.json(
          { error: "reCAPTCHA secret key not configured" },
          { status: 500 }
        );
      }

      const recaptchaResponse = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`,
        { method: "POST" }
      );

      const recaptchaData = await recaptchaResponse.json();

      if (!recaptchaData.success) {
        return NextResponse.json(
          { error: "reCAPTCHA verification failed" },
          { status: 400 }
        );
      }
    }

    // Create verification token with user data
    const verificationToken = await VerificationToken.createToken(email, {
      firstName,
      lastName,
      username: username || null,
      referralCode: referralCode ? String(referralCode).toUpperCase() : null,
      country: country || "Unknown",
      countryCode: countryCode || "XX",
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(
      email,
      verificationToken.token,
      firstName
    );

    if (!emailSent) {
      // BYPASSING THE ERROR HANDLING FOR NOW!
      // If email fails, clean up the token
      // await VerificationToken.deleteOne({ token: verificationToken.token });
      // return NextResponse.json(
      //   { error: "Failed to send verification email. Please try again." },
      //   { status: 500 }
      // );
      // If email fails in production, return error but keep token

      // VERIFICATION URL: http://localhost:3000/verify-email?token=TOKEN
      return NextResponse.json({
        success: true,
        message: "Registration successful! Email service temporarily unavailable. Please contact support for verification link.",
        email: email,
        warning: "Email service unavailable",
      });
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
