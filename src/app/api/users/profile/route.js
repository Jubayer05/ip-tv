import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET - Fetch user profile
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    if (!email && !userId) {
      return NextResponse.json(
        { success: false, error: "Email or userId is required" },
        { status: 400 }
      );
    }

    let user;
    if (userId) {
      // Search by MongoDB document ID
      user = await User.findById(userId).select(
        "profile role email balance rank referral settings isActive lastLogin createdAt updatedAt freeTrial"
      );
    } else {
      // Search by email (existing logic)
      user = await User.findOne({ email }).select(
        "profile role email balance rank referral settings isActive lastLogin createdAt updatedAt freeTrial"
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        username: user.profile?.username || "",
        dateOfBirth: user.profile?.dateOfBirth || null,
        country: user.profile?.country || "",
        phone: user.profile?.phone || "",
        avatar: user.profile?.avatar || "",
        email: user.email,
        role: user.role,
        balance: user.balance || 0,
        rank: user.rank || {
          level: "bronze",
          totalSpent: 0,
          discountPercentage: 5,
        },
        referral: user.referral || {
          code: null,
          referredBy: null,
          earnings: 0,
        },
        settings: {
          notifications: true,
        },
        freeTrial: user.freeTrial || {
          hasUsed: false,
          usedAt: null,
          trialData: null,
        },
        isActive: user.isActive !== false,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email, profile } = body;

    if (!email || !profile) {
      return NextResponse.json(
        { success: false, error: "Email and profile data are required" },
        { status: 400 }
      );
    }

    // Validate profile data
    if (profile.firstName && profile.firstName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "First name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (profile.username && profile.username.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Validate date of birth
    if (profile.dateOfBirth && new Date(profile.dateOfBirth) > new Date()) {
      return NextResponse.json(
        { success: false, error: "Date of birth cannot be in the future" },
        { status: 400 }
      );
    }

    // Check if username is already taken by another user
    if (profile.username) {
      const existingUser = await User.findOne({
        email: { $ne: email },
        "profile.username": profile.username.trim(),
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // Update user profile - remove photoUrl from the update
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          "profile.firstName": profile.firstName?.trim() || "",
          "profile.lastName": profile.lastName?.trim() || "",
          "profile.username": profile.username?.trim() || "",
          // Remove photoUrl from here
          "profile.dateOfBirth": profile.dateOfBirth || null,
          "profile.country": profile.country?.trim() || "",
          "profile.phone": profile.phone || "",
          "profile.avatar": profile.avatar || "",
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        firstName: updatedUser.profile?.firstName || "",
        lastName: updatedUser.profile?.lastName || "",
        username: updatedUser.profile?.username || "",
        photoUrl: updatedUser.profile?.photoUrl || "",
        dateOfBirth: updatedUser.profile?.dateOfBirth || null,
        country: updatedUser.profile?.country || "",
        phone: updatedUser.profile?.phone || "",
        avatar: updatedUser.profile?.avatar || "",
        email: updatedUser.email,
        role: updatedUser.role,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
