import { connectToDatabase } from "@/lib/db";
import plisioService from "@/lib/paymentServices/plisioService";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params; // Add await for Next.js 15

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const result = await plisioService.getInvoiceDetails(id);
    const invoice = result.data;

    // Find and update the order with latest Plisio status
    const order = await Order.findOne({ "plisioPayment.invoiceId": id });

    if (order) {
      console.log(
        `Syncing order ${order._id} with Plisio invoice: ${invoice.status}`
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
          newOrderStatus = "new";
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
        `Order ${order._id} synced: paymentStatus=${newPaymentStatus}, status=${newOrderStatus}`
      );
    } else {
      console.warn(`No order found for Plisio invoice ID: ${id}`);
    }

    return NextResponse.json({
      success: true,
      invoice: invoice,
      orderSynced: !!order, // Indicate if order was found and synced
      orderId: order?._id,
      orderNumber: order?.orderNumber,
      orderStatus: order?.status,
      paymentStatus: order?.paymentStatus,
    });
  } catch (error) {
    console.error("Plisio get invoice error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get invoice details" },
      { status: 500 }
    );
  }
}
