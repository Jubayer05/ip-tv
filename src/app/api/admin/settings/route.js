// Admin settings API route
import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

// GET current settings
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await Settings.getSettings();
    const response = NextResponse.json({ success: true, data: settings });

    // Add caching headers
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return response;
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
    const { addons, apiKeys, smtp, otherApiKeys } = body;

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
          widgetId: apiKeys.tawkTo?.widgetId || "",
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
    }

    // Handle SMTP configuration
    if (smtp) {
      const validSmtp = {
        host: smtp.host || "",
        port: smtp.port || 587,
        user: smtp.user || "",
        pass: smtp.pass || "",
        secure: smtp.secure || false,
      };

      await Settings.findOneAndUpdate(
        {},
        { $set: { smtp: validSmtp } },
        { upsert: true, new: true }
      );
    }

    // Handle other API keys (IPTV, JWT, DeepL, Google Translate)
    if (otherApiKeys) {
      const validOtherApiKeys = {
        iptv: {
          apiKey: otherApiKeys.iptv?.apiKey || "",
          baseUrl: otherApiKeys.iptv?.baseUrl || "",
        },
        jwt: {
          secret: otherApiKeys.jwt?.secret || "",
          expiresIn: otherApiKeys.jwt?.expiresIn || "7d",
        },
        deepl: {
          apiKey: otherApiKeys.deepl?.apiKey || "",
          baseUrl: otherApiKeys.deepl?.baseUrl || "https://api-free.deepl.com",
        },
        googleTranslate: {
          apiKey: otherApiKeys.googleTranslate?.apiKey || "",
          baseUrl:
            otherApiKeys.googleTranslate?.baseUrl ||
            "https://translation.googleapis.com",
        },
      };

      await Settings.findOneAndUpdate(
        {},
        { $set: { otherApiKeys: validOtherApiKeys } },
        { upsert: true, new: true }
      );
    }

    // Handle addons only if no other updates
    if (addons && !apiKeys && !smtp && !otherApiKeys) {
      await Settings.findOneAndUpdate(
        {},
        { $set: { addons: addons } },
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
