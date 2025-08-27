import { connectToDatabase } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { NextResponse } from "next/server";

function codeFromParams(params) {
  return (params?.code || "").toString().trim().toUpperCase();
}

export async function GET(_req, { params }) {
  try {
    await connectToDatabase();
    const code = codeFromParams(params);
    const coupon = await Coupon.findOne({ code }).lean();
    if (!coupon)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    return NextResponse.json({ success: true, coupon });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed to load coupon", details: e.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const code = codeFromParams(params);
    const body = await request.json();

    const update = {
      description: body.description,
      discountType: body.discountType,
      discountValue: Number(body.discountValue),
      minOrderAmount: Number(body.minOrderAmount),
      maxDiscountAmount: Number(body.maxDiscountAmount || 0),
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : null,
      usageLimit: Number(body.usageLimit),
      isActive: Boolean(body.isActive),
    };

    Object.keys(update).forEach(
      (k) => update[k] === undefined && delete update[k]
    );

    const coupon = await Coupon.findOneAndUpdate({ code }, update, {
      new: true,
      runValidators: true,
    });

    if (!coupon)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, coupon });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed to update coupon", details: e.message },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    await connectToDatabase();
    const code = codeFromParams(params);
    const deleted = await Coupon.findOneAndDelete({ code });
    if (!deleted)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed to delete coupon", details: e.message },
      { status: 500 }
    );
  }
}
