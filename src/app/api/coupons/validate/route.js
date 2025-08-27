import { connectToDatabase } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();
    const { code, amount } = await request.json();

    const normalizedCode = (code || "").toString().trim().toUpperCase();
    const orderAmount = Number(amount || 0);

    if (!normalizedCode) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }
    if (Number.isNaN(orderAmount) || orderAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Order amount must be greater than 0" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findOne({ code: normalizedCode });
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    if (!coupon.isCurrentlyValid(orderAmount)) {
      return NextResponse.json(
        { success: false, error: "Coupon is not valid for this order" },
        { status: 400 }
      );
    }

    const discountAmount = coupon.calculateDiscount(orderAmount);
    const finalTotal = Math.max(
      0,
      Math.round((orderAmount - discountAmount) * 100) / 100
    );

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },
      discountAmount,
      finalTotal,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Validation failed", details: e.message },
      { status: 500 }
    );
  }
}
