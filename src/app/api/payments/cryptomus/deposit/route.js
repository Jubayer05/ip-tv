import { connectToDatabase } from "@/lib/db";
import cryptomusService from "@/lib/paymentServices/cryptomusService";
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

    // Get Cryptomus payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "cryptomus",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "Cryptomus payment method is not configured or active" },
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
    cryptomusService.apiKey = paymentSettings.apiKey;
    if (paymentSettings.apiSecret) {
      cryptomusService.apiSecret = paymentSettings.apiSecret;
    }

    const origin = new URL(request.url).origin;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const depositId = `cryptomus-${Date.now()}-${Math.floor(
      Math.random() * 1e6
    )}`;

    // Create Cryptomus payment for deposit with final amount
    const result = await cryptomusService.createPayment({
      amount: finalAmount.toString(), // Use final amount including fees
      currency,
      orderId: depositId,
      description: `Wallet Deposit${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ''}`,
      urlReturn: `${origin}/payment-status/deposit-success`,
      urlCallback: `${origin}/api/payments/cryptomus/webhook`,
      isTest: process.env.NODE_ENV !== "production",
      lifetime: 7200, // 2 hours
      toCurrency: "USDT",
      contactEmail: customerEmail,
      name: user.name || user.email,
      urlSuccess: `${origin}/payment-status/deposit-success`,
      urlFailed: `${origin}/payment-status/deposit-failed`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to create Cryptomus payment" },
        { status: 400 }
      );
    }

    // Create wallet deposit record
    const deposit = new WalletDeposit({
      userId,
      amount: Number(amount), // Original amount
      finalAmount: Number(finalAmount), // Final amount including fees
      serviceFee: Number(feeCalculation.feeAmount), // Service fee amount
      currency,
      paymentMethod: "Cryptocurrency",
      paymentGateway: "Cryptomus",
      cryptomusPayment: {
        paymentId: result.paymentId,
        orderId: result.orderId,
        amount: result.amount,
        currency: result.currency,
        toCurrency: result.toCurrency,
        toAmount: result.toAmount,
        address: result.address,
        network: result.network,
        from: result.from,
        status: result.status,
        isFinal: result.isFinal,
        additionalData: result.additionalData,
        currencies: result.currencies,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        expiredAt: result.expiredAt,
        isTest: result.isTest,
        paymentMethod: result.paymentMethod,
        paymentStatus: result.paymentStatus,
        transactions: result.transactions,
        callbackReceived: false,
        lastStatusUpdate: new Date(),
      },
    });

    await deposit.save();

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      paymentId: result.paymentId,
      checkoutUrl: result.paymentUrl,
      amount: finalAmount, // Return final amount
      currency,
      toCurrency: result.toCurrency,
      toAmount: result.toAmount,
      address: result.address,
      network: result.network,
      status: result.status,
      expiredAt: result.expiredAt,
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
    console.error("Cryptomus deposit error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Cryptomus deposit" },
      { status: 500 }
    );
  }
}
