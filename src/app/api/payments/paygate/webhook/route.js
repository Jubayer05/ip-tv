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

    // Extract all callback parameters according to PayGate API documentation
    const callbackData = {
      // Original parameters from your callback URL (these will vary)
      orderNumber: searchParams.get("orderNumber") || searchParams.get("number"),
      userId: searchParams.get("userId"),
      purpose: searchParams.get("purpose"),

      // PayGate payment data (from API documentation)
      value_coin: searchParams.get("value_coin"), // Amount of USDC paid
      coin: searchParams.get("coin"), // Usually "polygon_usdc" or "polygon_usdt"
      txid_in: searchParams.get("txid_in"), // Polygon TXID from provider to order wallet
      txid_out: searchParams.get("txid_out"), // Instant payout TXID to merchant wallet
      address_in: searchParams.get("address_in"), // Should match polygon_address_in from step 1
    };

    console.log("PayGate callback received:", callbackData);

    // Validate required PayGate parameters
    if (!callbackData.value_coin || !callbackData.address_in) {
      console.warn("Missing required PayGate callback parameters:", callbackData);
      return NextResponse.json({ received: true, warning: "Missing required parameters" });
    }

    // Find order by order number or PayGate address
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
      return NextResponse.json({ received: true, warning: "Order not found" });
    }

    // Verify the address matches (security check)
    const storedAddress = order.paygatePayment?.walletData?.polygon_address_in;
    if (storedAddress && storedAddress !== callbackData.address_in) {
      console.error("Address mismatch in PayGate callback:", {
        stored: storedAddress,
        received: callbackData.address_in,
        orderNumber: order.orderNumber,
      });
      return NextResponse.json({ received: true, error: "Address mismatch" });
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
        lastStatusUpdate: new Date(),
      },
      onCompleted: async ({ order }) => {
        if (purpose === "deposit") {
          // Credit user balance with order.totalAmount
          const userId = userIdMeta || order.userId?.toString();
          if (userId) {
            const user = await User.findById(userId);
            if (user) {
              const creditAmount = Number(callbackData.value_coin || order.totalAmount || 0);
              user.balance = Number(user.balance || 0) + creditAmount;
              await user.save();
              
              console.log(`Credited ${creditAmount} to user ${userId} balance`);
            }
          }
        }
      },
    });

    // Find and update deposit record if it exists
    if (purpose === "deposit") {
      const deposit = await WalletDeposit.findOne({
        $or: [
          { "paygatePayment.paymentId": order.paygatePayment?.paymentId },
          { userId: userIdMeta || order.userId },
          { "paygatePayment.walletData.polygon_address_in": callbackData.address_in }
        ]
      });

      if (deposit) {
        deposit.status = "completed";
        deposit.paygatePayment.status = "paid";
        deposit.paygatePayment.callbackReceived = true;
        deposit.paygatePayment.paymentData = callbackData;
        deposit.paygatePayment.lastStatusUpdate = new Date();
        await deposit.save();

        // Credit user balance (if not already credited above)
        const user = await User.findById(deposit.userId);
        if (user) {
          const creditAmount = Number(callbackData.value_coin || deposit.amount);
          user.balance = Number(user.balance || 0) + creditAmount;
          await user.save();
          
          console.log(`Credited ${creditAmount} to user ${deposit.userId} balance from deposit`);
        }
      }
    }

    return NextResponse.json({ 
      received: true, 
      success: true,
      orderNumber: order.orderNumber,
      status: "paid"
    });
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
