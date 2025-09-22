import { connectToDatabase } from "@/lib/db";
import { sendIPTVCredentialsEmail } from "@/lib/email";
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
  console.log("IPTV API Key exists:", !!iptvApiKey);

  try {
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

    console.log("IPTV API Parsed response:", data);

    if (data.code !== 200) {
      throw new Error(
        data.message || data.msg || "Failed to create IPTV account"
      );
    }

    return data.data;
  } catch (error) {
    console.error("IPTV API Error:", error);
    throw error;
  }
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
    const body = await request.json();
    const { orderNumber } = body;

    console.log("Redownload credentials request:", { orderNumber });

    if (!orderNumber) {
      console.log("Error: Order number is required");
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the order by order number only
    const order = await Order.findOne({
      orderNumber,
    });

    console.log(
      "Found order:",
      order
        ? {
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
            hasCredentials: order.iptvCredentials?.length > 0,
          }
        : "Not found"
    );

    if (!order) {
      console.log("Error: Order not found");
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order is completed
    if (order.paymentStatus !== "completed") {
      console.log(
        "Error: Order payment not completed, status:",
        order.paymentStatus
      );
      return NextResponse.json(
        { error: "Order payment not completed" },
        { status: 400 }
      );
    }

    // If credentials don't exist, create them
    if (!order.iptvCredentials || order.iptvCredentials.length === 0) {
      console.log("No credentials found, creating new ones...");

      const product = order.products[0]; // Assuming single product per order
      const credentials = [];

      try {
        // Create credentials based on line type and quantity
        if (product.lineType === 0) {
          // M3U
          // For M3U, create one account that supports multiple devices
          const { username, password } = generateCredentials(order.orderNumber);

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
          // For MAG/Enigma2, create separate accounts for each device
          for (let i = 0; i < product.quantity; i++) {
            const { username, password } = generateCredentials(
              order.orderNumber,
              i
            );
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

        console.log("Successfully created IPTV credentials");
      } catch (iptvError) {
        console.error("IPTV account creation failed:", iptvError);

        // Instead of failing completely, return a more helpful error message
        return NextResponse.json(
          {
            error: "IPTV service temporarily unavailable",
            details:
              "Unable to create IPTV credentials at this time. Please try again later or contact support.",
            originalError: iptvError.message,
          },
          { status: 503 } // Service Unavailable
        );
      }
    }

    // Send email with credentials
    const emailSent = await sendIPTVCredentialsEmail({
      toEmail: order.contactInfo.email,
      fullName: order.contactInfo.fullName,
      order,
    });

    if (!emailSent) {
      console.log("Error: Failed to send credentials email");
      return NextResponse.json(
        { error: "Failed to send credentials email" },
        { status: 500 }
      );
    }

    console.log("Success: Credentials sent successfully");
    return NextResponse.json({
      success: true,
      message: "IPTV credentials have been sent to your email address",
    });
  } catch (error) {
    console.error("Redownload credentials error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
