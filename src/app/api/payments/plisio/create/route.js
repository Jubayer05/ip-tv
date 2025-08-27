import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { amount, currency = "USD", customerEmail } = await request.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const apiKey = process.env.PLISIO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "PLISIO_API_KEY not configured" },
        { status: 500 }
      );
    }

    const origin = new URL(request.url).origin;
    const orderNumber = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Per docs: required order_name and order_number; GET with query params; add json=true for Node
    const params = new URLSearchParams({
      source_currency: currency,
      source_amount: String(amount),
      order_name: "IPTV Subscription",
      order_number: orderNumber,
      email: customerEmail || "",
      callback_url: `${origin}/api/payments/plisio/webhook?json=true`,
      // Optional:
      // success_callback_url: `${origin}/api/payments/plisio/success?json=true`,
      // fail_callback_url: `${origin}/api/payments/plisio/fail?json=true`,
    });

    const url = `https://api.plisio.net/api/v1/invoices/new?${params.toString()}&api_key=${apiKey}`;

    const res = await fetch(url, { method: "GET", cache: "no-store" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.status !== "success") {
      const message =
        typeof data?.data === "string" ? data?.data : data?.data?.message;
      return NextResponse.json(
        { error: message || "Failed to create Plisio invoice" },
        { status: 500 }
      );
    }

    const invoice = data?.data;
    return NextResponse.json({
      success: true,
      paymentId: invoice?.txn_id,
      checkoutUrl: invoice?.invoice_url,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Plisio create error" },
      { status: 500 }
    );
  }
}
