import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

// POST migrate existing users to add firebaseUid
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { email, firebaseUid } = body;
    
    if (!email || !firebaseUid) {
      return NextResponse.json(
        { success: false, error: "Email and firebaseUid are required" },
        { status: 400 }
      );
    }
    
    // Find user by email and add firebaseUid
    const user = await User.findOneAndUpdate(
      { email },
      { firebaseUid },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: user,
      message: "User migrated successfully",
    });
  } catch (error) {
    console.error("Error migrating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to migrate user" },
      { status: 500 }
    );
  }
}
