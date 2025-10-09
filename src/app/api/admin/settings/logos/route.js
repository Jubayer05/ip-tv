import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

// GET - Fetch logo settings
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await Settings.getSettings();

    return NextResponse.json({
      success: true,
      data: settings.logos || {
        mainLogo: "/logos/logo.png",
        cheapStreamLogo: "/logos/cheap_stream_logo.png",
        favicon: "/favicon.ico",
      },
    });
  } catch (error) {
    console.error("Error fetching logo settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch logo settings" },
      { status: 500 }
    );
  }
}

// PUT - Update logo settings
export async function PUT(request) {
  try {
    await connectToDatabase();
    const updates = await request.json();

    const settings = await Settings.getSettings();

    // Update logos
    settings.logos = {
      mainLogo:
        updates.mainLogo || settings.logos?.mainLogo || "/logos/logo.png",
      cheapStreamLogo:
        updates.cheapStreamLogo ||
        settings.logos?.cheapStreamLogo ||
        "/logos/cheap_stream_logo.png",
      favicon: updates.favicon || settings.logos?.favicon || "/favicon.ico",
    };

    await settings.save();

    return NextResponse.json({
      success: true,
      data: settings.logos,
    });
  } catch (error) {
    console.error("Error updating logo settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update logo settings" },
      { status: 500 }
    );
  }
}
