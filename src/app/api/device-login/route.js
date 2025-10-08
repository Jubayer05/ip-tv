import { connectToDatabase } from "@/lib/db";
import { getClientIP, parseUserAgent } from "@/lib/deviceInfo";
import DeviceLogin from "@/models/DeviceLogin";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Create device login
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "JWT_SECRET is not set" },
        { status: 500 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret, {
        algorithms: ["HS256"],
      });
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    let { userAgent, sessionId, deviceInfo } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Normalize payload: accept both shapes
    if (deviceInfo && deviceInfo.userAgent) {
      userAgent = deviceInfo.userAgent;
    } else if (userAgent) {
      deviceInfo = { userAgent, ...parseUserAgent(userAgent) };
    } else {
      return NextResponse.json(
        { error: "User agent is required" },
        { status: 400 }
      );
    }

    const ipAddress = getClientIP(request); // ok if returns "Unknown"
    const location = { country: "Unknown", city: "Unknown", region: "Unknown" };

    const deviceLogin = await DeviceLogin.createDeviceLogin(
      decoded.userId,
      deviceInfo, // now guaranteed to include userAgent
      ipAddress,
      sessionId,
      location
    );

    return NextResponse.json({
      success: true,
      data: deviceLogin,
      message: "Device login recorded successfully",
    });
  } catch (error) {
    console.error("Device login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get user's device logins
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "JWT_SECRET is not set" },
        { status: 500 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret, {
        algorithms: ["HS256"],
      });
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 15;

    const deviceLogins = await DeviceLogin.getUserDeviceLogins(
      decoded.userId,
      limit
    );

    return NextResponse.json({
      success: true,
      data: deviceLogins,
    });
  } catch (error) {
    console.error("Get device logins error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
