import { connectToDatabase } from "@/lib/db";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsServiceV2";
import PaymentSettings from "@/models/PaymentSettings";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      amount,
      currency = "USD",
      orderId: providedOrderId,
      orderDescription,
      customerEmail,
      purchaseId, // For partial payments
      successUrl,
      cancelUrl,
    } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get NOWPayments settings
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "nowpayment",
      isActive: true,
    });

    if (!paymentSettings || !paymentSettings.apiKey) {
      return NextResponse.json(
        { error: "NOWPayments not configured" },
        { status: 500 }
      );
    }

    // Configure service
    nowpaymentsService.setApiKey(paymentSettings.apiKey);
    if (paymentSettings.ipnSecret || paymentSettings.apiSecret) {
      nowpaymentsService.setIpnSecret(
        paymentSettings.ipnSecret || paymentSettings.apiSecret
      );
    }
    if (paymentSettings.sandboxMode) {
      nowpaymentsService.setSandboxMode(true);
    }

    const orderId = providedOrderId || `invoice-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    console.log("🧾 Creating invoice:", { orderId, amount, currency });

    // Create invoice
    const result = await nowpaymentsService.createInvoice({
      price_amount: amount,
      price_currency: currency.toLowerCase(),
      order_id: orderId,
      order_description: orderDescription || "IPTV Payment",
      ipn_callback_url: `${baseUrl}/api/payments/nowpayment/webhook`,
      success_url: successUrl || `${baseUrl}/payment/success?orderId=${orderId}`,
      cancel_url: cancelUrl || `${baseUrl}/payment/cancel?orderId=${orderId}`,
      customer_email: customerEmail,
      purchase_id: purchaseId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to create invoice" },
        { status: 400 }
      );
    }

    console.log("✅ Invoice created:", result.data.invoiceId);

    return NextResponse.json({
      success: true,
      invoiceId: result.data.invoiceId,
      invoiceUrl: result.data.invoiceUrl,
      orderId: orderId,
      amount: amount,
      currency: currency,
      expiresAt: result.data.expirationEstimateDate,
    });
  } catch (error) {
    console.error("❌ Create invoice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
