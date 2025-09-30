import { connectToDatabase } from "@/lib/db";
import voletService from "@/lib/paymentServices/voletService";
import PaymentSettings from "@/models/PaymentSettings";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Get Volet payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "volet",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "Volet payment method is not configured or active" },
        { status: 400 }
      );
    }

    // Update the service with database credentials
    voletService.setCredentials(
      paymentSettings.apiKey,
      paymentSettings.apiSecret
    );

    const result = await voletService.getSupportedCurrencies();

    return NextResponse.json({
      success: true,
      currencies: result.data,
    });
  } catch (error) {
    console.error("Volet currencies error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get supported currencies" },
      { status: 500 }
    );
  }
}
