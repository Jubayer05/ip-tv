import { connectToDatabase } from "@/lib/db";
import { sendIPTVCredentialsEmail } from "@/lib/email";
import { getServerIptvApiKey } from "@/lib/serverApiKeys";
import Order from "@/models/Order";

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

// Normalize various gateway statuses to our internal paymentStatus
function mapRawStatusToPaymentStatus(rawStatus = "") {
  const s = String(rawStatus).toLowerCase();

  // Completed states
  const completed = [
    "paid",
    "completed",
    "confirmed",
    "success",
    "finished",
    "succeeded",
    "done",
  ];
  if (completed.includes(s)) return "completed";

  // Failed/cancelled/expired
  const failed = [
    "failed",
    "cancelled",
    "canceled",
    "expired",
    "error",
    "declined",
    "rejected",
  ];
  if (failed.includes(s)) return "failed";

  // Pending/waiting
  const pending = [
    "pending",
    "processing",
    "waiting",
    "new",
    "unpaid",
    "inprogress",
    "in_progress",
  ];
  if (pending.includes(s)) return "pending";

  // Default to pending when unknown
  return "pending";
}

// Apply gateway status + data to an order and trigger side-effects on completion
export async function applyPaymentUpdate({
  order,
  orderId,
  gatewayKey, // e.g., "plisioPayment", "hoodpayPayment", "paygatePayment"
  rawStatus,
  gatewayFields = {},
  onCompleted, // optional async ({ order }) => {}
  // Other props may be passed by some routes; safely ignored
}) {
  await connectToDatabase();

  // Resolve order
  let doc = order || null;
  if (!doc && orderId) {
    doc = await Order.findById(orderId);
  }
  if (!doc) {
    throw new Error("Order not found for payment update");
  }

  const prevPaymentStatus = doc.paymentStatus;
  const nextPaymentStatus =
    rawStatus !== undefined
      ? mapRawStatusToPaymentStatus(rawStatus)
      : prevPaymentStatus;

  // Update top-level statuses (keep orderStatus in sync)
  if (nextPaymentStatus && nextPaymentStatus !== prevPaymentStatus) {
    doc.paymentStatus = nextPaymentStatus;
    doc.orderStatus =
      nextPaymentStatus === "completed" ? "completed" : "pending";
  }

  // Merge gateway-specific fields if provided
  if (gatewayKey) {
    if (!doc[gatewayKey]) {
      doc[gatewayKey] = {};
    }
    // Always store a raw status snapshot if given
    if (rawStatus !== undefined) {
      doc[gatewayKey].status = rawStatus;
    }
    // Merge extra fields
    Object.assign(doc[gatewayKey], gatewayFields || {});
    doc[gatewayKey].updatedAt = new Date().toISOString();
  }

  await doc.save();

  // If we just transitioned to completed, trigger IPTV creation and any custom hook
  const transitionedToCompleted =
    prevPaymentStatus !== "completed" && doc.paymentStatus === "completed";

  if (transitionedToCompleted) {
    try {
      // Create IPTV accounts and email credentials
      await handlePaymentCompleted(doc.orderNumber);
    } catch (e) {
      console.error("handlePaymentCompleted failed:", e);
    }

    if (typeof onCompleted === "function") {
      try {
        await onCompleted({ order: doc });
      } catch (e) {
        console.error("onCompleted hook failed:", e);
      }
    }
  }

  return { success: true, orderId: doc._id, paymentStatus: doc.paymentStatus };
}

// Update the createIPTVAccount function to use the correct two-step process
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

  console.log("=== CREATING IPTV ACCOUNT (Two-Step Process) ===");
  console.log("Step 1: Create free trial account");
  console.log("Step 2: Upgrade to official account");

  // Step 1: Create free trial account
  const freeTrialPayload = {
    key: iptvApiKey,
    username: username,
    password: password,
    templateId: templateId,
    lineType: lineType,
  };

  // Add MAC address for MAG/Enigma2
  if (lineType > 0 && macAddress) {
    freeTrialPayload.mac = macAddress;
  }

  console.log("Free trial payload:", JSON.stringify(freeTrialPayload, null, 2));

  try {
    // Create free trial account
    const trialResponse = await fetch("http://zlive.cc/api/free-trail-create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "IPTV-Client/1.0",
      },
      body: JSON.stringify(freeTrialPayload),
    });

    const trialResponseText = await trialResponse.text();
    console.log("Free trial response status:", trialResponse.status);
    console.log("Free trial raw response:", trialResponseText);

    const trialData = JSON.parse(trialResponseText);
    console.log("Free trial parsed response:", trialData);

    if (trialData.code !== 200) {
      throw new Error(
        `Free trial creation failed: ${
          trialData.message || trialData.msg || "Unknown error"
        }`
      );
    }

    console.log("✅ Free trial account created successfully");

    // Step 2: Upgrade to official account
    console.log("Upgrading to official account...");

    const upgradePayload = {
      key: iptvApiKey,
      username: username,
      password: password,
      action: "update",
      val: packageId, // Use val parameter or fallback to packageId
      con: deviceCount, // Use con parameter or fallback to 1
    };

    console.log("Upgrade payload:", JSON.stringify(upgradePayload, null, 2));

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
    console.log("Upgrade response status:", upgradeResponse.status);
    console.log("Upgrade raw response:", upgradeResponseText);

    const upgradeData = JSON.parse(upgradeResponseText);
    console.log("Upgrade parsed response:", upgradeData);

    if (upgradeData.code !== 200) {
      throw new Error(
        `Upgrade failed: ${
          upgradeData.message || upgradeData.msg || "Unknown error"
        }`
      );
    }

    console.log("✅ Account upgraded to official successfully");

    // Return the trial data (which contains the account info) with updated package info
    return {
      ...trialData.data,
      package: packageId,
      packageName: getPackageName(packageId),
      isOfficial: true,
    };
  } catch (error) {
    console.error("IPTV account creation failed:", error);
    throw error;
  }
}

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

// Update the generateCredentials function to create shorter credentials
function generateCredentials(orderNumber, index = 0) {
  // Generate shorter username (8 characters max)
  const randomString = Math.random().toString(36).substring(2, 10);
  const username = index > 0 ? `${randomString}${index}` : randomString;

  // Generate shorter password (8 characters max)
  const password = Math.random().toString(36).substring(2, 10);

  return { username, password };
}

// Main function to handle payment completion
export async function handlePaymentCompleted(orderNumber) {
  try {
    await connectToDatabase();

    // Find the order
    const order = await Order.findOne({ orderNumber });
    if (!order) {
      console.error(`Order ${orderNumber} not found`);
      return { success: false, error: "Order not found" };
    }

    // Check if order payment is completed
    if (order.paymentStatus !== "completed") {
      console.log(`Order ${orderNumber} payment not completed yet`);
      return { success: false, error: "Payment not completed" };
    }

    // Check if IPTV credentials already exist
    if (order.iptvCredentials && order.iptvCredentials.length > 0) {
      console.log(`IPTV credentials already exist for order ${orderNumber}`);

      // Send email if not already sent
      if (!order.credentialsEmailSent) {
        const emailSent = await sendIPTVCredentialsEmail({
          toEmail: order.contactInfo.email,
          fullName: order.contactInfo.fullName,
          order,
        });

        if (emailSent) {
          order.credentialsEmailSent = true;
          await order.save();
        }
      }

      return { success: true, message: "Credentials already exist" };
    }

    const product = order.products[0]; // Assuming single product per order
    const credentials = [];

    try {
      // Use the generated credentials from the order if available, otherwise generate new ones
      const generatedCredentials = product.generatedCredentials || [];

      // Create credentials based on line type and quantity
      if (product.lineType === 0) {
        // M3U
        let username, password;

        if (generatedCredentials.length > 0) {
          // Use provided credentials
          const cred = generatedCredentials[0];
          username = cred.username;
          password = cred.password;
        } else {
          // Generate new credentials
          const cred = generateCredentials(order.orderNumber);
          username = cred.username;
          password = cred.password;
        }

        const iptvData = await createIPTVAccount({
          username,
          password,
          templateId: product.templateId,
          lineType: product.lineType,
          macAddress: null,
          durationMonths: product.duration,
        });

        credentials.push({
          lineId: iptvData.lineId,
          username: iptvData.username,
          password: iptvData.password,
          expire: iptvData.expire,
          packageId: iptvData.package,
          packageName: iptvData.packageName,
          templateId: product.templateId,
          templateName: iptvData.templateName,
          lineType: product.lineType,
          macAddress: "",
          adultChannels: product.adultChannels,
          lineInfo: iptvData.lineInfo,
          isActive: true,
        });
      } else {
        // MAG or Enigma2
        for (let i = 0; i < product.quantity; i++) {
          let username, password;

          if (generatedCredentials.length > i) {
            // Use provided credentials
            const cred = generatedCredentials[i];
            username = cred.username;
            password = cred.password;
          } else {
            // Generate new credentials
            const cred = generateCredentials(order.orderNumber, i);
            username = cred.username;
            password = cred.password;
          }

          const macAddress = product.macAddresses[i] || "";
          const adultChannels = product.adultChannelsConfig[i] || false;

          const iptvData = await createIPTVAccount({
            username,
            password,
            templateId: product.templateId,
            lineType: product.lineType,
            macAddress,
            durationMonths: product.duration,
          });

          credentials.push({
            lineId: iptvData.lineId,
            username: iptvData.username,
            password: iptvData.password,
            expire: iptvData.expire,
            packageId: iptvData.package,
            packageName: iptvData.packageName,
            templateId: product.templateId,
            templateName: iptvData.templateName,
            lineType: product.lineType,
            macAddress,
            adultChannels,
            lineInfo: iptvData.lineInfo,
            isActive: true,
          });
        }
      }

      // Update order with credentials
      order.iptvCredentials = credentials;
      await order.save();

      // Send email with credentials
      const emailSent = await sendIPTVCredentialsEmail({
        toEmail: order.contactInfo.email,
        fullName: order.contactInfo.fullName,
        order,
      });

      if (emailSent) {
        order.credentialsEmailSent = true;
        await order.save();
      }

      console.log(
        `Successfully created IPTV credentials for order ${orderNumber}`
      );

      return {
        success: true,
        message: "IPTV credentials created and email sent",
        credentialsCount: credentials.length,
        emailSent,
      };
    } catch (iptvError) {
      console.error(
        `IPTV account creation failed for order ${orderNumber}:`,
        iptvError
      );
      return { success: false, error: iptvError.message };
    }
  } catch (error) {
    console.error(
      `Error handling payment completion for order ${orderNumber}:`,
      error
    );
    return { success: false, error: error.message };
  }
}
