import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { uid, email, displayName, photoURL, provider, emailVerified } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists by Firebase UID or email
    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email: email }],
    });

    if (user) {
      // Update existing user with Firebase data
      user.firebaseUid = uid; // Add this line
      user.firebase = {
        uid: uid,
        provider: provider,
        emailVerified: emailVerified,
      };

      if (displayName && !user.profile.firstName) {
        const nameParts = displayName.split(" ");
        user.profile.firstName = nameParts[0] || "";
        user.profile.lastName = nameParts.slice(1).join(" ") || "";
      }

      // Only update avatar if it's a valid ImgBB URL or null
      if (photoURL) {
        user.profile.avatar = photoURL;
      } else if (photoURL) {
        // If it's not an ImgBB URL, set to null
        user.profile.avatar = null;
      }

      user.emailVerified = emailVerified;
      await user.save();
    } else {
      // Create new user
      const nameParts = displayName ? displayName.split(" ") : ["", ""];

      // Generate a unique username from email
      const emailPrefix = email.split("@")[0];
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const username = `${emailPrefix}_${randomSuffix}`;

      user = new User({
        email: email,
        firebaseUid: uid, // Add this line
        emailVerified: emailVerified,
        profile: {
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          username: username, // Add required username
          avatar:
            photoURL && photoURL.startsWith("https://i.ibb.co/")
              ? photoURL
              : null, // Only set if valid ImgBB URL
        },
        firebase: {
          uid: uid,
          provider: provider,
          emailVerified: emailVerified,
        },
        role: "user",
        isActive: true,
      });

      await user.save();
    }

    

    // Generate JWT access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Generate refresh token (longer expiration)
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        type: "refresh",
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Social login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
