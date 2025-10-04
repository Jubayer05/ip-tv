import paygateService from "@/lib/paymentServices/paygateService";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const value = searchParams.get("value");

    if (!from || !value) {
      return NextResponse.json(
        { error: "from currency and value are required" },
        { status: 400 }
      );
    }

    if (Number(value) <= 0) {
      return NextResponse.json(
        { error: "Value must be greater than 0" },
        { status: 400 }
      );
    }

    const result = await paygateService.convertToUSD(from, value);

    return NextResponse.json({
      success: true,
      ...result.data,
    });
  } catch (error) {
    console.error("PayGate convert error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to convert currency" },
      { status: 500 }
    );
  }
}
