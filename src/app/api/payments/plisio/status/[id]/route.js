import { connectToDatabase } from "@/lib/db";
import plisioService from "@/lib/paymentServices/plisioService";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const result = await plisioService.getInvoiceDetails(id);
    const invoice = result.data;
    const statusInfo = plisioService.getStatusDescription(
      invoice.status,
      invoice.status_code
    );
    const attention = plisioService.needsAttention(invoice);

    // Find and update the order with latest Plisio status
    const order = await Order.findOne({ "plisioPayment.invoiceId": id });

    if (order) {
      console.log(
        `Updating order ${order._id} with Plisio status: ${invoice.status}`
      );

      // Update Plisio payment details
      order.plisioPayment.status = invoice.status;
      order.plisioPayment.confirmations = invoice.confirmations || 0;
      order.plisioPayment.actualSum = invoice.actual_sum || "0.00000000";
      order.plisioPayment.lastStatusUpdate = new Date();

      // Update order payment status based on Plisio status
      let newPaymentStatus = order.paymentStatus;
      let newOrderStatus = order.status;

      switch (invoice.status) {
        case "completed":
          newPaymentStatus = "completed";
          newOrderStatus = "completed";
          console.log(`✅ Payment completed for order ${order.orderNumber}`);
          break;

        case "pending":
          newPaymentStatus = "pending";
          newOrderStatus = "pending";
          console.log(`⏳ Payment pending for order ${order.orderNumber}`);
          break;

        case "new":
          newPaymentStatus = "pending";
          newOrderStatus = "pending";
          console.log(`🆕 New payment for order ${order.orderNumber}`);
          break;

        case "error":
        case "cancelled":
          newPaymentStatus = "failed";
          newOrderStatus = "cancelled";
          console.log(
            `❌ Payment ${invoice.status} for order ${order.orderNumber}`
          );
          break;

        case "expired":
          newPaymentStatus = "failed";
          newOrderStatus = "cancelled";
          console.log(`⏰ Payment expired for order ${order.orderNumber}`);
          break;

        default:
          console.log(
            `❓ Unknown payment status: ${invoice.status} for order ${order.orderNumber}`
          );
      }

      // Update order statuses
      order.paymentStatus = newPaymentStatus;
      order.status = newOrderStatus;

      await order.save();
      console.log(
        `Order ${order._id} updated: paymentStatus=${newPaymentStatus}, status=${newOrderStatus}`
      );
    } else {
      console.warn(`No order found for Plisio invoice ID: ${id}`);
    }

    // Return status response for polling
    return NextResponse.json({
      success: true,
      txnId: id,
      status: invoice.status,
      statusCode: invoice.status_code,
      statusDescription: statusInfo.status,
      isCompleted: statusInfo.isCompleted,
      isPending: statusInfo.isPending,
      isWaiting: statusInfo.isWaiting,
      isFailed: statusInfo.isFailed,
      isExpired: attention.isExpired,
      confirmations: invoice.confirmations || 0,
      actualSum: invoice.actual_sum || "0.00000000",
      timeRemaining: Math.max(0, invoice.expire_at_utc - Date.now() / 1000),
      lastUpdated: new Date().toISOString(),
      orderUpdated: !!order, // Indicate if order was found and updated
      orderId: order?._id,
      orderNumber: order?.orderNumber,
    });
  } catch (error) {
    console.error("Plisio status check error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to check payment status" },
      { status: 500 }
    );
  }
}
