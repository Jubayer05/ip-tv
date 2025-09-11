import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import Order from "@/models/Order";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();
    const webhookData = await request.json();

    const { payment_id, order_id, payment_status, pay_amount, pay_currency } =
      webhookData;

    if (!payment_id && !order_id) {
      return NextResponse.json(
        { error: "Missing payment_id or order_id" },
        { status: 400 }
      );
    }

    // Find order by NOWPayments payment ID or order ID
    const order = await Order.findOne({
      $or: [
        { "nowpaymentsPayment.paymentId": payment_id },
        { "nowpaymentsPayment.orderId": order_id },
        { orderNumber: order_id },
      ],
    });

    if (!order) {
      console.warn("Order not found for NOWPayments payment:", {
        payment_id,
        order_id,
      });
      return NextResponse.json({ received: true });
    }

    const purpose = order.nowpaymentsPayment?.metadata?.purpose || "order";
    const userIdMeta =
      order.nowpaymentsPayment?.metadata?.user_id ||
      order.userId?.toString() ||
      "";

    await applyPaymentUpdate({
      order,
      gatewayKey: "nowpaymentsPayment",
      rawStatus: payment_status,
      gatewayFields: {
        status: payment_status,
        payAmount: pay_amount || 0,
        payCurrency: pay_currency || "",
        callbackReceived: true,
      },
      onCompleted: async ({ order }) => {
        if (purpose === "deposit") {
          // Credit user balance with order.totalAmount
          const userId = userIdMeta || order.userId?.toString();
          if (userId) {
            const user = await User.findById(userId);
            if (user) {
              user.balance =
                Number(user.balance || 0) + Number(order.totalAmount || 0);
              await user.save();
            }
          }
        }
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("NOWPayments webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "NOWPayments webhook endpoint" });
}
