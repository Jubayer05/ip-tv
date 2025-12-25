import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { isSuperAdminEmail } from "@/lib/superAdmin";

export const runtime = "nodejs";

// Simple authentication middleware
async function authenticateUser(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "Authorization header required", status: 401 };
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return { error: "Server misconfiguration", status: 500 };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
    } catch (hs256Error) {
      try {
        decoded = jwt.verify(token, secret);
      } catch (defaultError) {
        console.error("JWT verification failed:", {
          hs256Error: hs256Error.message,
          defaultError: defaultError.message,
        });
        return { error: "Invalid or expired token", status: 401 };
      }
    }

    await connectToDatabase();
    let user = await User.findById(decoded.userId);

    // If user not found by ID, try finding by email
    if (!user && decoded.email) {
      user = await User.findOne({ email: decoded.email });
    }

    // If still not found, create the user (for admin-created or social login users)
    if (!user && decoded.email) {
      try {
        user = await User.create({
          email: decoded.email,
          profile: {
            firstName: decoded.email.split("@")[0],
            lastName: "",
            username: decoded.email.split("@")[0],
          },
          role: decoded.role || "user",
          isActive: true,
          emailVerified: true,
        });
      } catch (createError) {
        console.error("Failed to create user:", createError);
        return { error: "User setup failed", status: 500 };
      }
    }

    if (!user || !user.isActive) {
      return { error: "Invalid or inactive user", status: 401 };
    }

    return { user };
  } catch (error) {
    console.error("Authentication error:", error);
    return { error: "Authentication failed", status: 401 };
  }
}

// Check if user has admin access
function hasAdminAccess(user) {
  return user?.role === "admin" || isSuperAdminEmail(user?.email);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const isAdmin = searchParams.get("isAdmin") === "true";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const status = searchParams.get("status"); // Filter by payment status
    const search = searchParams.get("search"); // Search by order number or email

    let user = null;

    // Try JWT authentication first
    const authResult = await authenticateUser(request);
    if (authResult?.user) {
      user = authResult.user;
    }

    // Fallback to email-based authentication
    if (!user && email) {
      await connectToDatabase();
      user = await User.findOne({ email: email.toLowerCase() });

      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: "Invalid or inactive user" },
          { status: 401 }
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has admin access
    const isAdminUser = hasAdminAccess(user);

    let query = {};
    let orders = [];

    if (isAdminUser && isAdmin) {
      // Build query for admin
      if (status) {
        query.paymentStatus = status;
      }

      if (search) {
        // Search by order number or customer email/name
        query.$or = [
          { orderNumber: { $regex: search, $options: "i" } },
          { "contactInfo.email": { $regex: search, $options: "i" } },
          { "contactInfo.fullName": { $regex: search, $options: "i" } },
        ];
      }

      await connectToDatabase();

      // Get total count for pagination
      const totalCount = await Order.countDocuments(query);

      // Fetch orders with pagination
      orders = await Order.find(query)
        .populate("userId", "email profile.firstName profile.lastName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return NextResponse.json({
        success: true,
        orders,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
        isAdmin: true,
      });
    } else {
      // Regular users can only see their own orders
      await connectToDatabase();

      query.userId = user._id;

      orders = await Order.find(query).sort({ createdAt: -1 }).limit(limit);

      return NextResponse.json({
        success: true,
        orders,
        isAdmin: false,
      });
    }
  } catch (error) {
    console.error("Fetch user orders error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
