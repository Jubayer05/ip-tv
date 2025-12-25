import { connectToDatabase } from "@/lib/db";
import { isSuperAdminEmail } from "@/lib/superAdmin";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Authentication helper
async function authenticateAdmin(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Authorization required", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return { error: "Server configuration error", status: 500 };
  }

  try {
    const decoded = jwt.verify(token, secret);
    await connectToDatabase();

    const adminUser = await User.findById(decoded.userId);
    if (!adminUser) {
      return { error: "User not found", status: 401 };
    }

    // Only super admins can change roles (not regular admins)
    if (!isSuperAdminEmail(adminUser.email)) {
      return {
        error:
          "Insufficient permissions. Only super admins can change user roles.",
        status: 403,
      };
    }

    return { admin: adminUser };
  } catch (err) {
    return { error: "Invalid or expired token", status: 401 };
  }
}

// PATCH - Update user role
export async function PATCH(request, { params }) {
  try {
    // Authenticate admin
    const authResult = await authenticateAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ["user", "admin", "superadmin"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid role. Must be one of: user, admin, superadmin",
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Update role
    user.role = role;
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user role",
      },
      { status: 500 }
    );
  }
}
