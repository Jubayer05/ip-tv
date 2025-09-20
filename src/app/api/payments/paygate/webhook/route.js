import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import Order from "@/models/Order";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDatabase();

    // PayGate sends callback as GET request with query parameters
    const { searchParams } = new URL(request.url);

    // Extract all callback parameters
    const callbackData = {
      // Original parameters (these will vary based on what you passed in the callback URL)
      orderNumber:
        searchParams.get("orderNumber") || searchParams.get("number"),
      userId: searchParams.get("userId"),
      purpose: searchParams.get("purpose"),

      // PayGate payment data
      value_coin: searchParams.get("value_coin"),
      coin: searchParams.get("coin"),
      txid_in: searchParams.get("txid_in"),
      txid_out: searchParams.get("txid_out"),
      address_in: searchParams.get("address_in"),
    };

    console.log("PayGate callback received:", callbackData);

    // Find order by order number or other identifying parameters
    let order = null;

    if (callbackData.orderNumber) {
      order = await Order.findOne({ orderNumber: callbackData.orderNumber });
    }

    // If not found by order number, try to find by PayGate address
    if (!order && callbackData.address_in) {
      order = await Order.findOne({
        "paygatePayment.walletData.polygon_address_in": callbackData.address_in,
      });
    }

    if (!order) {
      console.warn("Order not found for PayGate callback:", callbackData);
      return NextResponse.json({ received: true });
    }

    const purpose = order.paygatePayment?.metadata?.purpose || "order";
    const userIdMeta =
      order.paygatePayment?.metadata?.user_id || order.userId?.toString() || "";

    // Update order with payment completion
    await applyPaymentUpdate({
      order,
      gatewayKey: "paygatePayment",
      rawStatus: "paid",
      gatewayFields: {
        status: "paid",
        callbackReceived: true,
        paymentData: callbackData,
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

    // Find and update deposit record if it exists
    const deposit = await WalletDeposit.findOne({
      "paygatePayment.paymentId": order.paygatePayment?.paymentId,
    });

    if (deposit) {
      deposit.status = "completed";
      deposit.paygatePayment.status = "paid";
      deposit.paygatePayment.callbackReceived = true;
      deposit.paygatePayment.paymentData = callbackData;
      await deposit.save();

      // Credit user balance
      const user = await User.findById(deposit.userId);
      if (user) {
        user.balance = Number(user.balance || 0) + Number(deposit.amount);
        await user.save();
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayGate webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    message: "PayGate webhook endpoint - use GET for callbacks",
  });
}
