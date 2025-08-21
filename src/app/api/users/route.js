import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET all users (admin only)
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };
    if (role && role !== "all") {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { "profile.firstName": { $regex: search, $options: "i" } },
        { "profile.lastName": { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST create new user
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { firebaseUid, email, profile, role = "user" } = body;

    console.log("PROFILE:", profile);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { firebaseUid }],
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 400 }
      );
    }

    // Backfill required profile fields - only use fallbacks if values are truly missing
    const normalizedEmail = (email || "").toLowerCase().trim();

    // Only use fallback if the value is completely missing or empty
    const firstName =
      profile?.firstName?.trim() || normalizedEmail.split("@")[0];
    const lastName = profile?.lastName?.trim() || ""; // Don't fallback lastName

    // Use the username if provided, otherwise generate one
    let username = profile?.username?.trim();

    // Only generate username if none was provided
    if (!username) {
      username = await generateUniqueUsername(
        firstName || normalizedEmail.split("@")[0]
      );
    }

    // Validate that we have the required fields
    if (!firstName) {
      return NextResponse.json(
        { success: false, error: "First name is required" },
        { status: 400 }
      );
    }

    // Helper: slugify base string
    const slugify = (s) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .replace(/(^-+|-+$)/g, "")
        .slice(0, 30) || "user";

    // Ensure unique username under profile.username
    async function generateUniqueUsername(base) {
      let candidate = slugify(base);
      let suffix = 0;
      // Try base, then base + numeric suffix until unique
      // Guard with reasonable cap to prevent infinite loop
      for (let i = 0; i < 100; i++) {
        const exists = await User.exists({ "profile.username": candidate });
        if (!exists) return candidate;
        suffix += 1;
        candidate = `${slugify(base).slice(0, 25)}${suffix}`;
      }
      // Fallback with random
      return `${slugify(base).slice(0, 24)}${Math.floor(
        Math.random() * 10000
      )}`;
    }

    const user = new User({
      firebaseUid,
      email: normalizedEmail,
      profile: {
        firstName,
        lastName,
        username,
      },
      role,
    });

    await user.save();

    return NextResponse.json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
