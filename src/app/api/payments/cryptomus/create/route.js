import { connectToDatabase } from "@/lib/db";
import cryptomusService from "@/lib/paymentServices/cryptomusService";
import { calculateServiceFee, formatFeeInfo } from "@/lib/paymentUtils";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { amount, currency = "USD", userId, customerEmail, meta = {} } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

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

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract metadata
    const {
      productId,
      productName = "IPTV Subscription",
      isDeposit = false,
    } = meta;

    // Generate unique order ID
    const orderId = `cryptomus_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create Cryptomus payment with final amount
    const result = await cryptomusService.createPayment({
      amount: finalAmount.toString(), // Use final amount including fees
      currency,
      orderId,
      description: `${productName}${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ''}`,
      urlReturn: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-status/${orderId}`,
      urlCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/cryptomus/webhook`,
      isTest: process.env.NODE_ENV !== "production",
      lifetime: 7200, // 2 hours
      toCurrency: "USDT",
      contactEmail: customerEmail,
      name: user.name || user.email,
      urlSuccess: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-status/${orderId}?status=success`,
      urlFailed: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-status/${orderId}?status=failed`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to create Cryptomus payment" },
        { status: 400 }
      );
    }

    // Create order with Cryptomus payment details
    const order = new Order({
      userId: user._id,
      productId: productId,
      productName: productName,
      amount: finalAmount, // Store final amount including fees
      originalAmount: amount, // Store original amount
      serviceFee: feeCalculation.feeAmount, // Store service fee
      currency: currency,
      paymentMethod: "cryptomus",
      paymentStatus: "pending",
      orderStatus: "pending",
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
      },
      metadata: {
        isDeposit: isDeposit || false,
        originalAmount: amount,
        originalCurrency: currency,
      },
    });

    await order.save();

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      checkoutUrl: result.paymentUrl,
      orderId: order._id,
      amount: finalAmount, // Return final amount
      currency: currency,
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
    console.error("Cryptomus create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
