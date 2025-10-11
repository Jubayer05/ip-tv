import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import admin from "firebase-admin";
import { NextResponse } from "next/server";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, token, password } = body;

    // Validation
    if (!email || !token || !password) {
      return NextResponse.json(
        { error: "Email, token, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify token
    const verificationToken = await VerificationToken.findOne({
      email,
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update password in Firebase
    try {
      // Get Firebase user by email
      const firebaseUser = await admin.auth().getUserByEmail(email);

      // Update the password in Firebase
      await admin.auth().updateUser(firebaseUser.uid, {
        password: password,
      });

      console.log(`Password updated for user: ${email}`);
    } catch (firebaseError) {
      console.error("Firebase password update error:", firebaseError);
      return NextResponse.json(
        { error: "Failed to update password in authentication system" },
        { status: 500 }
      );
    }

    // Mark token as used
    verificationToken.used = true;
    await verificationToken.save();

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
