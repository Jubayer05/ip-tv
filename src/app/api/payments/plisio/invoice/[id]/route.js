import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
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
      await applyPaymentUpdate({
        order,
        gatewayKey: "plisioPayment",
        rawStatus: invoice.status,
        gatewayFields: {
          confirmations: invoice.confirmations || 0,
          actualSum: invoice.actual_sum || "0.00000000",
        },
      });
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
