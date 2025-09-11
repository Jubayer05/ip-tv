import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import plisioService from "@/lib/paymentServices/plisioService";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const callbackData = await request.json();

    // Verify the callback signature
    const isValid = plisioService.verifyCallbackSignature(callbackData);

    if (!isValid) {
      console.error("Invalid callback signature");
      return NextResponse.json(
        { error: "Invalid callback signature" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Process the callback based on status
    const {
      status,
      txn_id,
      order_number,
      amount,
      currency,
      actual_sum,
      confirmations,
    } = callbackData;

    // Find the order by invoice ID or order number
    let order = await Order.findOne({
      $or: [
        { "plisioPayment.invoiceId": txn_id },
        { orderNumber: order_number },
      ],
    });

    if (!order) {
      console.error("Order not found for callback:", { txn_id, order_number });
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update Plisio payment status
    if (!order.plisioPayment) {
      order.plisioPayment = {};
    }

    order.plisioPayment.status = status;
    order.plisioPayment.confirmations = confirmations || 0;
    order.plisioPayment.actualSum = actual_sum || "0.00000000";
    order.plisioPayment.callbackReceived = true;
    order.plisioPayment.lastStatusUpdate = new Date();

    await applyPaymentUpdate({
      order,
      gatewayKey: "plisioPayment",
      rawStatus: status, // from callback
      gatewayFields: {
        confirmations: confirmations || 0,
        actualSum: actual_sum || "0.00000000",
        callbackReceived: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Callback processed and database updated",
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    console.error("Plisio callback error:", error);
    return NextResponse.json(
      { error: "Failed to process callback" },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(request) {
  return NextResponse.json({ message: "Plisio webhook endpoint" });
}
