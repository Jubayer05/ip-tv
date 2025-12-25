import { connectToDatabase } from "@/lib/db";
import PaymentSettings from "@/models/PaymentSettings";
import { NextResponse } from "next/server";

/**
 * GET /api/payments/volet/currencies
 * Return supported currencies for Volet SCI
 * 
 * Note: Volet SCI is a hosted checkout that primarily supports fiat currencies.
 * The actual payment methods available depend on the merchant's Volet account settings.
 */
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

    // Volet SCI supports these fiat currencies
    // The actual available currencies depend on merchant account settings
    const supportedCurrencies = [
      { code: "USD", name: "US Dollar", symbol: "$" },
      { code: "EUR", name: "Euro", symbol: "€" },
      { code: "GBP", name: "British Pound", symbol: "£" },
      { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
      { code: "AUD", name: "Australian Dollar", symbol: "A$" },
      { code: "RUB", name: "Russian Ruble", symbol: "₽" },
      { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
    ];

    return NextResponse.json({
      success: true,
      currencies: supportedCurrencies,
      defaultCurrency: "USD",
      note: "Available currencies depend on your Volet merchant account settings",
    });
  } catch (error) {
    console.error("[Volet Currencies] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get supported currencies" },
      { status: 500 }
    );
  }
}
