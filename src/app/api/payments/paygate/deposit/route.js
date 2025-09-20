import { connectToDatabase } from "@/lib/db";
import paygateService from "@/lib/paymentServices/paygateService";
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
      provider = "moonpay",
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

    // Get PayGate payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "paygate",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "PayGate payment method is not configured or active" },
        { status: 400 }
      );
    }

    // Calculate service fee
    const feeCalculation = calculateServiceFee(
      amount,
      paymentSettings.feeSettings
    );
    const finalAmount = feeCalculation.totalAmount;

    // Update the service with database credentials
    paygateService.merchantAddress =
      paymentSettings.merchantAddress || process.env.PAYGATE_MERCHANT_ADDRESS;

    const origin = new URL(request.url).origin;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare metadata for PayGate
    const paygateMetadata = {
      user_id: userId,
      purpose: "deposit",
    };

    let payment;
    let paygatePaymentData = {
      status: "pending",
      amount: Number(finalAmount), // Use final amount including fees
      currency: currency.toUpperCase(),
      customerEmail: customerEmail || "",
      description: `Wallet Deposit${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ''}`,
      callbackReceived: false,
      lastStatusUpdate: new Date(),
      metadata: paygateMetadata,
      provider: provider,
    };

    try {
      // Create PayGate payment with final amount
      const result = await paygateService.createPayment({
        amount: finalAmount, // Use final amount including fees
        currency,
        customerEmail,
        description: `Wallet Deposit${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ''}`,
        callbackUrl: `${origin}/api/payments/paygate/webhook`,
        successUrl: `${origin}/payment-status/deposit-success`,
        provider,
        metadata: paygateMetadata,
      });

      payment = result.data;

      // Update PayGate payment data with API response
      paygatePaymentData = {
        ...paygatePaymentData,
        paymentId: payment.id,
        paymentUrl: payment.payment_url,
        walletData: payment.wallet_data,
      };
    } catch (apiError) {
      console.error("PayGate API Error:", apiError);
      return NextResponse.json(
        {
          success: false,
          error: "PayGate payment creation failed",
          details: apiError.message,
        },
        { status: 500 }
      );
    }

    // Create wallet deposit record
    const deposit = new WalletDeposit({
      userId,
      amount: Number(amount), // Original amount
      finalAmount: Number(finalAmount), // Final amount including fees
      serviceFee: Number(feeCalculation.feeAmount), // Service fee amount
      currency,
      paymentMethod: "Crypto",
      paymentGateway: "PayGate",
      paygatePayment: paygatePaymentData,
    });

    await deposit.save();

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      paymentId: payment.id,
      checkoutUrl: payment.payment_url,
      amount: finalAmount, // Return final amount
      currency,
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
    console.error("PayGate deposit error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create PayGate deposit" },
      { status: 500 }
    );
  }
}
