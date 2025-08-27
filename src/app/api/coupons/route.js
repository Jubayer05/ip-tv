import { connectToDatabase } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const search = searchParams.get("search")?.trim() || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const query = {};
    if (active === "true") {
      query.isActive = true;
    }
    if (search) {
      query.code = { $regex: search, $options: "i" };
    }

    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.max(1, Math.min(limit, 200)))
      .lean();

    return NextResponse.json({ success: true, coupons });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons", details: e.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const payload = {
      code: (body.code || "").toString().trim().toUpperCase(),
      description: body.description || "",
      discountType: body.discountType || "percentage",
      discountValue: Number(body.discountValue || 0),
      minOrderAmount: Number(body.minOrderAmount || 0),
      maxDiscountAmount: Number(body.maxDiscountAmount || 0),
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : null,
      usageLimit: Number(body.usageLimit || 0),
      isActive: Boolean(body.isActive ?? true),
    };

    if (!payload.code) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }
    if (Number.isNaN(payload.discountValue) || payload.discountValue <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid discount value" },
        { status: 400 }
      );
    }

    const exists = await Coupon.findOne({ code: payload.code });
    if (exists) {
      return NextResponse.json(
        { success: false, error: "Coupon code already exists" },
        { status: 409 }
      );
    }

    const created = await Coupon.create(payload);
    return NextResponse.json({ success: true, coupon: created });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed to create coupon", details: e.message },
      { status: 500 }
    );
  }
}
