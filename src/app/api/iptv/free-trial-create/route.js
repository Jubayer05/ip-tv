import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Visitor from "@/models/Visitor";
import { NextResponse } from "next/server";

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

export async function POST(request) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { key, username, password, templateId, lineType, mac, visitorId } =
      body;

    // If visitorId provided, block if already used on this device/browser
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

    // Validate required fields
    if (!key || !templateId || lineType === undefined) {
      return NextResponse.json(
        { error: "API key, templateId, and lineType are required" },
        { status: 400 }
      );
    }

    // Validate templateId based on API documentation
    const validTemplateIds = [1, 2, 3, 4, 5, 6, 7, 8];
    if (!validTemplateIds.includes(templateId)) {
      return NextResponse.json(
        { error: "Invalid templateId. Must be 1-8" },
        { status: 400 }
      );
    }

    // Validate lineType
    if (![0, 1, 2].includes(lineType)) {
      return NextResponse.json(
        { error: "Invalid lineType. Must be 0 (m3u), 1 (mag), or 2 (enigma2)" },
        { status: 400 }
      );
    }

    // Validate MAC address for lineType 1 & 2
    if ((lineType === 1 || lineType === 2) && !mac) {
      return NextResponse.json(
        { error: "MAC address is required for lineType 1 & 2" },
        { status: 400 }
      );
    }

    // Prepare request payload
    const requestPayload = {
      key,
      templateId,
      lineType,
    };

    // Add optional fields only if they have values
    if (username) requestPayload.username = username;
    if (password) requestPayload.password = password;
    if (mac) requestPayload.mac = mac;

    console.log("=== IPTV API Request Payload ===");
    console.log(JSON.stringify(requestPayload, null, 2));

    // Call external IPTV API
    console.log("Calling IPTV API: http://zlive.cc/api/free-trail-create");

    const iptvResponse = await fetch("http://zlive.cc/api/free-trail-create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "IPTV-Client/1.0",
      },
      body: JSON.stringify(requestPayload),
    });

    console.log("=== IPTV API Response Debug ===");
    console.log("Response Status:", iptvResponse.status);
    console.log(
      "Response Headers:",
      Object.fromEntries(iptvResponse.headers.entries())
    );

    // Get response text first to debug
    const responseText = await iptvResponse.text();
    console.log("Raw Response Text:", responseText);

    let iptvData;
    try {
      iptvData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse IPTV API response:", parseError);
      return NextResponse.json(
        { error: "Invalid response from IPTV service" },
        { status: 500 }
      );
    }

    // Check if IPTV service returned an error
    if (iptvData.code !== 200) {
      console.error("IPTV Service Error:", iptvData);
      return NextResponse.json(
        {
          error: iptvData.message || iptvData.msg || "IPTV service error",
          details: iptvData,
          code: iptvData.code,
        },
        { status: 400 }
      );
    }

    // Check if user has already used free trial
    if (authResult.user.freeTrial?.hasUsed) {
      return NextResponse.json(
        { error: "You have already used your free trial" },
        { status: 400 }
      );
    }

    // Check if this device has already been used for a trial (fraud prevention)
    if (visitorId) {
      const existingVisitor = await Visitor.findOne({ visitorId });
      if (existingVisitor && !existingVisitor.eligibleForTrial) {
        // Mark user as fraud and block the request
        await User.findByIdAndUpdate(authResult.user._id, {
          $set: {
            "freeTrial.hasUsed": true,
            "freeTrial.usedAt": new Date(),
            "freeTrial.trialData": {
              lineId: "FRAUD_DETECTED",
              username: "FRAUD_DETECTED",
              templateId: 0,
              templateName: "Fraud Detection",
              lineType: 0,
              expireDate: new Date(),
            },
          },
        });

        console.log(
          `FRAUD DETECTED: User ${authResult.user.email} tried to create trial on device ${visitorId} that already used trial`
        );

        return NextResponse.json(
          {
            error:
              "This device has already been used for a free trial. Multiple accounts on the same device are not allowed.",
          },
          { status: 400 }
        );
      }
    }

    // Mark visitor as used (block future trials on this device/browser)
    try {
      if (visitorId) {
        const expireUnix = iptvData.data.expire || iptvData.data.expireDate;
        await Visitor.findOneAndUpdate(
          { visitorId },
          {
            $set: {
              associatedUser: authResult.user?._id || null,
              eligibleForTrial: false,
              trialUsedAt: new Date(),
              "trialData.lineId": iptvData.data.lineId || iptvData.data.id,
              "trialData.username": iptvData.data.username || username,
              "trialData.templateId": templateId,
              "trialData.templateName": `Template ${templateId}`,
              "trialData.lineType": lineType,
              "trialData.expireDate": expireUnix
                ? new Date(expireUnix * 1000)
                : null,
            },
          },
          { upsert: true, new: true }
        );
      }
    } catch (e) {
      console.error("Failed to update visitor record:", e);
    }

    // Update user's free trial status
    try {
      await authResult.user.markFreeTrialUsed({
        lineId: iptvData.data.lineId || iptvData.data.id,
        username: iptvData.data.username || username,
        password: iptvData.data.password, // Add password from IPTV response
        templateId: templateId,
        templateName: `Template ${templateId}`,
        lineType: lineType,
        expire: iptvData.data.expire || iptvData.data.expireDate,
      });
    } catch (updateError) {
      console.error("Failed to update user free trial status:", updateError);
    }

    // Success case
    return NextResponse.json({
      success: true,
      message: "Free trial created successfully",
      data: iptvData.data,
      fullResponse: iptvData, // Include full response for debugging
    });
  } catch (error) {
    console.error("Free trial creation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
