import { connectToDatabase } from "@/lib/db";
import cryptomusService from "@/lib/paymentServices/cryptomusService";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { order_id, status, payment_status, uuid } = body;

    if (!order_id || !uuid) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findOne({
      "cryptomusPayment.paymentId": uuid,
    });

    if (!order) {
      console.error("Order not found for Cryptomus webhook:", {
        order_id,
        uuid,
      });
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Map Cryptomus status to our payment status
    const paymentStatus = cryptomusService.mapStatusToPaymentStatus(status);
    const orderStatus = paymentStatus === "completed" ? "completed" : "pending";

    // Update order with webhook data
    order.paymentStatus = paymentStatus;
    order.orderStatus = orderStatus;
    order.cryptomusPayment.status = status;
    order.cryptomusPayment.paymentStatus = payment_status;
    order.cryptomusPayment.updatedAt = new Date().toISOString();

    await order.save();

    // Apply payment update logic (affiliate commissions, etc.)
    if (paymentStatus === "completed") {
      await applyPaymentUpdate({
        orderId: order._id,
        userId: order.userId,
        amount: order.amount,
        currency: order.currency,
        paymentMethod: "cryptomus",
        paymentId: uuid,
        metadata: order.metadata,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cryptomus webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
