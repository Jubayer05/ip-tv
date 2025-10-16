import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { orderNumber } = params;

    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
