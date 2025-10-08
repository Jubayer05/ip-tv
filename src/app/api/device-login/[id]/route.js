import { connectToDatabase } from "@/lib/db";
import DeviceLogin from "@/models/DeviceLogin";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Suspend device
export async function PATCH(request, { params }) {
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

    const { id } = await params;
    const deviceLogin = await DeviceLogin.suspendDevice(id, decoded.userId);

    if (!deviceLogin) {
      return NextResponse.json(
        { error: "Device login not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deviceLogin,
      message: "Device suspended successfully",
    });
  } catch (error) {
    console.error("Suspend device error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
