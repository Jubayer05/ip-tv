// src/app/api/payments/hoodpay/deposit/route.js
/**
 * NOTE: This route is maintained for backward compatibility.
 * New implementations should use /api/payments/hoodpay/create with meta.purpose = "deposit"
 * 
 * This route can be merged into the create route or kept for specific deposit flows.
 */
import { connectToDatabase } from "@/lib/db";
import hoodpayService from "@/lib/paymentServices/hoodpayService";
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

    // Calculate service fee
    const feeCalculation = calculateServiceFee(
      amount,
      paymentSettings.feeSettings
    );
    const finalAmount = feeCalculation.totalAmount;

    // Configure service with database credentials
    hoodpayService.setApiKey(paymentSettings.apiKey);
    
    // Use businessId if available, fallback to merchantId for backward compatibility
    const businessId = paymentSettings.businessId || paymentSettings.merchantId;
    if (!businessId) {
      return NextResponse.json(
        { error: "HoodPay Business ID is not configured. Please add it in payment settings." },
        { status: 400 }
      );
    }
    hoodpayService.setBusinessId(businessId);
    
    if (paymentSettings.webhookSecret) {
      hoodpayService.setWebhookSecret(paymentSettings.webhookSecret);
    }

    if (paymentSettings.allowedIps && paymentSettings.allowedIps.length > 0) {
      hoodpayService.setAllowedIps(paymentSettings.allowedIps);
    }

    const origin = new URL(request.url).origin;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate deposit ID
    const depositId = `deposit-hoodpay-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Prepare metadata for HoodPay
    const hoodpayMetadata = {
      user_id: userId,
      purpose: "deposit",
      deposit_id: depositId,
    };

    console.log("💳 Creating HoodPay deposit:", {
      depositId,
      amount: finalAmount,
      originalAmount: amount,
      serviceFee: feeCalculation.feeAmount,
      userId,
    });

    let payment;
    let hoodpayPaymentData = {
      status: "pending",
      amount: Number(finalAmount), // Use final amount including fees
      currency: currency.toUpperCase(),
      customerEmail: customerEmail || user.email,
      description: `Wallet Deposit${
        feeCalculation.feeAmount > 0
          ? ` (${formatFeeInfo(feeCalculation)})`
          : ""
      }`,
      callbackReceived: false,
      lastStatusUpdate: new Date(),
      metadata: hoodpayMetadata,
    };

    try {
      // Create HoodPay payment with final amount
      const result = await hoodpayService.createPayment({
        amount: finalAmount,
        currency,
        orderId: depositId,
        orderDescription: `Wallet Deposit - $${amount}${feeCalculation.feeAmount > 0 ? ` (Fee: $${feeCalculation.feeAmount})` : ''}`,
        customerEmail: customerEmail || user.email,
        metadata: hoodpayMetadata,
        notifyUrl: `${origin}/api/payments/hoodpay/webhook`,
        returnUrl: `${origin}/payment-success?depositId=${depositId}&amount=${finalAmount}&gateway=hoodpay&type=deposit`,
        cancelUrl: `${origin}/payment-cancel?depositId=${depositId}&gateway=hoodpay&type=deposit`,
      });

      payment = result.data;

      console.log("✅ HoodPay payment created:", {
        paymentId: payment.paymentId,
        paymentUrl: payment.paymentUrl?.substring(0, 50) + "...",
        status: payment.status,
      });

      // Update HoodPay payment data with API response
      hoodpayPaymentData = {
        ...hoodpayPaymentData,
        paymentId: payment.paymentId,
        paymentUrl: payment.paymentUrl,
        status: payment.status,
      };
    } catch (apiError) {
      console.error("❌ HoodPay API Error:", apiError);
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
      amount: Number(amount), // Original amount user wants to deposit
      originalAmount: Number(amount), // Store original amount
      finalAmount: Number(finalAmount), // Final amount including fees
      serviceFee: Number(feeCalculation.feeAmount), // Service fee amount
      currency: currency.toUpperCase(),
      status: "pending",
      paymentMethod: "Card",
      paymentGateway: "HoodPay",
      hoodpayPayment: {
        paymentId: payment.paymentId,
        orderId: depositId,
        status: payment.status || "pending",
        amount: Number(finalAmount), // Store final amount
        currency: currency.toUpperCase(),
        paymentUrl: payment.paymentUrl,
        customerEmail: customerEmail || user.email,
        description: `Wallet Deposit - $${amount}`,
        callbackReceived: false,
        lastStatusUpdate: new Date(),
        metadata: hoodpayMetadata,
      },
    });

    await deposit.save();

    console.log("� Deposit record created:", {
      depositId: deposit.depositId,
      _id: deposit._id,
    });

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      paymentId: payment.paymentId,
      checkoutUrl: payment.paymentUrl,
      amount: finalAmount, // Return final amount
      originalAmount: amount, // Return original amount
      currency: currency.toUpperCase(),
      status: payment.status || "pending",
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
    console.error("❌ HoodPay deposit error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create HoodPay deposit" },
      { status: 500 }
    );
  }
}
