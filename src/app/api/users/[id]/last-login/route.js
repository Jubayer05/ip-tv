import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

// PATCH update last login
export async function PATCH(request, context) {
  const { id } = await context.params;
  try {
    await connectToDatabase();

    // Update by email (current documents don't have firebaseUid)
    const updatedUser = await User.findOneAndUpdate(
      { email: id },
      { lastLogin: new Date() },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Last login updated successfully",
    });
  } catch (error) {
    console.error("Error updating last login:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update last login" },
      { status: 500 }
    );
  }
}
