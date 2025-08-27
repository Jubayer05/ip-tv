import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
  try {
    const apiKey = process.env.PLISIO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "PLISIO_API_KEY not configured" },
        { status: 500 }
      );
    }
    const id = params?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const res = await fetch(
      `https://api.plisio.net/api/v1/invoices/${id}?api_key=${apiKey}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.status !== "success") {
      return NextResponse.json(
        { error: data?.data || "Failed to fetch Plisio status" },
        { status: 500 }
      );
    }

    // data.data.status: pending | paid | error | canceled | expired | ...
    const s = data?.data?.status;
    const normalized =
      s === "paid" || s === "completed"
        ? "completed"
        : s === "error" || s === "canceled" || s === "expired"
        ? "failed"
        : "pending";

    return NextResponse.json({ status: normalized, raw: data?.data });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Plisio status error" },
      { status: 500 }
    );
  }
}
