import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, email, role } = body;

    if (!userId || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "JWT_SECRET is not set" },
        { status: 500 }
      );
    }

    // Generate access token (7 days)
    const accessToken = jwt.sign(
      {
        userId,
        email,
        role,
      },
      secret,
      { expiresIn: "7d" }
    );

    // Generate refresh token (30 days)
    const refreshToken = jwt.sign(
      {
        userId,
        email,
        role,
        type: "refresh",
      },
      secret,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      success: true,
      accessToken,
      refreshToken,
      message: "Auth tokens generated successfully",
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
