// src/app/api/payments/plisio/deposit/route.js
import { connectToDatabase } from "@/lib/db";
import plisioService from "@/lib/paymentServices/plisioService";
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

    // Get Plisio payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "plisio",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "Plisio payment method is not configured or active" },
        { status: 400 }
      );
    }

    // Update the service with database credentials
    plisioService.apiKey = paymentSettings.apiKey;
    if (paymentSettings.apiSecret) {
      plisioService.apiSecret = paymentSettings.apiSecret;
    }

    const origin = new URL(request.url).origin;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const depositId = `plisio-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Create Plisio invoice
    const result = await plisioService.createInvoice({
      orderName: "Wallet Deposit",
      orderNumber: depositId,
      sourceCurrency: currency,
      sourceAmount: amount,
      currency: "BTC",
      email: customerEmail || "",
      callbackUrl: `${origin}/api/payments/plisio/callback?json=true`,
      description: `Wallet Deposit - ${depositId}`,
      plugin: "IPTV_PLATFORM",
      version: "1.0",
    });

    const invoice = result.data;

    // Create wallet deposit record
    const deposit = new WalletDeposit({
      userId,
      amount: Number(amount),
      currency,
      paymentMethod: "Cryptocurrency",
      paymentGateway: "Plisio",
      plisioPayment: {
        invoiceId: invoice.id,
        status: invoice.status,
        amount: invoice.amount,
        currency: invoice.currency,
        sourceAmount: invoice.params.source_amount,
        sourceCurrency: invoice.source_currency,
        walletAddress: invoice.wallet_hash,
        confirmations: invoice.confirmations || 0,
        actualSum: invoice.actual_sum || "0.00000000",
        expiresAt: new Date(invoice.expire_at_utc * 1000),
        callbackReceived: false,
        lastStatusUpdate: new Date(),
      },
    });

    await deposit.save();

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      paymentId: invoice.id,
      checkoutUrl: invoice.invoice_url,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      walletAddress: invoice.wallet_hash,
      expiresAt: new Date(invoice.expire_at_utc * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Plisio deposit error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Plisio deposit" },
      { status: 500 }
    );
  }
}
