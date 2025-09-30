// Admin settings API route
import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

// GET current settings
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await Settings.getSettings();
    return NextResponse.json({
      success: true,
      data: {
        affiliateCommissionPct: settings.affiliateCommissionPct,
        socialMedia: settings.socialMedia,
        contactInfo: settings.contactInfo,
        banners: settings.banners,
        addons: settings.addons,
        apiKeys: settings.apiKeys || {},
        loginOptions: settings.loginOptions || {},
        socialApiKeys: settings.socialApiKeys || {},
        smtp: settings.smtp || {},
        otherApiKeys: settings.otherApiKeys || {},
        metaManagement: settings.metaManagement,
        freeTrialContent: settings.freeTrialContent,
      },
    });
  } catch (e) {
    console.error("Settings GET error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update settings
export async function PUT(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { addons, apiKeys } = body;

    // Validate API keys structure
    if (apiKeys) {
      const validApiKeys = {
        recaptcha: {
          siteKey: apiKeys.recaptcha?.siteKey || "",
          secretKey: apiKeys.recaptcha?.secretKey || "",
        },
        trustPilot: {
          businessId: apiKeys.trustPilot?.businessId || "",
          apiKey: apiKeys.trustPilot?.apiKey || "",
        },
        googleAnalytics: {
          measurementId: apiKeys.googleAnalytics?.measurementId || "",
        },
        microsoftClarity: {
          projectId: apiKeys.microsoftClarity?.projectId || "",
        },
        cloudflare: {
          token: apiKeys.cloudflare?.token || "",
        },
        getButton: {
          widgetId: apiKeys.getButton?.widgetId || "",
        },
        tawkTo: {
          propertyId: apiKeys.tawkTo?.propertyId || "",
          widgetId: apiKeys.tawkTo?.widgetId || "", // Add widgetId validation
        },
      };

      // Update settings with validated API keys
      await Settings.findOneAndUpdate(
        {},
        {
          $set: {
            addons: addons || {},
            apiKeys: validApiKeys,
          },
        },
        { upsert: true, new: true }
      );
    } else {
      // Update only addons if apiKeys not provided
      await Settings.findOneAndUpdate(
        {},
        { $set: { addons: addons || {} } },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
