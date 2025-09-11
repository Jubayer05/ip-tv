import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import Order from "@/models/Order";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();
    const webhookData = await request.json();

    const { payment_id, status, amount, currency } = webhookData;

    if (!payment_id) {
      return NextResponse.json(
        { error: "Missing payment_id" },
        { status: 400 }
      );
    }

    // Find order by HoodPay payment ID
    const order = await Order.findOne({
      "hoodpayPayment.paymentId": payment_id,
    });

    if (!order) {
      console.warn("Order not found for HoodPay payment:", payment_id);
      return NextResponse.json({ received: true });
    }

    const purpose = order.hoodpayPayment?.metadata?.purpose || "order";
    const userIdMeta =
      order.hoodpayPayment?.metadata?.userId || order.userId?.toString() || "";

    await applyPaymentUpdate({
      order,
      gatewayKey: "hoodpayPayment",
      rawStatus: status,
      gatewayFields: {
        status: status,
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

    // Find deposit by HoodPay payment ID
    const deposit = await WalletDeposit.findOne({
      "hoodpayPayment.paymentId": payment_id,
    });

    if (deposit) {
      deposit.status = status === "paid" ? "completed" : "failed";
      deposit.hoodpayPayment.status = status;
      deposit.hoodpayPayment.callbackReceived = true;
      await deposit.save();

      if (status === "paid") {
        // Credit user balance
        const user = await User.findById(deposit.userId);
        if (user) {
          user.balance = Number(user.balance || 0) + Number(deposit.amount);
          await user.save();
        }
      }
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("HoodPay webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "HoodPay webhook endpoint" });
}
