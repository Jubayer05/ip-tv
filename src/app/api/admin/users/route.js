import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
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

// GET - Fetch users with pagination and search
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { "profile.firstName": { $regex: search, $options: "i" } },
        { "profile.lastName": { $regex: search, $options: "i" } },
        { "profile.username": { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      query.role = role;
    }

    const skip = (page - 1) * limit;

    // Get users and total count
    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select("-password -resetPasswordToken -resetPasswordExpires")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email, password, role = "user", profile = {} } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 400 }
      );
    }

    // Check if user already exists in Firebase
    let firebaseUser = null;
    try {
      firebaseUser = await admin.auth().getUserByEmail(email);
      if (firebaseUser) {
        return NextResponse.json(
          {
            success: false,
            error:
              "User with this email already exists in authentication system",
          },
          { status: 400 }
        );
      }
    } catch (error) {
      // User doesn't exist in Firebase, which is what we want
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // Create Firebase user first
    let firebaseUid;
    try {
      const newFirebaseUser = await admin.auth().createUser({
        email: email.toLowerCase().trim(),
        password: password,
        emailVerified: true, // Admin created users are pre-verified
        displayName: profile.firstName
          ? `${profile.firstName} ${profile.lastName || ""}`.trim()
          : undefined,
      });
      firebaseUid = newFirebaseUser.uid;
    } catch (firebaseError) {
      console.error("Firebase user creation error:", firebaseError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create user in authentication system",
          details: firebaseError.message,
        },
        { status: 500 }
      );
    }

    // Create MongoDB user with Firebase UID
    const newUser = new User({
      email: email.toLowerCase().trim(),
      password, // Store password in MongoDB for reference (Firebase handles auth)
      firebaseUid, // Link to Firebase user
      role,
      createdByAdmin: true, // Mark as admin-created to bypass 2FA
      profile: {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        username: profile.username || "",
        avatar: profile.avatar || "",
        ...profile,
      },
      isEmailVerified: true, // Admin created users are pre-verified
      firebase: {
        uid: firebaseUid,
        provider: "email",
        emailVerified: true,
      },
    });

    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    // If MongoDB user creation failed but Firebase user was created, try to clean up
    if (firebaseUid) {
      try {
        await admin.auth().deleteUser(firebaseUid);
      } catch (cleanupError) {
        console.error("Error cleaning up Firebase user:", cleanupError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
