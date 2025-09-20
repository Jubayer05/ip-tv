import { connectToDatabase } from "@/lib/db";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsService";
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

    // Get NOWPayments payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "nowpayment",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "NOWPayments payment method is not configured or active" },
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
    nowpaymentsService.apiKey = paymentSettings.apiKey;
    if (paymentSettings.apiSecret) {
      nowpaymentsService.apiSecret = paymentSettings.apiSecret;
    }

    const origin = new URL(request.url).origin;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate deposit ID
    const depositId = `nowpay-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Prepare metadata for our database
    const nowpaymentsMetadata = {
      user_id: userId,
      purpose: "deposit",
    };

    // Create NOWPayments payment with final amount
    const result = await nowpaymentsService.createPayment({
      priceAmount: finalAmount, // Use final amount including fees
      priceCurrency: currency,
      payCurrency: "btc", // Specify which crypto to pay with
      orderId: depositId,
      orderDescription: `Wallet Deposit${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ''}`,
      ipnCallbackUrl: `${origin}/api/payments/nowpayment/webhook`,
      successUrl: `${origin}/payment-status/deposit-success`,
      cancelUrl: `${origin}/payment-status/deposit-canceled`,
      customerEmail,
    });

    const payment = result.data;

    // Get payment URL from response
    const paymentUrl = nowpaymentsService.getPaymentUrlFromResponse(payment);

    // Create wallet deposit record
    const deposit = new WalletDeposit({
      userId,
      amount: Number(amount), // Original amount
      finalAmount: Number(finalAmount), // Final amount including fees
      serviceFee: Number(feeCalculation.feeAmount), // Service fee amount
      currency,
      paymentMethod: "Cryptocurrency",
      paymentGateway: "NOWPayments",
      nowpaymentsPayment: {
        paymentId: payment.payment_id,
        orderId: payment.order_id,
        status: payment.payment_status || "waiting",
        priceAmount: Number(finalAmount), // Store final amount
        priceCurrency: currency.toLowerCase(),
        payAmount: payment.pay_amount || 0,
        payCurrency: payment.pay_currency || "",
        paymentUrl: paymentUrl,
        customerEmail: customerEmail || "",
        orderDescription: `Wallet Deposit${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ''}`,
        callbackReceived: false,
        lastStatusUpdate: new Date(),
        metadata: nowpaymentsMetadata,
      },
    });

    await deposit.save();

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      paymentId: payment.payment_id,
      checkoutUrl: paymentUrl,
      amount: finalAmount, // Return final amount
      currency,
      status: payment.payment_status || "waiting",
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
    console.error("NOWPayments deposit error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create NOWPayments deposit" },
      { status: 500 }
    );
  }
}
