import { connectToDatabase } from "@/lib/db";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsServiceV2";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      planId,
      userId,
      customerEmail,
      useEmailSubscription = false,
    } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    if (!userId && !customerEmail) {
      return NextResponse.json(
        { error: "User ID or customer email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get subscription plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
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

    // Get user email
    let email = customerEmail;
    let user = null;
    let contactInfo = null;

    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      email = user.email;
      contactInfo = {
        fullName: `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() || user.profile?.username || user.email,
        email: user.email,
        phone: user.profile?.phone || "",
      };
    } else {
      contactInfo = {
        fullName: "Guest",
        email: customerEmail,
        phone: "",
      };
    }

    const orderId = `sub-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    console.log("📧 Creating subscription for:", email);

    let result;

    if (useEmailSubscription && plan.nowpaymentsSubscriptionId) {
      // Use NOWPayments email subscription
      result = await nowpaymentsService.createSubscription({
        subscription_plan_id: plan.nowpaymentsSubscriptionId,
        email: email,
        order_id: orderId,
        order_description: `Subscription: ${plan.name}`,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: "Failed to create email subscription" },
          { status: 400 }
        );
      }
    } else {
      // Create invoice for manual subscription
      result = await nowpaymentsService.createInvoice({
        price_amount: plan.amount,
        price_currency: plan.currency.toLowerCase(),
        order_id: orderId,
        order_description: `Subscription: ${plan.name}`,
        ipn_callback_url: `${baseUrl}/api/payments/nowpayment/webhook`,
        success_url: `${baseUrl}/subscription/success?orderId=${orderId}`,
        cancel_url: `${baseUrl}/subscription/cancel?orderId=${orderId}`,
        customer_email: email,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: "Failed to create subscription invoice" },
          { status: 400 }
        );
      }
    }

    // Create order with subscription
    const order = new Order({
      orderNumber: orderId,
      userId: userId || null,
      guestEmail: userId ? null : customerEmail,
      products: [
        {
          productId: null,
          variantId: null,
          quantity: 1,
          price: plan.amount,
          duration: plan.intervalDays,
          devicesAllowed: plan.features?.devicesAllowed || 1,
          adultChannels: plan.features?.adultChannels || false,
        },
      ],
      totalAmount: plan.amount,
      originalAmount: plan.amount,
      serviceFee: 0,
      paymentMethod: "Cryptocurrency",
      paymentGateway: "NOWPayments",
      paymentStatus: "pending",
      contactInfo: contactInfo,
      status: "new",
      subscription: {
        isActive: false,
        planId: plan._id,
        planName: plan.name,
        intervalDays: plan.intervalDays,
        nextBillingDate: null,
        lastBillingDate: null,
        autoRenew: true,
        status: "inactive",
      },
      nowpaymentsPayment: {
        subscriptionId: result.data.subscriptionId || null,
        subscriptionPlanId: plan.nowpaymentsSubscriptionId || null,
        isRecurring: true,
        invoiceId: result.data.invoiceId || null,
        paymentStatus: "waiting",
        callbackReceived: false,
        lastStatusUpdate: new Date(),
      },
    });

    await order.save();

    console.log("✅ Subscription order created:", order._id);

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: orderId,
      subscriptionId: result.data.subscriptionId,
      invoiceUrl: result.data.invoiceUrl,
      plan: {
        name: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        intervalDays: plan.intervalDays,
      },
    });
  } catch (error) {
    console.error("❌ Create subscription error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}
