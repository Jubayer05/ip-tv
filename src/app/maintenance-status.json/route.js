import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const noCache = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET() {
  try {
    await connectToDatabase();

    const settings = await Settings.findOne({ key: "global" });

    if (!settings || !settings.siteStatus) {
      return NextResponse.json(
        {
          isMaintenanceMode: false,
          maintenanceMessage:
            "We're currently performing maintenance. Please check back later.",
        },
        { headers: noCache }
      );
    }

    return NextResponse.json(
      {
        isMaintenanceMode: !settings.siteStatus.isActive,
        maintenanceMessage:
          settings.siteStatus.maintenanceMessage ||
          "We're currently performing maintenance. Please check back later.",
      },
      { headers: noCache }
    );
  } catch (error) {
    console.error("Error fetching maintenance status:", error);
    return NextResponse.json(
      {
        isMaintenanceMode: false,
        maintenanceMessage:
          "We're currently performing maintenance. Please check back later.",
      },
      { headers: noCache }
    );
  }
}
