import { connectToDatabase } from "@/lib/db";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsServiceV2";
import PaymentSettings from "@/models/PaymentSettings";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      name,
      description,
      amount,
      currency = "USD",
      intervalDays = 30,
      features = {},
    } = await request.json();

    // Validate input
    if (!name || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Name and valid amount are required" },
        { status: 400 }
      );
    }

    if (!intervalDays || intervalDays < 1) {
      return NextResponse.json(
        { error: "Valid interval (in days) is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get NOWPayments settings
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "nowpayment",
      isActive: true,
    });

    if (!paymentSettings || !paymentSettings.apiKey) {
      return NextResponse.json(
        { error: "NOWPayments not configured" },
        { status: 500 }
      );
    }

    // Configure service
    nowpaymentsService.setApiKey(paymentSettings.apiKey);
    if (paymentSettings.ipnSecret || paymentSettings.apiSecret) {
      nowpaymentsService.setIpnSecret(
        paymentSettings.ipnSecret || paymentSettings.apiSecret
      );
    }
    if (paymentSettings.sandboxMode) {
      nowpaymentsService.setSandboxMode(true);
    }

    console.log("📋 Creating subscription plan:", { name, amount, intervalDays });

    // Create plan in NOWPayments
    const result = await nowpaymentsService.createSubscriptionPlan({
      title: name,
      description: description || name,
      price_amount: amount,
      price_currency: currency.toLowerCase(),
      interval_day: intervalDays,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to create subscription plan in NOWPayments" },
        { status: 400 }
      );
    }

    // Save plan in database
    const plan = new SubscriptionPlan({
      name,
      description,
      nowpaymentsSubscriptionId: result.data.subscriptionId,
      amount,
      currency: currency.toUpperCase(),
      intervalDays,
      features,
      isActive: true,
    });

    await plan.save();

    console.log("✅ Subscription plan created:", plan._id);

    return NextResponse.json({
      success: true,
      plan: {
        id: plan._id,
        nowpaymentsId: plan.nowpaymentsSubscriptionId,
        name: plan.name,
        description: plan.description,
        amount: plan.amount,
        currency: plan.currency,
        intervalDays: plan.intervalDays,
        features: plan.features,
      },
    });
  } catch (error) {
    console.error("❌ Create plan error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription plan" },
      { status: 500 }
    );
  }
}

// Get all subscription plans
export async function GET() {
  try {
    await connectToDatabase();

    const plans = await SubscriptionPlan.find({ isActive: true }).sort({
      amount: 1,
    });

    return NextResponse.json({
      success: true,
      plans: plans.map((p) => ({
        id: p._id,
        nowpaymentsId: p.nowpaymentsSubscriptionId,
        name: p.name,
        description: p.description,
        amount: p.amount,
        currency: p.currency,
        intervalDays: p.intervalDays,
        features: p.features,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (error) {
    console.error("❌ Get plans error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get plans" },
      { status: 500 }
    );
  }
}
