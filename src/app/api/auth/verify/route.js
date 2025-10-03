import { connectToDatabase } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { NextResponse } from "next/server";

// Helper function to generate unique username
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
  return `${slugify(base).slice(0, 24)}${Math.floor(Math.random() * 10000)}`;
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const { token, password, firebaseUid } = await request.json();
    console.log(firebaseUid);
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

    console.log(verificationTokenDoc);

    if (!verificationTokenDoc) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const email = verificationTokenDoc.email.toLowerCase().trim();
    const existingUser = await User.findOne({ email });
    // Read user data from token
    const firstNameRaw = verificationTokenDoc.firstName || "";
    const lastNameRaw = verificationTokenDoc.lastName || "";
    let usernameRaw = verificationTokenDoc.username || "";

    const firstName = String(firstNameRaw).trim();
    const lastName = String(lastNameRaw).trim();
    let username = String(usernameRaw).trim();

    if (!username) {
      const base = firstName || email.split("@")[0];
      username = await generateUniqueUsername(base);
    }

    if (existingUser) {
      // Update existing user with any missing fields
      existingUser.profile = {
        ...existingUser.profile,
        firstName:
          firstName || existingUser.profile?.firstName || email.split("@")[0],
        lastName: lastName || existingUser.profile?.lastName || "",
        username: existingUser.profile?.username || username,
        country: verificationTokenDoc.country || "Unknown",
      };
      if (firebaseUid && !existingUser.firebase?.uid) {
        existingUser.firebase = {
          ...(existingUser.firebase || {}),
          uid: firebaseUid,
          provider: existingUser.firebase?.provider || "email",
          emailVerified: true,
        };
        existingUser.firebaseUid = firebaseUid; // Add this line
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
    const userData = {
      email,
      profile: {
        firstName: firstName || email.split("@")[0],
        lastName: lastName || "",
        username,
        country: verificationTokenDoc.country || "Unknown",
      },
      balance: 0,
      rank: { level: "bronze", totalSpent: 0, discountPercentage: 5 },
      referral: { code: null, referredBy: null, earnings: 0 },
      settings: { notifications: true },
      role: "user",
      isActive: true,
      lastLogin: new Date(),
    };

    // Add firebase object with uid if firebaseUid is provided
    if (
      firebaseUid &&
      typeof firebaseUid === "string" &&
      firebaseUid.trim() !== ""
    ) {
      userData.firebase = {
        uid: firebaseUid,
        provider: "email",
        emailVerified: true,
      };
      userData.firebaseUid = firebaseUid; // Add this line
    }

    const user = new User(userData);

    // If a referral code was provided, set referredBy
    const rawCode = verificationTokenDoc.referralCode;
    if (rawCode) {
      const code = String(rawCode).toUpperCase();
      const referrer = await User.findOne({ "referral.code": code });
      if (referrer) {
        user.referral.referredBy = referrer._id;
      }
    }

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

    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    const verificationToken = await VerificationToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Token is valid",
      email: verificationToken.email,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}
