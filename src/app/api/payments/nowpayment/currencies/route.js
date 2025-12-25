import nowpaymentsService from "@/lib/paymentServices/nowpaymentsServiceV2";
import PaymentSettings from "@/models/PaymentSettings";
import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    // Get available currencies
    const result = await nowpaymentsService.getAvailableCurrencies();

    return NextResponse.json({
      success: true,
      currencies: result.currencies,
      count: result.currencies.length,
    });
  } catch (error) {
    console.error("Currencies error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch currencies" },
      { status: 500 }
    );
  }
}
