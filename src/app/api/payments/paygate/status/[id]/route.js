import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import paygateService from "@/lib/paymentServices/paygateService";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // First, try to get the order from our database
    const order = await Order.findOne({
      $or: [{ "paygatePayment.paymentId": id }, { orderNumber: id }],
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Try to get payment status from PayGate API if we have IPN token
    let payment;
    let statusInfo = { isCompleted: false, isPending: true, isFailed: false };

    try {
      const ipnToken = order.paygatePayment?.walletData?.ipn_token;
      if (ipnToken) {
        const result = await paygateService.checkPaymentStatus(ipnToken);
        payment = result.data;

        // Update order with latest status from PayGate
        await applyPaymentUpdate({
          order,
          gatewayKey: "paygatePayment",
          rawStatus: payment.status || "unpaid",
          gatewayFields: {
            status: payment.status === "paid" ? "paid" : "pending",
          },
        });

        statusInfo = paygateService.getStatusDescription(payment.status);
      } else {
        // If no IPN token, use stored status
        const storedStatus = order.paygatePayment?.status || "pending";
        statusInfo = paygateService.getStatusDescription(storedStatus);
      }
    } catch (apiError) {
      console.warn(
        "PayGate API error, using stored order status:",
        apiError.message
      );

      // If PayGate API fails, use the stored status from our database
      const storedStatus = order.paygatePayment?.status || "pending";
      statusInfo = paygateService.getStatusDescription(storedStatus);
    }

    return NextResponse.json({
      success: true,
      paymentId: id,
      status: order.paygatePayment?.status || "pending",
      isCompleted: statusInfo.isCompleted,
      isPending: statusInfo.isPending,
      isFailed: statusInfo.isFailed,
      amount: order.paygatePayment?.amount || order.totalAmount,
      currency: order.paygatePayment?.currency || "USD",
      orderUpdated: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("PayGate status error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get PayGate payment status" },
      { status: 500 }
    );
  }
}
