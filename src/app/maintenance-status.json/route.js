import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const settings = await Settings.findOne({ key: "global" });

    if (!settings || !settings.siteStatus) {
      return NextResponse.json({
        isMaintenanceMode: false,
        maintenanceMessage:
          "We're currently performing maintenance. Please check back later.",
      });
    }

    return NextResponse.json({
      isMaintenanceMode: !settings.siteStatus.isActive,
      maintenanceMessage:
        settings.siteStatus.maintenanceMessage ||
        "We're currently performing maintenance. Please check back later.",
    });
  } catch (error) {
    console.error("Error fetching maintenance status:", error);
    return NextResponse.json({
      isMaintenanceMode: false,
      maintenanceMessage:
        "We're currently performing maintenance. Please check back later.",
    });
  }
}
