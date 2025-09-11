// src/app/api/payments/hoodpay/deposit/route.js
import { connectToDatabase } from "@/lib/db";
import hoodpayService from "@/lib/paymentServices/hoodpayService";
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

    // Get HoodPay payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "hoodpay",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "HoodPay payment method is not configured or active" },
        { status: 400 }
      );
    }

    // Update the service with database credentials
    hoodpayService.apiKey = paymentSettings.apiKey;
    if (paymentSettings.apiSecret) {
      hoodpayService.apiSecret = paymentSettings.apiSecret;
    }

    const origin = new URL(request.url).origin;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare metadata for HoodPay
    const hoodpayMetadata = {
      user_id: userId,
      purpose: "deposit",
    };

    let payment;
    let hoodpayPaymentData = {
      status: "pending",
      amount: Number(amount),
      currency: currency.toUpperCase(),
      customerEmail: customerEmail || "",
      description: "Wallet Deposit",
      callbackReceived: false,
      lastStatusUpdate: new Date(),
      metadata: hoodpayMetadata,
    };

    try {
      // Create HoodPay payment
      const result = await hoodpayService.createPayment({
        amount,
        currency,
        customerEmail,
        description: "Wallet Deposit",
        callbackUrl: `${origin}/api/payments/hoodpay/webhook`,
        successUrl: `${origin}/payment-status/deposit-success`,
        metadata: hoodpayMetadata,
      });

      payment = result.data;

      // Update HoodPay payment data with API response
      hoodpayPaymentData = {
        ...hoodpayPaymentData,
        paymentId: payment.id,
        paymentUrl: payment.payment_url,
      };
    } catch (apiError) {
      console.error("HoodPay API Error:", apiError);
      return NextResponse.json(
        {
          success: false,
          error: "HoodPay payment creation failed",
          details: apiError.message,
        },
        { status: 500 }
      );
    }

    // Create wallet deposit record
    const deposit = new WalletDeposit({
      userId,
      amount: Number(amount),
      currency,
      paymentMethod: "Card",
      paymentGateway: "HoodPay",
      hoodpayPayment: hoodpayPaymentData,
    });

    await deposit.save();

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      paymentId: payment.id,
      checkoutUrl: payment.payment_url,
      amount,
      currency,
      status: "pending",
    });
  } catch (error) {
    console.error("HoodPay deposit error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create HoodPay deposit" },
      { status: 500 }
    );
  }
}
