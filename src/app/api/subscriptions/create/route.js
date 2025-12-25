import { connectToDatabase } from "@/lib/db";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsService";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * Create a subscription for a user
 */
export async function POST(request) {
  try {
    const {
      planId,
      userId,
      customerEmail,
      autoRenew = true,
    } = await request.json();

    if (!planId || !userId) {
      return NextResponse.json(
        { error: "Plan ID and User ID are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get subscription plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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

    const orderId = `sub-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Create subscription in NOWPayments
    const result = await nowpaymentsService.createSubscription({
      subscription_plan_id: plan.nowpaymentsSubscriptionId,
      email: customerEmail || user.email,
      order_id: orderId,
      order_description: `Subscription: ${plan.name}`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 400 }
      );
    }

    // Create order for subscription
    const order = new Order({
      orderNumber: orderId,
      userId: user._id,
      products: [
        {
          productId: null,
          variantId: null,
          quantity: 1,
          price: plan.amount,
          duration: Math.floor(plan.intervalDays / 30), // Convert days to months
          devicesAllowed: plan.features?.devicesAllowed || 1,
          adultChannels: plan.features?.adultChannels || false,
        },
      ],
      totalAmount: plan.amount,
      originalAmount: plan.amount,
      serviceFee: 0,
      discountAmount: 0,
      paymentMethod: "Cryptocurrency",
      paymentGateway: "NOWPayments",
      paymentStatus: "pending",
      contactInfo: {
        fullName: user.profile?.username || user.email,
        email: user.email,
        phone: user.profile?.phone || "",
      },
      status: "new",
      subscription: {
        isActive: false,
        planId: plan._id,
        planName: plan.name,
        intervalDays: plan.intervalDays,
        autoRenew,
        status: "inactive",
      },
      nowpaymentsPayment: {
        subscriptionId: result.data.subscriptionId,
        subscriptionPlanId: result.data.subscriptionPlanId,
        isRecurring: true,
        billingInterval: plan.intervalDays,
        paymentStatus: "waiting",
        callbackReceived: false,
        lastStatusUpdate: new Date(),
        metadata: {
          user_id: userId,
          plan_id: planId,
          purpose: "subscription",
        },
      },
    });

    await order.save();

    return NextResponse.json({
      success: true,
      subscriptionId: result.data.subscriptionId,
      orderId: order._id,
      orderNumber: order.orderNumber,
      plan: {
        name: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        intervalDays: plan.intervalDays,
      },
      message: "Subscription created. Payment link will be sent via email.",
    });
  } catch (error) {
    console.error("❌ Create subscription error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}
