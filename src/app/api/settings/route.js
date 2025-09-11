import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const settings = await Settings.getSettings();

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectToDatabase();

    const updates = await request.json();

    let settings = await Settings.findOne({ key: "global" });
    if (!settings) {
      settings = await Settings.create({ key: "global" });
    }

    // Update settings with provided data
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        settings[key] = updates[key];
      }
    });

    await settings.save();

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
