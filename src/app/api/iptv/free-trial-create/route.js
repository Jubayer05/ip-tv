import crypto from "crypto";
import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Visitor from "@/models/Visitor";

// Simple authentication middleware
async function authenticateUser(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "Authorization header required", status: 401 };
    }

    const token = request.headers.get("authorization").split(" ")[1];
    await connectToDatabase();

    // Try to find user by username first
    let user = await User.findOne({
      "profile.username": token,
      isActive: true,
    });

    // If not found by username, try by email
    if (!user) {
      user = await User.findOne({
        email: token,
        isActive: true,
      });
    }

    if (!user) {
      return { error: "Invalid or expired token", status: 401 };
    }

    return { user };
  } catch (error) {
    console.error("Authentication error:", error);
    return { error: "Authentication failed", status: 500 };
  }
}

function generateTrialUsername(length = 8) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(length * 2);
  let result = "";
  for (let i = 0; i < bytes.length && result.length < length; i += 1) {
    result += alphabet[bytes[i] % alphabet.length];
  }
  return result.padEnd(length, "X");
}

const sanitizeWhatsappTelegram = (value) =>
  value ? value.toString().replace(/\D/g, "").slice(0, 15) : "";

const createFallbackWhatsappTelegram = () =>
  (Date.now().toString(36) + Math.random().toString(36))
    .replace(/[^0-9]/g, "")
    .slice(0, 10);

// Type validation and normalization helper
const normalizeType = (type) => {
  if (!type) return null;
  const upperType = String(type).toUpperCase();
  if (upperType === "M3U") return "M3U";
  if (upperType === "MAG") return "MAG";
  if (upperType === "ENIGMA" || upperType === "ENIGMA2") return "ENIGMA2";
  return null;
};

const isValidType = (type) => {
  const normalized = normalizeType(type);
  return normalized !== null;
};

const coerceBooleanString = (value) => (value ? "1" : "0");

const parseExpiration = (subscription) => {
  const raw =
    subscription?.expiring_at ||
    subscription?.expire ||
    subscription?.expire_at ||
    subscription?.expireDate;

  if (!raw) return null;

  if (typeof raw === "number") {
    return new Date(raw * 1000);
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
};

const TEMPLATE_ID = "10742";

export async function POST(request) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();

    // Log the raw body data
    console.log("=== FREE TRIAL CREATE - RAW BODY DATA ===");
    console.log(JSON.stringify(body, null, 2));

    const {
      key,
      username,
      password,
      type: typeFromBody,
      lineType, // Backward compatibility
      mac,
      visitorId,
      packageId,
      maxConnections = 1,
      forcedCountry = "ALL",
      adult = 0,
      whatsappTelegram,
      enableVpn = 0,
      paid = 0,
      note = "Test API",
    } = body;

    // Convert lineType to type if type is not provided (backward compatibility)
    const rawType =
      typeFromBody ||
      (lineType !== undefined
        ? lineType === 0
          ? "M3U"
          : lineType === 1
          ? "MAG"
          : "ENIGMA2"
        : undefined);

    // Normalize type to uppercase for API (M3U, MAG, ENIGMA2)
    const type = normalizeType(rawType);

    // Log the extracted values
    console.log("=== FREE TRIAL CREATE - EXTRACTED VALUES ===");
    console.log({
      rawType,
      normalizedType: type,
      typeFromBody,
      lineType,
      mac,
      macType: typeof mac,
      macLength: mac ? mac.length : 0,
      hasMac: !!mac,
    });

    const generatedUsername =
      (username || "").replace(/[^A-Z]/g, "").slice(0, 12) ||
      generateTrialUsername();

    const sanitizedWhatsapp =
      sanitizeWhatsappTelegram(whatsappTelegram) ||
      createFallbackWhatsappTelegram();

    const packageIdentifier = packageId || TEMPLATE_ID;

    if (visitorId) {
      await connectToDatabase();
      const existingVisitor = await Visitor.findOne({ visitorId });
      if (existingVisitor && existingVisitor.eligibleForTrial === false) {
        return NextResponse.json(
          { error: "This device has already used a free trial" },
          { status: 400 }
        );
      }
    }

    if (!key || !type || !packageIdentifier) {
      return NextResponse.json(
        { error: "API key, type, and packageId are required" },
        { status: 400 }
      );
    }

    if (!type || !isValidType(rawType)) {
      return NextResponse.json(
        { error: "Invalid type. Must be M3U, MAG, or Enigma" },
        { status: 400 }
      );
    }

    if ((type === "MAG" || type === "ENIGMA2") && !mac) {
      return NextResponse.json(
        { error: "MAC address is required for MAG and Enigma subscriptions" },
        { status: 400 }
      );
    }

    // Build form payload - base fields for all types
    const formPayload = new URLSearchParams({
      type,
      package_id: String(packageIdentifier),
      template_id: TEMPLATE_ID,
      max_connections: String(maxConnections),
      forced_country: forcedCountry,
      adult: coerceBooleanString(adult),
      note,
      whatsapp_telegram: sanitizedWhatsapp,
      enable_vpn: coerceBooleanString(enableVpn),
      paid: coerceBooleanString(paid),
    });

    // Log subscription type handling
    console.log("=== FREE TRIAL CREATE - SUBSCRIPTION TYPE HANDLING ===");
    console.log({
      rawType,
      normalizedType: type,
      isM3U: type === "M3U",
      isMAG: type === "MAG",
      isEnigma: type === "ENIGMA2",
      requiresMac: type === "MAG" || type === "ENIGMA2",
      requiresUsername: type === "M3U",
      hasMac: !!mac,
      macValue: mac,
      username: generatedUsername,
    });

    // For M3U: username (and optionally password) is required
    if (type === "M3U") {
      formPayload.append("username", generatedUsername);
    if (password) formPayload.append("password", password);
      console.log("✓ M3U subscription - username added:", generatedUsername);
    }

    // For MAG/Enigma: mac_address is required (username/password not needed per API docs)
    if ((type === "MAG" || type === "ENIGMA2") && mac) {
      formPayload.append("mac_address", mac);
      console.log("✓ MAG/Enigma subscription - mac_address added:", mac);
    } else if ((type === "MAG" || type === "ENIGMA2") && !mac) {
      console.log(
        "⚠ WARNING: MAC address required for type",
        type,
        "but not provided"
      );
    }

    // Log the final form payload before sending
    console.log("=== FREE TRIAL CREATE - FORM PAYLOAD ===");
    console.log("Form Payload String:", formPayload.toString());
    console.log("Form Payload Entries:", Object.fromEntries(formPayload));
    console.log("MAC Address in payload:", formPayload.get("mac_address"));
    console.log("Type in payload:", formPayload.get("type"));

    console.log("=== FREE TRIAL CREATE - API REQUEST ===");
    console.log("API URL: https://megaott.net/api/v1/subscriptions-test");
    console.log("Request Headers:", {
      Accept: "application/json",
      Authorization: `Bearer ${key?.substring(0, 10)}...`,
      "Content-Type": "application/x-www-form-urlencoded",
    });

    const iptvResponse = await fetch(
      "https://megaott.net/api/v1/subscriptions",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formPayload.toString(),
      }
    );

    const responseText = await iptvResponse.text();

    console.log("=== FREE TRIAL CREATE - API RESPONSE ===");
    console.log("Status:", iptvResponse.status);
    console.log("Status Text:", iptvResponse.statusText);
    console.log("Response Text:", responseText);

    if (
      responseText.trim().startsWith("<!DOCTYPE") ||
      responseText.trim().startsWith("<html")
    ) {
      console.error(
        "IPTV API returned HTML instead of JSON - likely an error page"
      );
      return NextResponse.json(
        {
          error:
            "IPTV service returned an error page. Please check the API key and service status.",
          details: "Response was HTML instead of JSON",
          responsePreview: responseText.substring(0, 200) + "...",
        },
        { status: 500 }
      );
    }

    let iptvData;
    try {
      iptvData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse IPTV API response:", parseError);
      console.error("Response text that failed to parse:", responseText);
      return NextResponse.json(
        {
          error: "Invalid response from IPTV service",
          details: "Response was not valid JSON",
          responsePreview: responseText.substring(0, 200) + "...",
        },
        { status: 500 }
      );
    }

    if (!iptvResponse.ok) {
      const statusClass = Math.floor(iptvResponse.status / 100);
      const errorMessage =
        iptvData?.message ||
        iptvData?.msg ||
        `IPTV service returned a ${iptvResponse.status} status`;

      if (statusClass === 4) {
        console.error("MegaOTT client error:", iptvData);
      } else if (statusClass === 5) {
        console.error("MegaOTT server error:", iptvData);
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: iptvData,
          status: iptvResponse.status,
        },
        { status: iptvResponse.status }
      );
    }

    if (authResult.user.freeTrial?.hasUsed) {
      return NextResponse.json(
        { error: "You have already used your free trial" },
        { status: 400 }
      );
    }

    const subscription = iptvData?.data ?? iptvData;
    if (!subscription || typeof subscription !== "object") {
      return NextResponse.json(
        {
          error: "IPTV service returned an unexpected payload",
          details: iptvData,
        },
        { status: 500 }
      );
    }

    if (visitorId) {
      const existingVisitor = await Visitor.findOne({ visitorId });
      if (existingVisitor && !existingVisitor.eligibleForTrial) {
        await User.findByIdAndUpdate(authResult.user._id, {
          $set: {
            "freeTrial.hasUsed": true,
            "freeTrial.usedAt": new Date(),
            "freeTrial.trialData": {
              lineId: "FRAUD_DETECTED",
              username: "FRAUD_DETECTED",
              templateName: "Fraud Detection",
              type: "M3U",
              expireDate: new Date(),
            },
          },
        });

        return NextResponse.json(
          {
            error:
              "This device has already been used for a free trial. Multiple accounts on the same device are not allowed.",
          },
          { status: 400 }
        );
      }
    }

    const expireDate = parseExpiration(subscription);

    try {
      if (visitorId) {
        await Visitor.findOneAndUpdate(
          { visitorId },
          {
            $set: {
              associatedUser: authResult.user?._id || null,
              eligibleForTrial: false,
              trialUsedAt: new Date(),
              "trialData.lineId":
                subscription.lineId || subscription.id || null,
              "trialData.username": subscription.username || generatedUsername,
              "trialData.templateId": TEMPLATE_ID,
              "trialData.templateName":
                subscription.template?.name ||
                subscription.templateName ||
                "Template 10742",
              "trialData.type": type,
              "trialData.expireDate": expireDate,
            },
          },
          { upsert: true, new: true }
        );
      }
    } catch (e) {
      console.error("Failed to update visitor record:", e);
    }

    try {
      await authResult.user.markFreeTrialUsed({
        lineId: subscription.lineId || subscription.id || null,
        username: subscription.username || generatedUsername,
        password: subscription.password || null,
        templateId: TEMPLATE_ID,
        templateName:
          subscription.template?.name ||
          subscription.templateName ||
          "Template 10742",
        type,
        expire: expireDate ? expireDate.getTime() / 1000 : null,
      });
    } catch (updateError) {
      console.error("Failed to update user free trial status:", updateError);
    }

    return NextResponse.json({
      success: true,
      message: "Free trial created successfully",
      data: subscription,
      fullResponse: iptvData,
    });
  } catch (error) {
    console.error("Free trial creation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
