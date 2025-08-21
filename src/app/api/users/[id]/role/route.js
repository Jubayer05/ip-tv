import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET user role
export async function GET(request, context) {
  const { id } = await context.params;
  try {
    await connectToDatabase();

    // Look up by email (current documents don't have firebaseUid)
    const user = await User.findOne({ email: id });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      role: user.role,
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user role" },
      { status: 500 }
    );
  }
}

// PATCH update user role
export async function PATCH(request, context) {
  const { id } = await context.params;
  try {
    await connectToDatabase();

    const { role } = await request.json();

    // Validate role
    const validRoles = ["user", "admin", "support"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    // Update by email
    const updatedUser = await User.findOneAndUpdate(
      { email: id },
      { role },
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
      data: updatedUser,
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
