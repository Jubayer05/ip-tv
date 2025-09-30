import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import voletService from "@/lib/paymentServices/voletService";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const result = await voletService.getPaymentDetails(id);
    const payment = result.data;
    const statusInfo = voletService.getStatusDescription(
      payment.status,
      payment.status_code
    );
    const attention = voletService.needsAttention(payment);

    // Find and update the order with latest Volet status
    const order = await Order.findOne({ "voletPayment.paymentId": id });

    if (order) {
      await applyPaymentUpdate({
        order,
        gatewayKey: "voletPayment",
        rawStatus: payment.status,
        gatewayFields: {
          confirmations: payment.confirmations || 0,
          actualSum: payment.actual_sum || "0.00000000",
        },
      });
    }

    // Return status response for polling
    return NextResponse.json({
      success: true,
      paymentId: id,
      status: payment.status,
      statusCode: payment.status_code,
      statusDescription: statusInfo.status,
      isCompleted: statusInfo.isCompleted,
      isPending: statusInfo.isPending,
      isWaiting: statusInfo.isWaiting,
      isFailed: statusInfo.isFailed,
      isExpired: attention.isExpired,
      confirmations: payment.confirmations || 0,
      actualSum: payment.actual_sum || "0.00000000",
      timeRemaining: payment.expires_at
        ? Math.max(0, payment.expires_at - Date.now() / 1000)
        : 0,
      lastUpdated: new Date().toISOString(),
      orderUpdated: !!order, // Indicate if order was found and updated
      orderId: order?._id,
      orderNumber: order?.orderNumber,
    });
  } catch (error) {
    console.error("Volet status check error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to check payment status" },
      { status: 500 }
    );
  }
}
