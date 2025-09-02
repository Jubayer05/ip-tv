import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

// Authentication middleware
async function authenticateUser(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "Authorization header required", status: 401 };
    }

    const token = authHeader.split(" ")[1];
    await connectToDatabase();

    const user = await User.findOne({
      "profile.username": token,
      isActive: true,
    });

    if (!user) {
      return { error: "Invalid or expired token", status: 401 };
    }

    return { user };
  } catch (error) {
    console.error("Authentication error:", error);
    return { error: "Authentication failed", status: 500 };
  }
}

export async function POST(request) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { key, username, password, action, val } = body;

    // Validate required fields
    if (!key || !username || !password || !action || val === undefined) {
      return NextResponse.json(
        {
          error:
            "All fields are required: key, username, password, action, val",
        },
        { status: 400 }
      );
    }

    // Validate action
    if (action !== "disable") {
      return NextResponse.json(
        { error: "Action must be 'disable'" },
        { status: 400 }
      );
    }

    // Validate status value
    if (![0, 1].includes(val)) {
      return NextResponse.json(
        { error: "Status value must be 0 (close) or 1 (open)" },
        { status: 400 }
      );
    }

    // Call external IPTV API
    const iptvResponse = await fetch("http://zlive.cc/api/line-status-set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        username,
        password,
        action,
        val,
      }),
    });

    if (!iptvResponse.ok) {
      const errorData = await iptvResponse.json();
      return NextResponse.json(
        { error: errorData.message || "IPTV service error" },
        { status: iptvResponse.status }
      );
    }

    const iptvData = await iptvResponse.json();

    return NextResponse.json({
      success: true,
      message:
        val === 1 ? "Line enabled successfully" : "Line disabled successfully",
      data: iptvData.data,
    });
  } catch (error) {
    console.error("Line status update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
