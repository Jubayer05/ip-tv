import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

// GET /api/settings/site-status - Get site status
export async function GET() {
  try {
    await connectToDatabase();

    let settings = await Settings.findOne({ key: "global" });

    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({
        key: "global",
        siteStatus: {
          isActive: true,
          maintenanceMessage:
            "We're currently performing maintenance. Please check back later.",
          lastUpdated: new Date(),
        },
      });
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      data: settings.siteStatus || {
        isActive: true,
        maintenanceMessage:
          "We're currently performing maintenance. Please check back later.",
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error("Error fetching site status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch site status" },
      { status: 500 }
    );
  }
}

// PUT /api/settings/site-status - Update site status
export async function PUT(request) {
  try {
    await connectToDatabase();

    const { isActive, maintenanceMessage } = await request.json();

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean value" },
        { status: 400 }
      );
    }

    if (maintenanceMessage && typeof maintenanceMessage !== "string") {
      return NextResponse.json(
        { error: "maintenanceMessage must be a string" },
        { status: 400 }
      );
    }

    let settings = await Settings.findOne({ key: "global" });

    if (!settings) {
      settings = new Settings({ key: "global" });
    }

    // Update site status
    settings.siteStatus = {
      isActive,
      maintenanceMessage:
        maintenanceMessage ||
        settings.siteStatus?.maintenanceMessage ||
        "We're currently performing maintenance. Please check back later.",
      lastUpdated: new Date(),
    };

    await settings.save();

    return NextResponse.json({
      success: true,
      data: settings.siteStatus,
      message: "Site status updated successfully",
    });
  } catch (error) {
    console.error("Error updating site status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update site status" },
      { status: 500 }
    );
  }
}
