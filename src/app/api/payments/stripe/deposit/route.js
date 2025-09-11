import { connectToDatabase } from "@/lib/db";
import stripeService from "@/lib/paymentServices/stripeService";
import PaymentSettings from "@/models/PaymentSettings";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      amount,
      currency = "USD",
      userId,
      customerEmail,
    } = await request.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get Stripe payment settings from database
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

    // Update the service with database credentials
    stripeService.apiKey = paymentSettings.apiKey;
    if (paymentSettings.apiSecret) {
      stripeService.apiSecret = paymentSettings.apiSecret;
    }

    const origin = new URL(request.url).origin;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create Stripe checkout session for deposit
    const session = await stripeService.createCheckoutSession({
      amount,
      currency: currency.toLowerCase(),
      orderName: "Wallet Deposit",
      customerEmail,
      metadata: {
        userId: userId,
        purpose: "deposit",
      },
      successUrl: `${origin}/payment-status/deposit-success`,
      cancelUrl: `${origin}/`,
    });

    // Create wallet deposit record
    const deposit = new WalletDeposit({
      userId,
      amount: Number(amount),
      currency,
      paymentMethod: "Card",
      paymentGateway: "Stripe",
      stripePayment: {
        sessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        status: "new",
        amount: Math.round(Number(amount) * 100),
        currency: currency.toLowerCase(),
        callbackReceived: false,
        lastStatusUpdate: new Date(),
      },
    });

    await deposit.save();

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      paymentId: session.id,
      checkoutUrl: session.url,
      amount,
      currency,
      status: "new",
    });
  } catch (error) {
    console.error("Stripe deposit error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Stripe deposit" },
      { status: 500 }
    );
  }
}
