import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { orderId, credentials } = await request.json();

    if (!orderId || !credentials) {
      return NextResponse.json(
        { error: "Missing orderId or credentials" },
        { status: 400 }
      );
    }

    // Update the order with IPTV credentials
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          iptvCredentials: credentials,
          status: "completed",
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order credentials:", error);
    return NextResponse.json(
      { error: "Failed to update order credentials" },
      { status: 500 }
    );
  }
}
