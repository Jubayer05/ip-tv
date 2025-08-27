import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
  try {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NOWPAYMENTS_API_KEY not configured" },
        { status: 500 }
      );
    }

    const id = params?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const response = await fetch(
      `https://api-sandbox.nowpayments.io/v1/payment/${id}`,
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey
        },
        cache: "no-store"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to fetch NOWPayments status" },
        { status: 500 }
      );
    }

    // Normalize status based on NOWPayments statuses
    const status = data.payment_status;
    let normalizedStatus = "pending";
    
    if (status === "finished" || status === "confirmed") {
      normalizedStatus = "completed";
    } else if (status === "failed" || status === "expired" || status === "refunded") {
      normalizedStatus = "failed";
    } else if (status === "partially_paid") {
      normalizedStatus = "partial";
    }

    return NextResponse.json({ 
      status: normalizedStatus, 
      raw: data,
      paid: normalizedStatus === "completed"
    });

  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "NOWPayments status error" },
      { status: 500 }
    );
  }
}
