import { connectToDatabase } from "@/lib/db";
import changenowService from "@/lib/paymentServices/changenowService";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // Await params before destructuring
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get ChangeNOW payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "changenow",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "ChangeNOW payment method is not configured or active" },
        { status: 400 }
      );
    }

    // Update the service with database credentials
    changenowService.apiKey = paymentSettings.apiKey;
    if (paymentSettings.apiSecret) {
      changenowService.apiSecret = paymentSettings.apiSecret;
    }

    // Find the order by ChangeNOW transaction ID
    const order = await Order.findOne({
      "changenowPayment.transactionId": id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let statusInfo = {
      status: "pending",
      description: "Transaction is being processed",
    };

    try {
      // Get transaction status from ChangeNOW API
      const result = await changenowService.getTransactionStatus(id);

      if (result.success) {
        // Map ChangeNOW status to our payment status
        const paymentStatus = changenowService.mapStatusToPaymentStatus(
          result.status
        );

        statusInfo = {
          status: paymentStatus,
          description: result.status,
          transactionId: result.transactionId,
          fromAmount: result.fromAmount,
          toAmount: result.toAmount,
          payinAddress: result.payinAddress,
          payoutAddress: result.payoutAddress,
          payinHash: result.payinHash,
          payoutHash: result.payoutHash,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        };

        // Update order status if payment is completed
        if (
          paymentStatus === "completed" &&
          order.paymentStatus !== "completed"
        ) {
          order.paymentStatus = "completed";
          order.orderStatus = "completed";
          order.changenowPayment.status = result.status;
          order.changenowPayment.payinHash = result.payinHash;
          order.changenowPayment.payoutHash = result.payoutHash;
          order.changenowPayment.updatedAt = result.updatedAt;
          await order.save();
        }
      }
    } catch (error) {
      console.error("ChangeNOW API error, using stored order status:", error);
      // If ChangeNOW API fails, use the stored status from our database
      const storedStatus = order.changenowPayment?.status || "new";
      statusInfo = {
        status: changenowService.mapStatusToPaymentStatus(storedStatus),
        description: storedStatus,
      };
    }

    return NextResponse.json({
      success: true,
      ...statusInfo,
      orderId: order._id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("ChangeNOW status error:", error);
    return NextResponse.json(
      { error: "Failed to get transaction status" },
      { status: 500 }
    );
  }
}
