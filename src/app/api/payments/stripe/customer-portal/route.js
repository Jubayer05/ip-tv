import { connectToDatabase } from "@/lib/db";
import stripeService from "@/lib/paymentServices/stripeService";
import PaymentSettings from "@/models/PaymentSettings";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get Stripe payment settings
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "stripe",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "Stripe payment method is not configured or active" },
        { status: 400 }
      );
    }

    // Configure Stripe service
    stripeService.initialize(paymentSettings.apiKey);

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer ID found for this user" },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;

    // Create customer portal session
    const result = await stripeService.createCustomerPortalSession(
      user.stripeCustomerId,
      `${origin}/dashboard/subscription`
    );

    console.log("✅ Customer portal session created:", {
      userId: user._id,
      customerId: user.stripeCustomerId,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
    });

  } catch (error) {
    console.error("❌ Customer portal error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create customer portal session" },
      { status: 500 }
    );
  }
}
