import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import changenowService from "@/lib/paymentServices/changenowService";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    // Get ChangeNOW payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "changenow",
      isActive: true,
    });

    if (!paymentSettings) {
      console.error("ChangeNOW payment method is not configured or active");
      return NextResponse.json(
        { error: "Payment method not configured" },
        { status: 400 }
      );
    }

    // Update the service with database credentials
    changenowService.apiKey = paymentSettings.apiKey;
    if (paymentSettings.apiSecret) {
      changenowService.apiSecret = paymentSettings.apiSecret;
    }

    const signature = request.headers.get("x-changenow-signature");
    const webhookData = await request.json();

    // Verify webhook signature
    if (!changenowService.verifyWebhookSignature(webhookData, signature)) {
      console.error("ChangeNOW webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { id, status, payinAddress, payoutAddress } = webhookData;

    if (!id) {
      return NextResponse.json(
        { error: "Missing transaction id" },
        { status: 400 }
      );
    }

    // Find order by ChangeNOW transaction ID
    const order = await Order.findOne({ "changenowPayment.transactionId": id });

    if (!order) {
      console.warn("Order not found for ChangeNOW transaction:", id);
      return NextResponse.json({ received: true });
    }

    const purpose = order.changenowPayment?.metadata?.purpose || "order";
    const userIdMeta =
      order.changenowPayment?.metadata?.user_id ||
      order.userId?.toString() ||
      "";

    await applyPaymentUpdate({
      order,
      gatewayKey: "changenowPayment",
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

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("ChangeNOW webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "ChangeNOW webhook endpoint" });
}
