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

    // Handle freeTrialContent
    if (body.freeTrialContent) {
      updates["freeTrialContent"] = body.freeTrialContent;
    }

    // Meta Management
    if (body.metaManagement && typeof body.metaManagement === "object") {
      const pages = [
        "home",
        "about",
        "affiliate",
        "blogs",
        "explore",
        "knowledge",
        "packages",
        "privacy",
        "terms",
        "contact",
        "faq",
      ];

      pages.forEach((page) => {
        if (
          body.metaManagement[page] &&
          typeof body.metaManagement[page] === "object"
        ) {
          const pageMeta = body.metaManagement[page];

          // Update title
          if (pageMeta.title !== undefined) {
            updates[`metaManagement.${page}.title`] = pageMeta.title || "";
          }

          // Update description
          if (pageMeta.description !== undefined) {
            updates[`metaManagement.${page}.description`] =
              pageMeta.description || "";
          }

          // Update keywords
          if (pageMeta.keywords !== undefined) {
            updates[`metaManagement.${page}.keywords`] =
              pageMeta.keywords || "";
          }

          // Update Open Graph
          if (pageMeta.openGraph && typeof pageMeta.openGraph === "object") {
            if (pageMeta.openGraph.title !== undefined) {
              updates[`metaManagement.${page}.openGraph.title`] =
                pageMeta.openGraph.title || "";
            }
            if (pageMeta.openGraph.description !== undefined) {
              updates[`metaManagement.${page}.openGraph.description`] =
                pageMeta.openGraph.description || "";
            }
          }
        }
      });
    }

    // API Keys
    if (body.apiKeys && typeof body.apiKeys === "object") {
      const apiKeyFields = [
        "recaptcha",
        "trustPilot",
        "googleAnalytics",
        "microsoftClarity",
        "cloudflare",
        "getButton",
        "tawkTo",
      ];

      apiKeyFields.forEach((addon) => {
        if (body.apiKeys[addon] && typeof body.apiKeys[addon] === "object") {
          Object.keys(body.apiKeys[addon]).forEach((field) => {
            if (body.apiKeys[addon][field] !== undefined) {
              updates[`apiKeys.${addon}.${field}`] =
                body.apiKeys[addon][field] || "";
            }
          });
        }
      });
    }

    // Login Options
    if (body.loginOptions && typeof body.loginOptions === "object") {
      const loginOptionFields = ["google", "facebook", "twitter"];

      loginOptionFields.forEach((option) => {
        if (body.loginOptions[option] !== undefined) {
          updates[`loginOptions.${option}`] = Boolean(
            body.loginOptions[option]
          );
        }
      });
    }

    // Social API Keys
    if (body.socialApiKeys && typeof body.socialApiKeys === "object") {
      const socialApiKeyFields = ["google", "facebook", "twitter"];

      socialApiKeyFields.forEach((provider) => {
        if (
          body.socialApiKeys[provider] &&
          typeof body.socialApiKeys[provider] === "object"
        ) {
          Object.keys(body.socialApiKeys[provider]).forEach((field) => {
            if (body.socialApiKeys[provider][field] !== undefined) {
              updates[`socialApiKeys.${provider}.${field}`] =
                body.socialApiKeys[provider][field] || "";
            }
          });
        }
      });
    }

    // SMTP Configuration
    if (body.smtp && typeof body.smtp === "object") {
      const smtpFields = ["host", "port", "user", "pass", "secure"];

      smtpFields.forEach((field) => {
        if (body.smtp[field] !== undefined) {
          if (field === "port") {
            updates[`smtp.${field}`] = parseInt(body.smtp[field]) || 587;
          } else if (field === "secure") {
            updates[`smtp.${field}`] = Boolean(body.smtp[field]);
          } else {
            updates[`smtp.${field}`] = body.smtp[field] || "";
          }
        }
      });
    }

    // Other API Keys
    if (body.otherApiKeys && typeof body.otherApiKeys === "object") {
      const apiKeySections = ["iptv", "jwt"];

      apiKeySections.forEach((section) => {
        if (
          body.otherApiKeys[section] &&
          typeof body.otherApiKeys[section] === "object"
        ) {
          Object.keys(body.otherApiKeys[section]).forEach((field) => {
            if (body.otherApiKeys[section][field] !== undefined) {
              updates[`otherApiKeys.${section}.${field}`] =
                body.otherApiKeys[section][field] || "";
            }
          });
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
        apiKeys: fresh.apiKeys || {},
        loginOptions: fresh.loginOptions || {},
        socialApiKeys: fresh.socialApiKeys || {},
        smtp: fresh.smtp || {},
        otherApiKeys: fresh.otherApiKeys || {},
        metaManagement: fresh.metaManagement,
        freeTrialContent: fresh.freeTrialContent,
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
