import { connectToDatabase } from "@/lib/db";
import VerificationToken from "@/models/VerificationToken";
import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
  try {
    await connectToDatabase();
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const doc = await VerificationToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      email: doc.email,
      firstName: doc.firstName || "",
      lastName: doc.lastName || "",
      username: doc.username || null,
    });
  } catch (e) {
    console.error("Verify GET error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
