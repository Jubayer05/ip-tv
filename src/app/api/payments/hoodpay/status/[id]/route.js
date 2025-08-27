import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
  try {
    const apiKey = process.env.HOODPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "HOODPAY_API_KEY not configured" },
        { status: 500 }
      );
    }
    const id = params?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const res = await fetch(`https://api.hoodpay.io/v1/payment/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to fetch HoodPay status" },
        { status: 500 }
      );
    }

    // Normalize statuses to match our client
    const s = (data?.status || "").toLowerCase();
    const normalized =
      s === "paid" || s === "completed"
        ? "completed"
        : s === "failed" || s === "canceled"
        ? "failed"
        : "pending";

    return NextResponse.json({ status: normalized, raw: data });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "HoodPay status error" },
      { status: 500 }
    );
  }
}
