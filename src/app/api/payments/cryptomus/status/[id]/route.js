import cryptomusService from "@/lib/paymentServices/cryptomusService";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // Await params before destructuring
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Find the order by Cryptomus payment ID
    const order = await Order.findOne({
      "cryptomusPayment.paymentId": id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let statusInfo = {
      status: "pending",
      description: "Payment is being processed",
    };

    try {
      // Get payment status from Cryptomus API
      const result = await cryptomusService.getPaymentStatus(id);

      if (result.success) {
        // Map Cryptomus status to our payment status
        const paymentStatus = cryptomusService.mapStatusToPaymentStatus(
          result.status
        );

        statusInfo = {
          status: paymentStatus,
          description: result.status,
          paymentId: result.paymentId,
          orderId: result.orderId,
          amount: result.amount,
          currency: result.currency,
          toCurrency: result.toCurrency,
          toAmount: result.toAmount,
          address: result.address,
          network: result.network,
          isFinal: result.isFinal,
          paymentMethod: result.paymentMethod,
          paymentStatus: result.paymentStatus,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          expiredAt: result.expiredAt,
          transactions: result.transactions,
        };

        // Update order status if payment is completed
        if (
          paymentStatus === "completed" &&
          order.paymentStatus !== "completed"
        ) {
          order.paymentStatus = "completed";
          order.orderStatus = "completed";
          order.cryptomusPayment.status = result.status;
          order.cryptomusPayment.isFinal = result.isFinal;
          order.cryptomusPayment.paymentStatus = result.paymentStatus;
          order.cryptomusPayment.updatedAt = result.updatedAt;
          order.cryptomusPayment.transactions = result.transactions;
          await order.save();
        }
      }
    } catch (error) {
      console.error("Cryptomus API error, using stored order status:", error);
      // If Cryptomus API fails, use the stored status from our database
      const storedStatus = order.cryptomusPayment?.status || "waiting";
      statusInfo = {
        status: cryptomusService.mapStatusToPaymentStatus(storedStatus),
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
    console.error("Cryptomus status error:", error);
    return NextResponse.json(
      { error: "Failed to get payment status" },
      { status: 500 }
    );
  }
}
