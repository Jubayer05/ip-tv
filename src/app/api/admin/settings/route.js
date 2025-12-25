// Admin settings API route
import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

// GET current settings
export async function GET(request) {
  try {
    await connectToDatabase();
    const settings = await Settings.getSettings();
    const response = NextResponse.json({ success: true, data: settings });

    // Check if this is an admin request (from admin panel) - no cache
    const url = new URL(request.url);
    const isAdminRequest = url.searchParams.get("nocache") === "true";

    if (isAdminRequest) {
      // No caching for admin panel requests
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
    } else {
      // Cache for public requests - 5 minutes with revalidation
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=600, max-age=300"
      );
    }

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
    const {
      addons,
      apiKeys,
      smtp,
      otherApiKeys,
      metaManagement,
      loginOptions,
      paymentGateways, // ✅ NEW: Handle payment gateway settings
      freeTrialContent, // Handle free trial content
      banners, // Handle banner content updates
      cardPayment, // Handle card payment settings
      contactInfo, // Handle contact info updates
      socialMedia, // Handle social media links
      logos, // Handle logo updates
    } = body;

    // Handle login options
    if (loginOptions) {
      await Settings.findOneAndUpdate(
        {},
        { $set: { loginOptions } },
        { upsert: true, new: true }
      );
    }

    if (paymentGateways) {
      // Validate payment gateway credentials
      const validPaymentGateways = {};

      Object.entries(paymentGateways).forEach(([gateway, config]) => {
        validPaymentGateways[gateway] = {
          enabled: config?.enabled || false,
          name: config?.name || gateway,
          apiKey: config?.apiKey || "",
          apiSecret: config?.apiSecret || "",
          merchantId: config?.merchantId || "",
          webhookSecret: config?.webhookSecret || "",
          testMode: config?.testMode || false,
          updatedAt: new Date(),
        };
      });

      await Settings.findOneAndUpdate(
        {},
        { $set: { paymentGateways: validPaymentGateways } },
        { upsert: true, new: true }
      );
    }

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
    if (addons && !apiKeys && !smtp && !otherApiKeys && !paymentGateways) {
      await Settings.findOneAndUpdate(
        {},
        { $set: { addons: addons } },
        { upsert: true, new: true }
      );
    }

    // Handle meta management settings
    if (metaManagement) {
      await Settings.findOneAndUpdate(
        {},
        { $set: { metaManagement } },
        { upsert: true, new: true }
      );
    }

    // Handle free trial content
    if (freeTrialContent) {
      await Settings.findOneAndUpdate(
        {},
        { $set: { freeTrialContent } },
        { upsert: true, new: true }
      );
    }

    // Handle banner content updates
    if (banners) {
      await Settings.findOneAndUpdate(
        {},
        { $set: { banners } },
        { upsert: true, new: true }
      );
    }

    // Handle card payment settings
    if (cardPayment) {
      await Settings.findOneAndUpdate(
        {},
        { $set: { cardPayment } },
        { upsert: true, new: true }
      );
    }

    // Handle contact info updates
    if (contactInfo) {
      await Settings.findOneAndUpdate(
        {},
        { $set: { contactInfo } },
        { upsert: true, new: true }
      );
    }

    // Handle social media links
    if (socialMedia) {
      await Settings.findOneAndUpdate(
        {},
        { $set: { socialMedia } },
        { upsert: true, new: true }
      );
    }

    // Handle logo updates
    if (logos) {
      await Settings.findOneAndUpdate(
        {},
        { $set: { logos } },
        { upsert: true, new: true }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });

    // Invalidate cache after update
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    return response;
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
