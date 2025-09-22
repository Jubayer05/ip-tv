import { connectToDatabase } from "@/lib/db";
import { handlePaymentCompleted } from "@/lib/payments/paymentUpdater";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { orderNumber } = body;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order is completed
    if (order.paymentStatus !== "completed") {
      return NextResponse.json(
        { error: "Order payment not completed" },
        { status: 400 }
      );
    }

    // Handle IPTV account creation
    const result = await handlePaymentCompleted(orderNumber);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        credentialsCount: result.credentialsCount,
        emailSent: result.emailSent,
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Create IPTV accounts error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
