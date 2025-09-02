import plisioService from "@/lib/paymentServices/plisioService";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const result = await plisioService.getSupportedCurrencies();

    return NextResponse.json({
      success: true,
      currencies: result.data,
    });
  } catch (error) {
    console.error("Plisio get currencies error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get supported currencies" },
      { status: 500 }
    );
  }
}
