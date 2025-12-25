import nowpaymentsService from "@/lib/paymentServices/nowpaymentsServiceV2";
import PaymentSettings from "@/models/PaymentSettings";
import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { amount, currencyFrom = "usd", currencyTo = "btc" } = await request.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get payment settings
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
    if (paymentSettings.sandboxMode) {
      nowpaymentsService.setSandboxMode(true);
    }

    // Get estimate
    const result = await nowpaymentsService.getEstimatedPrice(
      amount,
      currencyFrom,
      currencyTo
    );

    // Get minimum amount
    let minAmount = null;
    try {
      const minResult = await nowpaymentsService.getMinimumPaymentAmount(
        currencyTo,
        currencyFrom
      );
      minAmount = minResult.minAmount;
    } catch (error) {
      console.warn("Could not fetch minimum amount:", error);
    }

    return NextResponse.json({
      success: true,
      ...result.data,
      minimumAmount: minAmount,
    });
  } catch (error) {
    console.error("Estimate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get estimate" },
      { status: 500 }
    );
  }
}

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

    await connectToDatabase();

    // Get payment settings
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
    if (paymentSettings.sandboxMode) {
      nowpaymentsService.setSandboxMode(true);
    }

    // Get estimate
    const result = await nowpaymentsService.getEstimatedPrice(
      amount,
      currencyFrom,
      currencyTo
    );

    return NextResponse.json({
      success: true,
      ...result.data,
    });
  } catch (error) {
    console.error("Estimate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get estimate" },
      { status: 500 }
    );
  }
}
