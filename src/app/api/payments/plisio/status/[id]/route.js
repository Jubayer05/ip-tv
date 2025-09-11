import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
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
      await applyPaymentUpdate({
        order,
        gatewayKey: "plisioPayment",
        rawStatus: invoice.status,
        gatewayFields: {
          confirmations: invoice.confirmations || 0,
          actualSum: invoice.actual_sum || "0.00000000",
        },
      });
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
