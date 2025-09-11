import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsService";
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
      $or: [
        { "nowpaymentsPayment.paymentId": id },
        { "nowpaymentsPayment.orderId": id },
        { orderNumber: id },
      ],
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Try to get payment status from NOWPayments API
    let payment;
    let statusInfo = { isCompleted: false, isPending: true, isFailed: false };

    try {
      const result = await nowpaymentsService.getPayment(id);
      payment = result.data;

      // Update order with latest status from NOWPayments
      await applyPaymentUpdate({
        order,
        gatewayKey: "nowpaymentsPayment",
        rawStatus: payment.payment_status,
        gatewayFields: {
          status: payment.payment_status,
          payAmount: payment.pay_amount || 0,
          payCurrency: payment.pay_currency || "",
        },
      });

      statusInfo = nowpaymentsService.getStatusDescription(
        payment.payment_status
      );
    } catch (apiError) {
      console.warn(
        "NOWPayments API error, using stored order status:",
        apiError.message
      );

      // If NOWPayments API fails, use the stored status from our database
      const storedStatus = order.nowpaymentsPayment?.status || "waiting";
      statusInfo = nowpaymentsService.getStatusDescription(storedStatus);
    }

    return NextResponse.json({
      success: true,
      paymentId: id,
      status: order.nowpaymentsPayment?.status || "waiting",
      isCompleted: statusInfo.isCompleted,
      isPending: statusInfo.isPending,
      isFailed: statusInfo.isFailed,
      amount: order.nowpaymentsPayment?.priceAmount || order.totalAmount,
      currency: order.nowpaymentsPayment?.priceCurrency || "USD",
      orderUpdated: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("NOWPayments status error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get NOWPayments payment status" },
      { status: 500 }
    );
  }
}
