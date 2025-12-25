import { connectToDatabase } from "@/lib/db";
import { getTemplateIdByAdultChannels } from "@/lib/iptvUtils";
import { getServerIptvApiKey } from "@/lib/serverApiKeys";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

// Map duration months to MegaOTT package IDs
const getPackageId = (durationMonths) => {
  switch (durationMonths) {
    case 1:
      return 4; // 1 Month
    case 3:
      return 6; // 3 Months
    case 6:
      return 3; // 6 Months
    case 12:
      return 5; // 12 Months
    case 24:
      return 8; // 24 Months / 2 Years
    default:
      return 4; // Default to 1 month
  }
};

// Translate legacy ZLive val → MegaOTT package IDs, otherwise pass-through if already correct
const translatePackageId = (incomingVal, durationMonths) => {
  const v = Number(incomingVal);

  // If already a valid MegaOTT id, keep it
  if ([4, 6, 3, 5, 8].includes(v)) return v;

  // Legacy ZLive → MegaOTT
  const legacyMap = {
    2: 4, // 1 Month
    3: 6, // 3 Months
    4: 3, // 6 Months
    5: 5, // 12 Months
  };
  if (legacyMap[v]) return legacyMap[v];

  // Fallback to duration-based mapping
  return getPackageId(durationMonths);
};

// Helper function to get package name
function getPackageName(packageId) {
  const packageNames = {
    4: "1 Month Subscription",
    6: "3 Month Subscription",
    3: "6 Month Subscription",
    5: "12 Month Subscription",
    8: "24 Month Subscription",
  };
  return packageNames[packageId] || "Unknown Package";
}

// Type validation and normalization helper
const normalizeType = (type) => {
  if (!type) return null;
  // If it's already a string type, normalize it
  if (typeof type === "string") {
    const upperType = type.toUpperCase();
    if (upperType === "M3U") return "M3U";
    if (upperType === "MAG") return "MAG";
    if (upperType === "ENIGMA" || upperType === "ENIGMA2") return "ENIGMA2";
  }
  // If it's a number (lineType), convert it
  if (typeof type === "number") {
    if (type === 0) return "M3U";
    if (type === 1) return "MAG";
    if (type === 2) return "ENIGMA2";
  }
  return null;
};

// Backward compatibility: convert lineType number to type string
const lineTypeToType = (lineType) => {
  if (lineType === 0) return "M3U";
  if (lineType === 1) return "MAG";
  if (lineType === 2) return "ENIGMA2";
  return "M3U";
};

const coerceBooleanString = (value) => (value ? "1" : "0");

const sanitizeWhatsappTelegram = (value) =>
  value ? value.toString().replace(/\D/g, "").slice(0, 15) : "";

const createFallbackWhatsappTelegram = () =>
  (Date.now().toString(36) + Math.random().toString(36))
    .replace(/[^0-9]/g, "")
    .slice(0, 10) || "0000000000";

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

// Create IPTV account via MegaOTT API
async function createIPTVAccount({
  username,
  password,
  templateId,
  type, // Accept type string (M3U, MAG, ENIGMA2) or lineType number for backward compatibility
  lineType, // Backward compatibility
  macAddress,
  durationMonths,
  val,
  con,
  adult,
  orderNumber,
}) {
  const packageId = translatePackageId(val, durationMonths);
  const deviceCount = con || 1;

  // Normalize type: accept either type string or lineType number
  const rawType =
    type || (lineType !== undefined ? lineTypeToType(lineType) : "M3U");
  const normalizedType = normalizeType(rawType) || "M3U";

  if (
    (normalizedType === "MAG" || normalizedType === "ENIGMA2") &&
    !macAddress
  ) {
    throw new Error("MAC address is required for MAG and Enigma2 lines");
  }

  const iptvApiKey = await getServerIptvApiKey();
  if (!iptvApiKey) {
    throw new Error("IPTV API key not configured in settings");
  }

  const note = orderNumber ? `Paid order ${orderNumber}` : "Paid order";
  const whatsappTelegram = sanitizeWhatsappTelegram(
    createFallbackWhatsappTelegram()
  );

  // Build form payload - base fields for all types
  const formPayload = new URLSearchParams({
    type: normalizedType,
    package_id: String(packageId),
    template_id: String(templateId),
    max_connections: String(deviceCount),
    forced_country: "ALL",
    adult: coerceBooleanString(adult),
    note,
    whatsapp_telegram: whatsappTelegram,
    enable_vpn: "0",
    paid: "1",
  });

  // For M3U: username (and optionally password) is required
  if (normalizedType === "M3U") {
    formPayload.append("username", username);
    if (password) formPayload.append("password", password);
  }

  // For MAG/Enigma: mac_address is required (username/password not needed per API docs)
  if (
    (normalizedType === "MAG" || normalizedType === "ENIGMA2") &&
    macAddress
  ) {
    formPayload.append("mac_address", macAddress);
  }

  const iptvResponse = await fetch("https://megaott.net/api/v1/subscriptions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${iptvApiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formPayload.toString(),
  });

  const responseText = await iptvResponse.text();

  if (
    responseText.trim().startsWith("<!DOCTYPE") ||
    responseText.trim().startsWith("<html")
  ) {
    throw new Error(
      "IPTV service returned an HTML error page. Check API key/service status."
    );
  }

  let iptvData;
  try {
    iptvData = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Invalid response from IPTV service: ${responseText.substring(0, 200)}`
    );
  }

  if (!iptvResponse.ok) {
    const errorMessage =
      iptvData?.message ||
      iptvData?.msg ||
      `IPTV service returned a ${iptvResponse.status} status`;
    throw new Error(errorMessage);
  }

  if (iptvData?.status === false || iptvData?.success === false) {
    const rejectionMessage =
      iptvData?.message || iptvData?.msg || "IPTV service rejected the request";
    throw new Error(rejectionMessage);
  }

  const subscription = iptvData?.data ?? iptvData;
  if (!subscription || typeof subscription !== "object") {
    throw new Error("IPTV service returned an unexpected payload");
  }

  const expireDate = parseExpiration(subscription);
  const expireTimestamp = expireDate
    ? Math.floor(expireDate.getTime() / 1000)
    : 0;
  const numericTemplateId = Number(templateId);

  const rawId =
    subscription.lineId || subscription.id || subscription.subscriptionId;
  const lineIdNum =
    rawId !== undefined && rawId !== null && !Number.isNaN(Number(rawId))
      ? Number(rawId)
      : undefined;

  return {
    lineId: lineIdNum ?? null,
    username: subscription.username || username,
    password: subscription.password || password,
    expire: expireTimestamp,
    package: packageId,
    packageName: getPackageName(packageId),
    isOfficial: true,
    templateId: numericTemplateId,
    templateName:
      subscription.template?.name ||
      subscription.templateName ||
      subscription.template?.title ||
      `Template ${numericTemplateId}`,
    lineInfo: JSON.stringify(subscription),
  };
}

// Generate username and password
function generateCredentials(orderNumber, index = 0) {
  const randomString = Math.random().toString(36).substring(2, 10);
  const username = index > 0 ? `${randomString}${index}` : randomString;
  const password = Math.random().toString(36).substring(2, 10);
  return { username, password };
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { orderNumber, val, con, type, lineType, deviceInfo } = body;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus !== "completed") {
      return NextResponse.json(
        { error: "Order payment not completed" },
        { status: 400 }
      );
    }

    if (order.iptvCredentials && order.iptvCredentials.length > 0) {
      return NextResponse.json(
        { error: "IPTV credentials already created for this order" },
        { status: 400 }
      );
    }

    const product = order.products[0];
    const credentials = [];

    try {
      const generatedCredentials = product.generatedCredentials || [];
      const configs = product.accountConfigurations || [];
      const qty = product.quantity || configs.length || 1;

      // Get type from product (new format) or convert lineType (old format) - support both
      const productType =
        product.type ||
        (product.lineType !== undefined
          ? lineTypeToType(product.lineType)
          : null);
      const orderType =
        type ||
        productType ||
        (lineType !== undefined ? lineTypeToType(lineType) : "M3U");

      // For backward compatibility, also get lineType number if needed
      const orderLineType = product.lineType || lineType || 0;
      const orderDeviceInfo = product.deviceInfo || deviceInfo || {};

      for (let i = 0; i < qty; i++) {
        let username;
        let password;

        if (generatedCredentials.length > i) {
          const cred = generatedCredentials[i];
          username = cred.username;
          password = cred.password;
        } else {
          const cred = generateCredentials(order.orderNumber, i);
          username = cred.username;
          password = cred.password;
        }

        const cfg = configs[i] || {};
        const devices = Number(cfg.devices || product.devicesAllowed || 1);
        const adult = Boolean(
          cfg.adultChannels ??
            (orderLineType > 0
              ? product.adultChannelsConfig?.[i]
              : product.adultChannels)
        );

        // Get MAC address for MAG/Enigma - check both type and lineType
        let macAddress = null;
        const accountType = cfg.type || orderType;
        const accountLineType =
          cfg.lineType !== undefined ? cfg.lineType : orderLineType;
        const requiresMac =
          accountType === "MAG" ||
          accountType === "ENIGMA2" ||
          accountLineType > 0;

        if (requiresMac) {
          macAddress =
            cfg.deviceInfo?.macAddress ||
            orderDeviceInfo.macAddress ||
            product.macAddresses?.[i] ||
            "";
        }

        const templateIdForAccount = getTemplateIdByAdultChannels(adult);

        const iptvData = await createIPTVAccount({
          username,
          password,
          templateId: templateIdForAccount,
          type: accountType, // Use type string
          lineType: accountLineType, // Keep for backward compatibility
          macAddress,
          durationMonths: product.duration,
          val,
          con: devices,
          adult,
          orderNumber: order.orderNumber,
        });

        credentials.push({
          lineId: iptvData.lineId,
          username: iptvData.username,
          password: iptvData.password,
          expire: iptvData.expire,
          packageId: iptvData.package,
          packageName: iptvData.packageName,
          templateId: templateIdForAccount,
          templateName: iptvData.templateName,
          type: accountType, // Store type string
          lineType: accountLineType, // Keep for backward compatibility
          macAddress: macAddress || "",
          adultChannels: adult,
          devices,
          lineInfo: iptvData.lineInfo,
          isActive: true,
        });
      }

      order.iptvCredentials = credentials;
      await order.save();

      return NextResponse.json({
        success: true,
        message: "IPTV credentials created successfully",
        order,
        credentials: credentials.map((cred) => ({
          username: cred.username,
          password: cred.password,
          type:
            cred.type ||
            (cred.lineType !== undefined
              ? lineTypeToType(cred.lineType)
              : "M3U"),
          lineType: cred.lineType, // Keep for backward compatibility
          macAddress: cred.macAddress,
          adultChannels: cred.adultChannels,
          devices: cred.devices,
          expire: cred.expire
            ? new Date(cred.expire * 1000).toISOString()
            : null,
        })),
      });
    } catch (iptvError) {
      console.error("IPTV account creation failed:", iptvError);
      return NextResponse.json(
        { error: "Failed to create IPTV accounts", details: iptvError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Create IPTV account error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
