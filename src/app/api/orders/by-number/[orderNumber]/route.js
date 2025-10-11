import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { orderNumber } = params;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const order = await Order.findOne({ orderNumber })
      .populate("userId", "email profile.firstName profile.lastName")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Fetch order by number error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
