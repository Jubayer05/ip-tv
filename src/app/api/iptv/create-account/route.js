import { connectToDatabase } from "@/lib/db";
import { getTemplateIdByAdultChannels } from "@/lib/iptvUtils";
import { getServerIptvApiKey } from "@/lib/serverApiKeys";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

// Map duration months to package IDs according to API docs
const getPackageId = (durationMonths) => {
  switch (durationMonths) {
    case 1:
      return 2; // 1 Month Subscription
    case 3:
      return 3; // 3 Month Subscription
    case 6:
      return 4; // 6 Month Subscription
    case 12:
      return 5; // 12 Month Subscription
    default:
      return 2; // Default to 1 month
  }
};

// Helper function to get package name
function getPackageName(packageId) {
  const packageNames = {
    2: "1 Month Subscription",
    3: "3 Month Subscription",
    4: "6 Month Subscription",
    5: "12 Month Subscription",
  };
  return packageNames[packageId] || "Unknown Package";
}

// Create IPTV account via external API using two-step process (with template fallback)
async function createIPTVAccount({
  username,
  password,
  templateId,
  lineType,
  macAddress,
  durationMonths,
  val,
  con,
}) {
  const packageId = val || getPackageId(durationMonths);
  const deviceCount = con || 1;

  // Get IPTV API key from database
  const iptvApiKey = await getServerIptvApiKey();
  if (!iptvApiKey) {
    throw new Error("IPTV API key not configured in settings");
  }

  // Step 1: Create free trial account with fallback candidates
  const validTemplateIds = [1271, 1266]; // 1271: NoAdult, 1266: All

  const normalizeTemplateId = (t) => {
    const n = Number(t);
    return validTemplateIds.includes(n) ? n : 1271; // default to 1271 (NoAdult)
  };

  const templateCandidates = Array.from(
    new Set([normalizeTemplateId(templateId), 1271, 1266]) // Try requested, then NoAdult, then All
  );

  const tryCreateTrial = async (tplId) => {
    const payload = {
      key: iptvApiKey,
      username,
      password,
      templateId: tplId,
      lineType,
    };
    if (lineType > 0 && macAddress) payload.mac = macAddress;

    const r = await fetch("http://zlive.cc/api/free-trail-create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "IPTV-Client/1.0",
      },
      body: JSON.stringify(payload),
    });

    const txt = await r.text();
    let json;
    try {
      json = JSON.parse(txt);
    } catch {
      throw new Error(`Invalid API response: ${txt}`);
    }
    return json;
  };

  let trialData = null;
  let lastError = null;
  let chosenTemplateId = normalizeTemplateId(templateId);

  for (const cand of templateCandidates) {
    const res = await tryCreateTrial(cand);

    if (res?.code === 200) {
      trialData = res;
      chosenTemplateId = cand; // lock in the working template
      break;
    }

    const msg = (res?.message || res?.msg || "").toLowerCase();
    lastError = res?.message || res?.msg || "Unknown error";

    // Only rotate to next candidate for template errors; for others, abort
    if (!msg.includes("bouquets template id")) {
      break;
    }
  }

  if (!trialData || trialData.code !== 200) {
    throw new Error(`Free trial creation failed: ${lastError}`);
  }

  const upgradePayload = {
    key: iptvApiKey,
    username,
    password,
    action: "update",
    val: packageId, // Use val parameter or fallback to packageId
    con: deviceCount, // Use con parameter or fallback to 1
  };

  const upgradeResponse = await fetch(
    "http://zlive.cc/api/free-trail-upgrade",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "IPTV-Client/1.0",
      },
      body: JSON.stringify(upgradePayload),
    }
  );

  const upgradeResponseText = await upgradeResponse.text();

  let upgradeData;
  try {
    upgradeData = JSON.parse(upgradeResponseText);
  } catch {
    throw new Error(`Invalid upgrade API response: ${upgradeResponseText}`);
  }

  if (upgradeData.code !== 200) {
    throw new Error(
      `Upgrade failed: ${
        upgradeData.message || upgradeData.msg || "Unknown error"
      }`
    );
  }

  // Return the trial data (which contains the account info) with updated package info
  return {
    ...trialData.data,
    package: packageId,
    packageName: getPackageName(packageId),
    isOfficial: true,
    templateId: chosenTemplateId,
  };
}

// Generate username and password
function generateCredentials(orderNumber, index = 0) {
  // Generate shorter username (8 characters max)
  const randomString = Math.random().toString(36).substring(2, 10);
  const username = index > 0 ? `${randomString}${index}` : randomString;

  // Generate shorter password (8 characters max)
  const password = Math.random().toString(36).substring(2, 10);

  return { username, password };
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { orderNumber, val, con } = body;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order is paid
    if (order.paymentStatus !== "completed") {
      return NextResponse.json(
        { error: "Order payment not completed" },
        { status: 400 }
      );
    }

    // Check if IPTV credentials already exist
    if (order.iptvCredentials && order.iptvCredentials.length > 0) {
      return NextResponse.json(
        { error: "IPTV credentials already created for this order" },
        { status: 400 }
      );
    }

    const product = order.products[0]; // Assuming single product per order
    const credentials = [];

    try {
      // Use the generated credentials from the order if available, otherwise generate new ones
      const generatedCredentials = product.generatedCredentials || [];
      const configs = product.accountConfigurations || [];
      const qty = product.quantity || configs.length || 1;

      // M3U and MAG/Enigma2 now both support N accounts (qty)
      for (let i = 0; i < qty; i++) {
        // pick username/password
        let username, password;
        if (generatedCredentials.length > i) {
          const cred = generatedCredentials[i];
          username = cred.username;
          password = cred.password;
        } else {
          const cred = generateCredentials(order.orderNumber, i);
          username = cred.username;
          password = cred.password;
        }

        // per-account config
        const cfg = configs[i] || {};
        const devices = Number(cfg.devices || product.devicesAllowed || 1);
        const adult = Boolean(
          cfg.adultChannels ??
            (product.lineType > 0
              ? product.adultChannelsConfig?.[i]
              : product.adultChannels)
        );

        // device-specific extras for MAG/Enigma2
        const macAddress =
          product.lineType > 0 ? product.macAddresses?.[i] || "" : null;

        // choose template per account
        const templateIdForAccount = getTemplateIdByAdultChannels(adult);

        const iptvData = await createIPTVAccount({
          username,
          password,
          templateId: templateIdForAccount,
          lineType: product.lineType,
          macAddress,
          durationMonths: product.duration,
          val, // package id (optional; helper derives from duration if missing)
          con: devices, // per-account devices
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
          lineType: product.lineType,
          macAddress: macAddress || "",
          adultChannels: adult,
          devices, // NEW: persist devices for this account
          lineInfo: iptvData.lineInfo,
          isActive: true,
        });
      }

      // Update order with credentials
      order.iptvCredentials = credentials;
      await order.save();

      return NextResponse.json({
        success: true,
        message: "IPTV credentials created successfully",
        credentials: credentials.map((cred) => ({
          username: cred.username,
          password: cred.password,
          lineType: cred.lineType,
          macAddress: cred.macAddress,
          adultChannels: cred.adultChannels,
          devices: cred.devices,
          expire: new Date(cred.expire * 1000).toISOString(),
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
