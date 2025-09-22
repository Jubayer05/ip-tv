import { connectToDatabase } from "@/lib/db";
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

// Create IPTV account via external API
async function createIPTVAccount({
  username,
  password,
  templateId,
  lineType,
  macAddress,
  durationMonths,
}) {
  const packageId = getPackageId(durationMonths);

  // Get IPTV API key from database
  const iptvApiKey = await getServerIptvApiKey();
  if (!iptvApiKey) {
    throw new Error("IPTV API key not configured in settings");
  }

  const requestPayload = {
    key: iptvApiKey,
    username,
    password,
    templateId,
    lineType,
    packageId,
  };

  // Add MAC address for MAG/Enigma2
  if (lineType > 0 && macAddress) {
    requestPayload.mac = macAddress;
  }

  console.log("Creating IPTV account with payload:", requestPayload);

  const response = await fetch("http://zlive.cc/api/create-account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "IPTV-Client/1.0",
    },
    body: JSON.stringify(requestPayload),
  });

  const responseText = await response.text();
  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Invalid API response: ${responseText}`);
  }

  if (data.code !== 200) {
    throw new Error(
      data.message || data.msg || "Failed to create IPTV account"
    );
  }

  return data.data;
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
    const { orderNumber } = body;

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

      return NextResponse.json({
        success: true,
        message: "IPTV credentials created successfully",
        credentials: credentials.map((cred) => ({
          username: cred.username,
          password: cred.password,
          lineType: cred.lineType,
          macAddress: cred.macAddress,
          adultChannels: cred.adultChannels,
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
