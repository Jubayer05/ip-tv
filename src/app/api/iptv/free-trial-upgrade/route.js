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
    const { key, username, password, action, val, con } = body;

    // Validate required fields
    if (
      !key ||
      !username ||
      !password ||
      !action ||
      val === undefined ||
      con === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "All fields are required: key, username, password, action, val, con",
        },
        { status: 400 }
      );
    }

    // Validate action
    if (action !== "update") {
      return NextResponse.json(
        { error: "Action must be 'update'" },
        { status: 400 }
      );
    }

    // Validate package ID (val)
    const validPackageIds = [2, 3, 4, 5];
    if (!validPackageIds.includes(val)) {
      return NextResponse.json(
        { error: "Invalid package ID. Must be 2, 3, 4, or 5" },
        { status: 400 }
      );
    }

    // Validate device count (con)
    if (con < 1 || con > 3) {
      return NextResponse.json(
        { error: "Device count must be between 1 and 3" },
        { status: 400 }
      );
    }

    // Call external IPTV API
    const iptvResponse = await fetch("http://zlive.cc/api/free-trail-upgrade", {
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
        con,
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
      message: "Free trial upgraded successfully",
      data: iptvData.data,
    });
  } catch (error) {
    console.error("Free trial upgrade error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
