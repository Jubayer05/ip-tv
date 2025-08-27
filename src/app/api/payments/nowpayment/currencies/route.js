import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NOWPAYMENTS_API_KEY not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api-sandbox.nowpayments.io/v1/currencies", {
      headers: {
        "x-api-key": apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to fetch currencies" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Failed to fetch currencies" },
      { status: 500 }
    );
  }
}
