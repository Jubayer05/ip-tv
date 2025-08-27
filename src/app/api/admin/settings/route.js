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

// PUT to update settings
export async function PUT(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // First, ensure the document has the required structure
    const existingDoc = await Settings.findOne({ key: "global" });
    if (!existingDoc.banners) {
      await Settings.updateOne(
        { key: "global" },
        {
          $set: {
            banners: {
              home: {
                heading1: "",
                heading2: "",
                paragraph: "",
                placeholder: "",
                buttonText: "",
              },
              about: { heading1: "", heading2: "", paragraph: "" },
              affiliate: { heading1: "", heading2: "", paragraph: "" },
              blog: { heading1: "", heading2: "", paragraph: "" },
              contact: { heading1: "", heading2: "", paragraph: "" },
              faq: { heading1: "", heading2: "", paragraph: "" },
            },
          },
        }
      );
    }

    // Build atomic $set update map
    const updates = {};

    // Affiliate commission
    if (body.affiliateCommissionPct !== undefined) {
      const pctRaw = body.affiliateCommissionPct;
      if (pctRaw === null || Number.isNaN(Number(pctRaw))) {
        return NextResponse.json(
          {
            success: false,
            error: "affiliateCommissionPct must be a valid number",
          },
          { status: 400 }
        );
      }
      const pct = Math.max(0, Math.min(100, Number(pctRaw)));
      updates["affiliateCommissionPct"] = pct;
    }

    // Social media
    if (body.socialMedia && typeof body.socialMedia === "object") {
      ["x", "linkedin", "instagram", "youtube"].forEach((k) => {
        if (body.socialMedia[k] !== undefined) {
          updates[`socialMedia.${k}`] = body.socialMedia[k] || "";
        }
      });
    }

    // Contact info
    if (body.contactInfo && typeof body.contactInfo === "object") {
      if (body.contactInfo.phoneNumber !== undefined) {
        updates["contactInfo.phoneNumber"] = body.contactInfo.phoneNumber || "";
      }
      if (body.contactInfo.emailAddress !== undefined) {
        updates["contactInfo.emailAddress"] =
          body.contactInfo.emailAddress || "";
      }
    }

    // Banners
    if (body.banners && typeof body.banners === "object") {
      const whitelist = {
        home: [
          "heading1",
          "heading2",
          "paragraph",
          "placeholder",
          "buttonText",
        ],
        about: ["heading1", "heading2", "paragraph"],
        affiliate: ["heading1", "heading2", "paragraph"],
        blog: ["heading1", "heading2", "paragraph"],
        contact: ["heading1", "heading2", "paragraph"],
        faq: ["heading1", "heading2", "paragraph", "buttonText"],
        pricing: [
          "heading1",
          "heading2",
          "paragraph",
          "buttonText",
          "trialNote",
        ],
        privacy: ["heading1", "heading2", "paragraph"],
        terms: ["heading1", "heading2", "paragraph"],
        knowledge: ["heading1", "heading2", "paragraph"],
        explore: [
          "heading1",
          "heading2",
          "paragraph",
          "watchNow",
          "myWishlist",
        ],
      };

      Object.keys(body.banners).forEach((page) => {
        const fields = whitelist[page];
        if (!fields) return;
        fields.forEach((field) => {
          if (body.banners[page]?.[field] !== undefined) {
            const key = `banners.${page}.${field}`;
            const value = body.banners[page][field] || "";
            updates[key] = value;
          }
        });
      });
    }

    // Addons
    if (body.addons && typeof body.addons === "object") {
      const addonFields = [
        "recaptcha",
        "trustPilot",
        "googleAnalytics",
        "microsoftClarity",
        "cloudflare",
        "getButton",
        "tawkTo",
      ];

      addonFields.forEach((addon) => {
        if (body.addons[addon] !== undefined) {
          updates[`addons.${addon}`] = Boolean(body.addons[addon]);
        }
      });
    }

    // Perform update
    if (Object.keys(updates).length > 0) {
      const result = await Settings.updateOne(
        { key: "global" },
        { $set: updates }
      );
    }

    // Return fresh settings
    const fresh = await Settings.findOne({ key: "global" });
    return NextResponse.json({
      success: true,
      data: {
        affiliateCommissionPct: fresh.affiliateCommissionPct,
        socialMedia: fresh.socialMedia,
        contactInfo: fresh.contactInfo,
        banners: fresh.banners,
        addons: fresh.addons,
      },
      message: "Settings updated",
    });
  } catch (e) {
    console.error("❌ Settings PUT error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
