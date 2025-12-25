import { connectToDatabase } from "@/lib/db";
import voletService from "@/lib/paymentServices/voletService";
import { calculateServiceFee, formatFeeInfo } from "@/lib/paymentUtils";
import PaymentSettings from "@/models/PaymentSettings";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import { NextResponse } from "next/server";

/**
 * POST /api/payments/volet/deposit
 * Create a Volet deposit payment following the NOWPayments pattern
 */
export async function POST(request) {
  try {
    const {
      amount,
      currency = "USD",
      userId,
      customerEmail,
    } = await request.json();

    // Validate amount
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Validate minimum amount
    if (Number(amount) < 1) {
      return NextResponse.json(
        { 
          error: "Minimum deposit amount is $1",
          details: "Volet requires a minimum of $1 USD equivalent."
        }, 
        { status: 400 }
      );
    }

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get Volet payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "volet",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "Volet payment method is not configured or active" },
        { status: 400 }
      );
    }

    // Calculate service fee
    const feeCalculation = calculateServiceFee(
      amount,
      paymentSettings.feeSettings
    );
    const finalAmount = feeCalculation.totalAmount;

    // Initialize Volet service with credentials from database
    voletService.initialize(paymentSettings);

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const origin = new URL(request.url).origin;

    // Generate unique deposit ID
    const depositId = `deposit-volet-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Create Volet payment
    const result = await voletService.createPayment({
      orderId: depositId,
      amount: finalAmount,
      currency: currency.toUpperCase(),
      description: `Wallet Deposit - $${amount}${feeCalculation.feeAmount > 0 ? ` (Fee: $${feeCalculation.feeAmount.toFixed(2)})` : ''}`,
      statusUrl: `${origin}/api/payments/volet/webhook`,
      successUrl: `${origin}/payment-success?order_id=${depositId}&type=deposit`,
      failUrl: `${origin}/payment-cancel?order_id=${depositId}&type=deposit`,
      customerEmail: customerEmail || user.email,
    });

    if (!result.success || !result.data) {
      console.error("[Volet Deposit] Failed to create payment:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to create Volet payment" },
        { status: 500 }
      );
    }

    const payment = result.data;

    // Validate checkout URL
    if (!payment.checkoutUrl) {
      console.error("[Volet Deposit] No checkout URL in response:", payment);
      return NextResponse.json(
        { error: "Volet did not return a checkout URL" },
        { status: 500 }
      );
    }

    // Create WalletDeposit record (following NOWPayments pattern)
    const deposit = new WalletDeposit({
      userId,
      amount: Number(amount),                    // Original amount user wants to deposit
      originalAmount: Number(amount),            // Store original amount
      finalAmount: Number(finalAmount),          // Final amount including fees
      serviceFee: Number(feeCalculation.feeAmount), // Service fee amount
      currency: currency.toUpperCase(),
      paymentMethod: "Volet",
      paymentGateway: "Volet",
      status: "pending",
      voletPayment: {
        paymentId: depositId,
        orderId: depositId,
        status: "pending",
        priceAmount: Number(finalAmount),
        priceCurrency: currency.toUpperCase(),
        paymentUrl: payment.checkoutUrl,
        customerEmail: customerEmail || user.email,
        orderDescription: `Wallet Deposit - $${amount}`,
        sciName: paymentSettings.businessId,
        accountEmail: paymentSettings.merchantId,
        callbackReceived: false,
        lastStatusUpdate: new Date(),
        metadata: {
          user_id: userId,
          purpose: "wallet-deposit",
          deposit_id: depositId,
          original_amount: Number(amount),
          service_fee: Number(feeCalculation.feeAmount),
          final_amount: Number(finalAmount),
        },
      },
    });

    await deposit.save();

    console.log("[Volet Deposit] Created deposit:", {
      depositId: deposit.depositId,
      voletPaymentId: depositId,
      amount: finalAmount,
      userId,
    });

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      paymentId: depositId,
      checkoutUrl: payment.checkoutUrl,
      amount: finalAmount,
      originalAmount: amount,
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
    console.error("[Volet Deposit] Error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || "Failed to create Volet deposit" 
      },
      { status: 500 }
    );
  }
}
