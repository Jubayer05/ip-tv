import { connectToDatabase } from "@/lib/db";
import stripeService from "@/lib/paymentServices/stripeService";
import { calculateServiceFee } from "@/lib/paymentUtils";
import PaymentSettings from "@/models/PaymentSettings";
import Order from "@/models/Order";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import { NextResponse } from "next/server";

const REQUEST_ID = `STRIPE-CREATE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export async function POST(request) {
  try {
    console.log(`[${REQUEST_ID}] 🔵 Stripe payment creation started`);

    const body = await request.json();
    const {
      amount,
      currency = "USD",
      userId,
      customerEmail,
      contactInfo,
      meta,
      type = "subscription", // 'subscription' or 'deposit'
    } = body;

    console.log(`[${REQUEST_ID}] Payment details:`, {
      amount,
      currency,
      userId,
      type,
      hasContactInfo: !!contactInfo,
      hasMeta: !!meta,
    });

    // Validation
    if (!amount || Number(amount) <= 0) {
      console.error(`[${REQUEST_ID}] ❌ Invalid amount:`, amount);
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    await connectToDatabase();

    // Get Stripe payment settings
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "stripe",
      isActive: true,
    });

    if (!paymentSettings) {
      console.error(`[${REQUEST_ID}] ❌ Stripe not configured or inactive`);
      return NextResponse.json(
        { error: "Stripe payment method is not configured or active" },
        { status: 400 }
      );
    }

    console.log(`[${REQUEST_ID}] ✅ Stripe settings loaded:`, {
      hasApiKey: !!paymentSettings.apiKey,
      hasWebhookSecret: !!paymentSettings.webhookSecret,
      minAmount: paymentSettings.minAmount,
    });

    // Check minimum amount
    if (Number(amount) < paymentSettings.minAmount) {
      console.error(`[${REQUEST_ID}] ❌ Amount below minimum:`, {
        amount,
        minAmount: paymentSettings.minAmount,
      });
      return NextResponse.json(
        {
          error: `Minimum amount is $${paymentSettings.minAmount}`,
        },
        { status: 400 }
      );
    }

    // Calculate service fee
    const feeCalculation = calculateServiceFee(
      amount,
      paymentSettings.feeSettings
    );
    const finalAmount = feeCalculation.totalAmount;

    console.log(`[${REQUEST_ID}] 💰 Fee calculation:`, {
      originalAmount: amount,
      serviceFee: feeCalculation.feeAmount,
      finalAmount: finalAmount,
      feeType: feeCalculation.feeType,
    });

    // Configure Stripe service
    stripeService.initialize(paymentSettings.apiKey);
    
    if (paymentSettings.webhookSecret) {
      stripeService.setWebhookSecret(paymentSettings.webhookSecret);
    }

    if (paymentSettings.apiSecret) {
      stripeService.setPublicKey(paymentSettings.apiSecret);
    }

    const origin = new URL(request.url).origin;

    // Handle based on type
    if (type === "deposit") {
      console.log(`[${REQUEST_ID}] 💳 Processing as deposit`);
      return await handleDepositPayment({
        amount,
        finalAmount,
        currency,
        userId,
        customerEmail,
        feeCalculation,
        origin,
        REQUEST_ID,
      });
    } else {
      console.log(`[${REQUEST_ID}] 📦 Processing as subscription/package purchase`);
      return await handleSubscriptionPayment({
        amount,
        finalAmount,
        currency,
        userId,
        customerEmail,
        contactInfo,
        meta,
        feeCalculation,
        origin,
        REQUEST_ID,
      });
    }

  } catch (error) {
    console.error(`[${REQUEST_ID}] ❌ Stripe payment error:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Stripe payment" },
      { status: 500 }
    );
  }
}

// Handle deposit payment
async function handleDepositPayment({
  amount,
  finalAmount,
  currency,
  userId,
  customerEmail,
  feeCalculation,
  origin,
  REQUEST_ID,
}) {
  try {
    // Verify user exists
    const user = userId ? await User.findById(userId) : null;
    if (userId && !user) {
      console.error(`[${REQUEST_ID}] ❌ User not found:`, userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate deposit ID
    const depositId = `deposit-stripe-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    console.log(`[${REQUEST_ID}] 📝 Creating deposit record:`, depositId);

    // Prepare metadata
    const stripeMetadata = {
      user_id: userId || "guest",
      purpose: "deposit",
      deposit_id: depositId,
      type: "deposit",
      original_amount: amount.toString(),
      service_fee: feeCalculation.feeAmount.toString(),
    };

    // Create Stripe checkout session
    const checkoutSession = await stripeService.createDepositCheckoutSession({
      amount: finalAmount,
      currency,
      depositId,
      customerEmail: customerEmail || user?.email,
      metadata: stripeMetadata,
      successUrl: `${origin}/payment-status/${depositId}?status=success&provider=stripe&type=deposit`,
      cancelUrl: `${origin}/payment-status/${depositId}?status=cancelled&provider=stripe&type=deposit`,
    });

    console.log(`[${REQUEST_ID}] ✅ Stripe checkout session created:`, {
      sessionId: checkoutSession.sessionId,
    });

    // Create wallet deposit record
    const deposit = new WalletDeposit({
      userId: userId || null,
      amount: Number(amount),
      originalAmount: Number(amount),
      finalAmount: Number(finalAmount),
      serviceFee: Number(feeCalculation.feeAmount),
      currency: currency.toUpperCase(),
      status: "pending",
      paymentMethod: "Card",
      paymentGateway: "Stripe",
      stripePayment: {
        sessionId: checkoutSession.sessionId,
        paymentIntentId: checkoutSession.paymentIntentId || null,
        status: "new",
        amount: Number(finalAmount),
        currency: currency.toLowerCase(),
        callbackReceived: false,
        lastStatusUpdate: new Date(),
      },
    });

    await deposit.save();

    console.log(`[${REQUEST_ID}] ✅ Deposit record created:`, {
      depositId: deposit.depositId,
      _id: deposit._id,
    });

    return NextResponse.json({
      success: true,
      paymentId: deposit.depositId,
      depositId: deposit.depositId,
      sessionId: checkoutSession.sessionId,
      checkoutUrl: checkoutSession.sessionUrl,
      amount: finalAmount,
      originalAmount: amount,
      currency: currency.toUpperCase(),
      status: "pending",
      gateway: "stripe",
      type: "deposit",
    });

  } catch (error) {
    console.error(`[${REQUEST_ID}] ❌ Deposit payment error:`, error);
    throw error;
  }
}

// Handle subscription/package payment
async function handleSubscriptionPayment({
  amount,
  finalAmount,
  currency,
  userId,
  customerEmail,
  contactInfo,
  meta,
  feeCalculation,
  origin,
  REQUEST_ID,
}) {
  try {
    // Verify user or use guest info
    let user = null;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        console.error(`[${REQUEST_ID}] ❌ User not found:`, userId);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // Generate order ID
    const orderId = `order-stripe-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    console.log(`[${REQUEST_ID}] 📦 Creating order record:`, orderId);

    // Prepare metadata
    const stripeMetadata = {
      user_id: userId || "guest",
      purpose: "subscription",
      order_id: orderId,
      type: "subscription",
      product_id: meta?.productId || "",
      variant_id: meta?.variantId || "",
      original_amount: amount.toString(),
      service_fee: feeCalculation.feeAmount.toString(),
    };

    // Create Stripe checkout session
    const checkoutSession = await stripeService.createDepositCheckoutSession({
      amount: finalAmount,
      currency,
      depositId: orderId,
      customerEmail: customerEmail || user?.email || contactInfo?.email,
      metadata: stripeMetadata,
      successUrl: `${origin}/payment-status/${orderId}?status=success&provider=stripe&type=subscription`,
      cancelUrl: `${origin}/payment-status/${orderId}?status=cancelled&provider=stripe&type=subscription`,
    });

    console.log(`[${REQUEST_ID}] ✅ Stripe checkout session created:`, {
      sessionId: checkoutSession.sessionId,
    });

    // Create order record
    const order = new Order({
      userId: userId || null,
      customerEmail: customerEmail || user?.email || contactInfo?.email,
      contactInfo: contactInfo || {
        fullName: (user?.profile?.firstName || "") + " " + (user?.profile?.lastName || "") || user?.username || "",
        email: customerEmail || user?.email || "",
        phone: user?.profile?.phone || "",
      },
      products: [{
        productId: meta?.productId,
        variantId: meta?.variantId,
        quantity: meta?.quantity || 1,
        price: Number(amount),
        duration: 0,
        devicesAllowed: meta?.devices || 1,
        adultChannels: meta?.adultChannels || false,
      }],
      productId: meta?.productId,
      variantId: meta?.variantId,
      quantity: meta?.quantity || 1,
      amount: Number(amount),
      originalAmount: Number(amount),
      finalAmount: Number(finalAmount),
      totalAmount: Number(finalAmount),
      serviceFee: Number(feeCalculation.feeAmount),
      currency: currency.toUpperCase(),
      paymentMethod: "Card",
      paymentGateway: "Stripe",
      status: "pending",
      paymentStatus: "pending",
      stripePayment: {
        sessionId: checkoutSession.sessionId,
        paymentIntentId: checkoutSession.paymentIntentId || null,
        status: "new",
        amount: Number(finalAmount),
        currency: currency.toLowerCase(),
        callbackReceived: false,
        lastStatusUpdate: new Date(),
      },
      metadata: {
        devices: meta?.devices,
        adultChannels: meta?.adultChannels,
        isCustomQuantity: meta?.isCustomQuantity,
      },
    });

    await order.save();

    console.log(`[${REQUEST_ID}] ✅ Order record created:`, {
      orderNumber: order.orderNumber,
      _id: order._id,
    });

    return NextResponse.json({
      success: true,
      paymentId: order.orderNumber,
      orderId: order.orderNumber,
      sessionId: checkoutSession.sessionId,
      checkoutUrl: checkoutSession.sessionUrl,
      amount: finalAmount,
      originalAmount: amount,
      currency: currency.toUpperCase(),
      status: "pending",
      gateway: "stripe",
      type: "subscription",
    });

  } catch (error) {
    console.error(`[${REQUEST_ID}] ❌ Subscription payment error:`, error);
    throw error;
  }
}
