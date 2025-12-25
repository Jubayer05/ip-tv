import paygateService from "@/lib/paymentServices/paygateService";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestId = `convert-${Date.now()}`;
  console.log(`[PayGate Convert ${requestId}] Request received`);
  
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const value = searchParams.get("value");

    console.log(`[PayGate Convert ${requestId}] Parameters:`, {
      from,
      value,
      url: request.url
    });

    if (!from || !value) {
      console.warn(`[PayGate Convert ${requestId}] Missing required parameters`);
      return NextResponse.json(
        { error: "from currency and value are required" },
        { status: 400 }
      );
    }

    if (Number(value) <= 0) {
      console.warn(`[PayGate Convert ${requestId}] Invalid value:`, value);
      return NextResponse.json(
        { error: "Value must be greater than 0" },
        { status: 400 }
      );
    }

    console.log(`[PayGate Convert ${requestId}] Calling PayGate API for conversion`);
    const result = await paygateService.convertToUSD(from, value);

    console.log(`[PayGate Convert ${requestId}] Conversion successful:`, {
      from,
      value,
      usdValue: result.data?.usd_value,
      rate: result.data?.rate
    });

    return NextResponse.json({
      success: true,
      ...result.data,
    });
  } catch (error) {
    console.error(`[PayGate Convert ${requestId}] Error:`, {
      message: error?.message,
      stack: error?.stack,
      response: error?.response?.data
    });
    return NextResponse.json(
      { error: error?.message || "Failed to convert currency" },
      { status: 500 }
    );
  }
}
