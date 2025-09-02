// src/app/api/visitors/check/route.js
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Visitor from "@/models/Visitor";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { visitorId, userEmail } = await request.json();
    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: "visitorId required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let doc = await Visitor.findOne({ visitorId });

    if (!doc) {
      // New visitor - create record
      let associatedUser = null;
      if (userEmail) {
        const user = await User.findOne({ email: userEmail }).select("_id");
        associatedUser = user?._id || null;
      }

      doc = await Visitor.create({
        visitorId,
        associatedUser,
        eligibleForTrial: true,
        meta: {
          ip: request.headers.get("x-forwarded-for") || null,
          userAgent: request.headers.get("user-agent") || null,
        },
      });

      return NextResponse.json({
        success: true,
        exists: false,
        eligible: true,
        data: { visitorId: doc.visitorId },
      });
    }

    // Visitor exists - check if they've used trial
    if (!doc.eligibleForTrial && userEmail) {
      // This device has already used a trial - mark the current user as fraud
      try {
        const currentUser = await User.findOne({ email: userEmail });
        if (currentUser && !currentUser.freeTrial?.hasUsed) {
          // Mark this user as having used free trial (fraud detection)
          await User.findByIdAndUpdate(currentUser._id, {
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
        }
      } catch (error) {
        console.error("Error marking user as fraud:", error);
      }
    }

    return NextResponse.json({
      success: true,
      exists: true,
      eligible: !!doc.eligibleForTrial,
      data: {
        visitorId: doc.visitorId,
        eligibleForTrial: doc.eligibleForTrial,
        trialUsedAt: doc.trialUsedAt,
      },
    });
  } catch (e) {
    console.error("Visitor check error:", e);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
