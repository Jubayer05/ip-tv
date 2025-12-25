import { connectToDatabase } from "@/lib/db";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsService";
import PaymentSettings from "@/models/PaymentSettings";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import { NextResponse } from "next/server";

/**
 * Create a subscription plan in NOWPayments
 * Admin only endpoint
 */
export async function POST(request) {
  try {
    const {
      name,
      description = "",
      amount,
      currency = "USD",
      intervalDays = 30,
      features = {},
    } = await request.json();

    if (!name || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Name and valid amount are required" },
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

    // Create plan in NOWPayments
    const result = await nowpaymentsService.createSubscriptionPlan({
      title: name,
      description,
      price_amount: amount,
      price_currency: currency.toLowerCase(),
      interval_day: intervalDays,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to create subscription plan" },
        { status: 400 }
      );
    }

    // Save plan in our database
    const plan = new SubscriptionPlan({
      name,
      description,
      amount,
      currency,
      intervalDays,
      features,
      nowpaymentsSubscriptionId: result.data.subscriptionId,
      isActive: true,
    });

    await plan.save();

    return NextResponse.json({
      success: true,
      plan: {
        id: plan._id,
        name: plan.name,
        description: plan.description,
        amount: plan.amount,
        currency: plan.currency,
        intervalDays: plan.intervalDays,
        nowpaymentsSubscriptionId: plan.nowpaymentsSubscriptionId,
        features: plan.features,
      },
    });
  } catch (error) {
    console.error("❌ Create subscription plan error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription plan" },
      { status: 500 }
    );
  }
}

/**
 * Get all subscription plans
 */
export async function GET() {
  try {
    await connectToDatabase();

    const plans = await SubscriptionPlan.find({ isActive: true }).sort({
      amount: 1,
    });

    return NextResponse.json({
      success: true,
      plans: plans.map((plan) => ({
        id: plan._id,
        name: plan.name,
        description: plan.description,
        amount: plan.amount,
        currency: plan.currency,
        intervalDays: plan.intervalDays,
        features: plan.features,
        nowpaymentsSubscriptionId: plan.nowpaymentsSubscriptionId,
      })),
    });
  } catch (error) {
    console.error("❌ Get subscription plans error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get subscription plans" },
      { status: 500 }
    );
  }
}
