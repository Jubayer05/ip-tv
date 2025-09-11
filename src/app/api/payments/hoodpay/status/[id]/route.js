import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import hoodpayService from "@/lib/paymentServices/hoodpayService";
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
      $or: [{ "hoodpayPayment.paymentId": id }, { orderNumber: id }],
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Try to get payment status from HoodPay API
    let payment;
    let statusInfo = { isCompleted: false, isPending: true, isFailed: false };

    try {
      const result = await hoodpayService.getPayment(id);
      payment = result.data;

      // Update order with latest status from HoodPay
      await applyPaymentUpdate({
        order,
        gatewayKey: "hoodpayPayment",
        rawStatus: payment.status || "pending",
        gatewayFields: {
          status: payment.status || "pending",
        },
      });

      statusInfo = hoodpayService.getStatusDescription(payment.status);
    } catch (apiError) {
      console.warn(
        "HoodPay API error, using stored order status:",
        apiError.message
      );

      // If HoodPay API fails, use the stored status from our database
      const storedStatus = order.hoodpayPayment?.status || "pending";
      statusInfo = hoodpayService.getStatusDescription(storedStatus);
    }

    return NextResponse.json({
      success: true,
      paymentId: id,
      status: order.hoodpayPayment?.status || "pending",
      isCompleted: statusInfo.isCompleted,
      isPending: statusInfo.isPending,
      isFailed: statusInfo.isFailed,
      amount: order.hoodpayPayment?.amount || order.totalAmount,
      currency: order.hoodpayPayment?.currency || "USD",
      orderUpdated: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("HoodPay status error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get HoodPay payment status" },
      { status: 500 }
    );
  }
}
