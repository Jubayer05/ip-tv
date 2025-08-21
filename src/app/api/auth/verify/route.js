import { connectToDatabase } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { NextResponse } from "next/server";

// Initialize Firebase (you'll need to add your config)
const firebaseConfig = {
  // Your Firebase config here - make sure these match your .env.local
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.FIREBASE_AUTH_DOMAIN,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

let app, auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const { token, password, firebaseUid } = await request.json();
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    const verificationTokenDoc = await VerificationToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationTokenDoc) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const email = verificationTokenDoc.email.toLowerCase().trim();
    const existingUser = await User.findOne({ email });
    // Read user data from token.userData
    const firstNameRaw = verificationTokenDoc.firstName || "";
    const lastNameRaw = verificationTokenDoc.lastName || "";
    let usernameRaw = verificationTokenDoc.username || "";

    const firstName = String(firstNameRaw).trim();
    const lastName = String(lastNameRaw).trim();
    let username = String(usernameRaw).trim();

    // Helper to generate unique username
    const slugify = (s) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 30) || "user";
    async function generateUniqueUsername(base) {
      let candidate = slugify(base);
      let i = 0;
      for (; i < 100; i++) {
        const exists = await User.exists({ "profile.username": candidate });
        if (!exists) return candidate;
        candidate = `${slugify(base).slice(0, 25)}${i + 1}`;
      }
      return `${slugify(base).slice(0, 24)}${Math.floor(
        Math.random() * 10000
      )}`;
    }

    if (!username) {
      const base = firstName || email.split("@")[0];
      username = await generateUniqueUsername(base);
    }

    if (existingUser) {
      // Update existing user with any missing fields instead of erroring
      existingUser.profile = {
        ...existingUser.profile,
        firstName:
          firstName || existingUser.profile?.firstName || email.split("@")[0],
        lastName: lastName || existingUser.profile?.lastName || "",
        username: existingUser.profile?.username || username,
      };
      if (firebaseUid && !existingUser.firebaseUid) {
        existingUser.firebaseUid = firebaseUid;
      }
      await existingUser.save();

      verificationTokenDoc.used = true;
      await verificationTokenDoc.save();

      await sendWelcomeEmail(
        email,
        firstName || existingUser.profile.firstName
      );

      return NextResponse.json({
        success: true,
        message: "Account verified successfully",
        user: {
          id: existingUser._id,
          email: existingUser.email,
          profile: existingUser.profile,
          role: existingUser.role,
        },
      });
    }

    // Create new user
    const user = new User({
      email,
      firebaseUid: firebaseUid || undefined,
      profile: {
        firstName: firstName || email.split("@")[0],
        lastName: lastName || "",
        username,
      },
      balance: 0,
      rank: { level: "bronze", totalSpent: 0, discountPercentage: 5 },
      referral: { code: null, referredBy: null, earnings: 0 },
      settings: { notifications: true, twoFactorEnabled: false },
      role: "user",
      isActive: true,
      lastLogin: new Date(),
    });

    await user.save();

    verificationTokenDoc.used = true;
    await verificationTokenDoc.save();

    await sendWelcomeEmail(email, firstName || user.profile.firstName);

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Welcome to Cheap Stream.",
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: "Failed to create user account. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(_req, { params }) {
  try {
    await connectToDatabase();
    const { token } = params;
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const doc = await VerificationToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      email: doc.email,
      firstName: doc.userData?.firstName || "",
      lastName: doc.userData?.lastName || "",
      username: doc.userData?.username || null,
    });
  } catch (e) {
    console.error("Verify GET error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
