import { connectToDatabase } from "@/lib/db";
import voletService from "@/lib/paymentServices/voletService";
import PaymentSettings from "@/models/PaymentSettings";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      amount,
      currency = "USD",
      targetCurrency = "BTC",
    } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
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

    // Update the service with database credentials
    voletService.setCredentials(
      paymentSettings.apiKey,
      paymentSettings.apiSecret
    );

    // Create deposit/payment request
    const result = await voletService.createPayment({
      orderName: "Wallet Deposit",
      orderNumber: `deposit-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      sourceCurrency: currency,
      sourceAmount: amount,
      currency: targetCurrency,
      email: "",
      callbackUrl: `${new URL(request.url).origin}/api/payments/volet/webhook`,
      description: `Wallet deposit of ${amount} ${currency}`,
      plugin: "IPTV_PLATFORM",
      version: "1.0",
    });

    const payment = result.data;

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutUrl: payment.payment_url,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      walletAddress: payment.wallet_address,
      expiresAt: payment.expires_at
        ? new Date(payment.expires_at * 1000).toISOString()
        : null,
    });
  } catch (error) {
    console.error("Volet deposit error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create deposit" },
      { status: 500 }
    );
  }
}
