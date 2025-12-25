import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import WebhookLog from "@/models/WebhookLog";
import PaymentSettings from "@/models/PaymentSettings";
import hoodpayService from "@/lib/paymentServices/hoodpayService";
import { NextResponse } from "next/server";

// Map HoodPay statuses to internal order statuses
const STATUS_MAP = {
  'AWAITING_PAYMENT': 'pending',
  'PENDING': 'pending',
  'PROCESSING': 'processing',
  'COMPLETED': 'completed',
  'PAID': 'completed',
  'SUCCESS': 'completed',
  'FAILED': 'failed',
  'CANCELLED': 'cancelled',
  'EXPIRED': 'expired',
  'REFUNDED': 'refunded',
};

export async function POST(request) {
  let webhookLog = null;
  
  try {
    console.log("START: HoodPay webhook received");

    await connectToDatabase();

    const body = await request.json();
    const signature = request.headers.get("x-hoodpay-signature") || 
                      request.headers.get("x-webhook-signature");

    console.log("Webhook data:", {
      paymentId: body.paymentId || body.payment_id,
      status: body.status,
      hasSignature: !!signature,
    });

    // Load payment settings
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "hoodpay",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "HoodPay not configured" },
        { status: 400 }
      );
    }

    // Configure HoodPay service
    hoodpayService.setApiKey(paymentSettings.apiKey);
    
    const businessId = paymentSettings.businessId || paymentSettings.merchantId;
    if (businessId) {
      hoodpayService.setBusinessId(businessId);
    }
    
    if (paymentSettings.webhookSecret) {
      hoodpayService.setWebhookSecret(paymentSettings.webhookSecret);
    }

    // Verify webhook signature
    const isValid = hoodpayService.verifyWebhookSignature(body, signature);

    // Create webhook log
    webhookLog = await WebhookLog.create({
      gateway: "hoodpay",
      signature: signature || "none",
      body: body,
      headers: Object.fromEntries(request.headers.entries()),
      signatureValid: isValid,
      processed: false,
    });

    if (!isValid) {
      console.error("Invalid webhook signature");
      webhookLog.processingError = "Invalid signature";
      webhookLog.processed = false;
      await webhookLog.save();

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    console.log("Webhook signature verified");

    const paymentId = body.paymentId || body.payment_id;
    const hoodpayStatus = body.status; // e.g., 'COMPLETED', 'AWAITING_PAYMENT'
    const mappedStatus = STATUS_MAP[hoodpayStatus] || 'pending';

    console.log("Status mapping:", {
      hoodpayStatus,
      mappedStatus,
    });

    // Find order
    const order = await Order.findOne({
      $or: [
        { "hoodpayPayment.paymentId": paymentId },
        { orderNumber: body.orderId },
      ],
    });

    if (!order) {
      console.error("Order not found for payment:", paymentId);
      webhookLog.processingError = "Order not found";
      webhookLog.processed = false;
      await webhookLog.save();

      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    console.log("Order found:", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      currentStatus: order.paymentStatus,
    });

    // Update order with HoodPay payment info
    order.hoodpayPayment.status = mappedStatus;
    order.hoodpayPayment.lastStatusUpdate = new Date();
    order.hoodpayPayment.callbackReceived = true;

    webhookLog.orderId = order._id;
    webhookLog.orderNumber = order.orderNumber;

    // Handle based on status
    if (mappedStatus === 'completed') {
      console.log("Payment completed - processing order");

      order.paymentStatus = "completed";
      order.status = "completed";
      order.paidAt = new Date();

      // Check if this is a deposit
      const isDeposit = order.hoodpayPayment?.metadata?.purpose === "deposit";

      if (isDeposit) {
        console.log("Processing wallet deposit");

        const user = await User.findById(order.userId);
        if (user) {
          const depositAmount = order.totalAmount;

          user.wallet = user.wallet || { balance: 0, currency: "USD" };
          user.wallet.balance += depositAmount;

          await user.save();

          console.log("Wallet credited:", {
            userId: user._id,
            amount: depositAmount,
            newBalance: user.wallet.balance,
          });

          // Update deposit record if exists
          const deposit = await WalletDeposit.findOne({
            depositId: order.orderNumber,
          });

          if (deposit) {
            deposit.status = "completed";
            deposit.processedAt = new Date();
            await deposit.save();
            console.log("Deposit record updated");
          }

          webhookLog.processed = true;
          webhookLog.userCredited = true;
          webhookLog.creditAmount = depositAmount;
        }
      } else {
        console.log("Processing subscription order");

        // TODO: Activate subscription
        // TODO: Create IPTV credentials
        // TODO: Send confirmation email

        webhookLog.processed = true;
      }

      await order.save();

      console.log("Order updated successfully");
    } else if (mappedStatus === 'failed' || mappedStatus === 'cancelled') {
      console.log("Payment failed/cancelled");

      order.paymentStatus = mappedStatus;
      order.status = "cancelled";

      await order.save();

      webhookLog.processed = true;
      webhookLog.processingError = `Payment ${mappedStatus}`;
    } else {
      console.log("Payment status:", mappedStatus);
      
      // Update status but don't mark as completed
      order.paymentStatus = mappedStatus;
      await order.save();

      webhookLog.processed = true;
    }

    await webhookLog.save();

    console.log("SUCCESS: HoodPay webhook processed");

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
      status: mappedStatus,
    });
  } catch (error) {
    console.error("HoodPay webhook error:", error);

    if (webhookLog) {
      webhookLog.processingError = error.message;
      webhookLog.processed = false;
      await webhookLog.save().catch(console.error);
    }

    return NextResponse.json(
      { error: error?.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "HoodPay webhook endpoint" });
}
