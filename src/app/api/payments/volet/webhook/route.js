import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import voletService from "@/lib/paymentServices/voletService";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const callbackData = await request.json();
    const signature =
      request.headers.get("x-volet-signature") ||
      request.headers.get("signature");

    // Verify the webhook signature
    const isValid = voletService.verifyWebhookSignature(
      callbackData,
      signature
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Process the webhook based on status
    const {
      status,
      payment_id,
      order_number,
      amount,
      currency,
      actual_sum,
      confirmations,
    } = callbackData;

    // Find the order by payment ID or order number
    let order = await Order.findOne({
      $or: [
        { "voletPayment.paymentId": payment_id },
        { orderNumber: order_number },
      ],
    });

    if (!order) {
      console.error("Order not found for webhook:", {
        payment_id,
        order_number,
      });
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update Volet payment status
    if (!order.voletPayment) {
      order.voletPayment = {};
    }

    order.voletPayment.status = status;
    order.voletPayment.confirmations = confirmations || 0;
    order.voletPayment.actualSum = actual_sum || "0.00000000";
    order.voletPayment.callbackReceived = true;
    order.voletPayment.lastStatusUpdate = new Date();

    await applyPaymentUpdate({
      order,
      gatewayKey: "voletPayment",
      rawStatus: status, // from webhook
      gatewayFields: {
        confirmations: confirmations || 0,
        actualSum: actual_sum || "0.00000000",
        callbackReceived: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Webhook processed and database updated",
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    console.error("Volet webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(request) {
  return NextResponse.json({ message: "Volet webhook endpoint" });
}
