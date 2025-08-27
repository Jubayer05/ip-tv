import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get("amount");
    const currencyFrom = searchParams.get("currency_from") || "usd";
    const currencyTo = searchParams.get("currency_to") || "btc";

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NOWPAYMENTS_API_KEY not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api-sandbox.nowpayments.io/v1/estimate?amount=${amount}&currency_from=${currencyFrom}&currency_to=${currencyTo}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to get estimate" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Failed to get estimate" },
      { status: 500 }
    );
  }
}
