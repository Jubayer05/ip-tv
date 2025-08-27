import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      amount,
      currency = "USD",
      customerEmail,
      meta,
    } = await request.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const apiKey = process.env.HOODPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "HOODPAY_API_KEY not configured" },
        { status: 500 }
      );
    }

    const origin = new URL(request.url).origin;
    const body = {
      amount,
      currency,
      customer_email: customerEmail || "",
      description: "IPTV Subscription",
      callback_url: `${origin}/api/payments/hoodpay/webhook`,
      success_url: `${origin}`,
      // metadata: meta // if supported
    };

    const res = await fetch("https://api.hoodpay.io/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.id || !data?.payment_url) {
      return NextResponse.json(
        { error: data?.message || "Failed to create HoodPay payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: data.id,
      checkoutUrl: data.payment_url,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "HoodPay create error" },
      { status: 500 }
    );
  }
}
