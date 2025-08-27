import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      amount,
      currency = "USD",
      userId,
      customerEmail,
      meta,
    } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NOWPAYMENTS_API_KEY not configured" },
        { status: 500 }
      );
    }

    const origin = new URL(request.url).origin;
    const orderId = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Create payment payload
    const payload = {
      price_amount: amount,
      price_currency: currency.toLowerCase(),
      order_id: orderId,
      order_description: `IPTV Subscription - ${
        meta?.productId || "Unknown Product"
      }`,
      ipn_callback_url: `${origin}/api/payments/nowpayment/webhook`,
      success_url: `${origin}/payment-status/${orderId}?status=success`,
      cancel_url: `${origin}/payment-status/${orderId}?status=canceled`,
      partially_paid_url: `${origin}/payment-status/${orderId}?status=partial`,
      is_fixed_rate: true,
      is_fee_paid_by_user: false,
      customer_email: customerEmail || "",
    };

    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to create NOWPayments invoice" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: data.id,
      checkoutUrl: data.invoice_url,
      orderId: data.order_id,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "NOWPayments create error" },
      { status: 500 }
    );
  }
}
