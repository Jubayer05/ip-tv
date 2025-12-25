import { connectToDatabase } from "@/lib/db";
import stripeService from "@/lib/paymentServices/stripeService";
import { calculateServiceFee, formatFeeInfo } from "@/lib/paymentUtils";
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

    // Calculate service fee
    const feeCalculation = calculateServiceFee(
      amount,
      paymentSettings.feeSettings
    );
    const finalAmount = feeCalculation.totalAmount;

    // Configure Stripe service with database credentials
    stripeService.initialize(paymentSettings.apiKey);
    
    if (paymentSettings.webhookSecret) {
      stripeService.setWebhookSecret(paymentSettings.webhookSecret);
    }

    if (paymentSettings.apiSecret) {
      stripeService.setPublicKey(paymentSettings.apiSecret);
    }

    const origin = new URL(request.url).origin;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate deposit ID
    const depositId = `deposit-stripe-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Prepare metadata for Stripe
    const stripeMetadata = {
      user_id: userId,
      purpose: "deposit",
      deposit_id: depositId,
      original_amount: amount.toString(),
      service_fee: feeCalculation.feeAmount.toString(),
    };

    console.log("💳 Creating Stripe deposit:", {
      depositId,
      amount: finalAmount,
      originalAmount: amount,
      serviceFee: feeCalculation.feeAmount,
      userId,
    });

    let checkoutSession;
    try {
      // Create Stripe checkout session with final amount
      const result = await stripeService.createDepositCheckoutSession({
        amount: finalAmount,
        currency,
        depositId,
        customerEmail: customerEmail || user.email,
        metadata: stripeMetadata,
        successUrl: `${origin}/payment-status/${depositId}?status=success&provider=stripe&type=deposit`,
        cancelUrl: `${origin}/payment-status/${depositId}?status=cancelled&provider=stripe&type=deposit`,
      });

      checkoutSession = result;

      console.log("✅ Stripe checkout session created:", {
        sessionId: checkoutSession.sessionId,
        sessionUrl: checkoutSession.sessionUrl?.substring(0, 50) + "...",
      });
    } catch (apiError) {
      console.error("❌ Stripe API Error:", apiError);
      return NextResponse.json(
        {
          success: false,
          error: "Stripe payment creation failed",
          details: apiError.message,
        },
        { status: 500 }
      );
    }

    // Create wallet deposit record
    const deposit = new WalletDeposit({
      userId,
      amount: Number(amount), // Original amount user wants to deposit
      originalAmount: Number(amount), // Store original amount
      finalAmount: Number(finalAmount), // Final amount including fees
      serviceFee: Number(feeCalculation.feeAmount), // Service fee amount
      currency: currency.toUpperCase(),
      status: "pending",
      paymentMethod: "Card",
      paymentGateway: "Stripe",
      stripePayment: {
        sessionId: checkoutSession.sessionId,
        paymentIntentId: checkoutSession.paymentIntentId || null,
        status: "new",
        amount: Number(finalAmount), // Store final amount
        currency: currency.toLowerCase(),
        callbackReceived: false,
        lastStatusUpdate: new Date(),
      },
    });

    await deposit.save();

    console.log("💾 Deposit record created:", {
      depositId: deposit.depositId,
      _id: deposit._id,
    });

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      sessionId: checkoutSession.sessionId,
      checkoutUrl: checkoutSession.sessionUrl,
      amount: finalAmount, // Return final amount
      originalAmount: amount, // Return original amount
      currency: currency.toUpperCase(),
      status: "pending",
      // Include fee information in response
      feeInfo: {
        originalAmount: feeCalculation.originalAmount,
        serviceFee: feeCalculation.feeAmount,
        totalAmount: feeCalculation.totalAmount,
        feeType: feeCalculation.feeType,
        feePercentage: feeCalculation.feePercentage,
        feeDescription: formatFeeInfo(feeCalculation),
      },
    });
  } catch (error) {
    console.error("❌ Stripe deposit error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Stripe deposit" },
      { status: 500 }
    );
  }
}
