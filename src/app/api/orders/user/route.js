import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Simple authentication middleware
async function authenticateUser(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "Authorization header required", status: 401 };
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    await connectToDatabase();
    const user = await User.findById(decoded.userId);

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
  const superAdminEmails = [
    "jubayer0504@gmail.com",
    "alan.sangasare10@gmail.com",
  ];
  return user?.role === "admin" || superAdminEmails.includes(user?.email);
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
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        );

        await connectToDatabase();
        user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
          return NextResponse.json(
            { error: "Invalid or inactive user" },
            { status: 401 }
          );
        }
      } catch (jwtError) {
        console.error("JWT authentication failed:", jwtError);
        // Fall through to email-based authentication
      }
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
      // Admin users can see all orders
      console.log("Loading all orders for admin user");

      // Build query for admin
      if (status) {
        query.paymentStatus = status;
      }

      if (search) {
        // Search by order number or customer email
        query.$or = [
          { orderNumber: { $regex: search, $options: "i" } },
          { "contactInfo.email": { $regex: search, $options: "i" } },
          { "contactInfo.fullName": { $regex: search, $options: "i" } },
        ];
      }

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
