import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Visitor from "@/models/Visitor";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { visitorId, email, deviceInfo } = await request.json();

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: "Visitor ID is required" },
        { status: 400 }
      );
    }

    // Get client IP
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";

    const visitorData = {
      visitorId,
      meta: {
        ...deviceInfo,
        ip,
      },
    };

    // If email is provided, associate with user
    if (email) {
      const user = await User.findOne({ email });
      if (user) {
        visitorData.associatedUser = user._id;
      }
    }

    // Create or update visitor
    const visitor = await Visitor.findOneAndUpdate({ visitorId }, visitorData, {
      upsert: true,
      new: true,
    });

    return NextResponse.json({
      success: true,
      visitor: visitor,
    });
  } catch (error) {
    console.error("Visitor tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track visitor" },
      { status: 500 }
    );
  }
}
