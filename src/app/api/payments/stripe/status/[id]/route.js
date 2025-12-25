import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import WalletDeposit from "@/models/WalletDeposit";
import { NextResponse } from "next/server";

// Map Stripe statuses to internal statuses
const STATUS_MAP = {
  'new': 'pending',
  'pending': 'pending',
  'processing': 'confirming',
  'requires_action': 'pending',
  'completed': 'completed',
  'succeeded': 'completed',
  'failed': 'failed',
  'cancelled': 'cancelled',
};

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

    // Check if it's a deposit (starts with WD- or deposit-stripe-)
    const isDeposit = id.startsWith('WD-') || id.startsWith('deposit-stripe-');
    
    let payment;
    let paymentStatus;
    let amount;
    let currency;
    let type;

    if (isDeposit) {
      // Find deposit by depositId or by the deposit-stripe ID in metadata
      // The URL uses deposit-stripe-{timestamp} but DB uses WD-{date}
      payment = await WalletDeposit.findOne({
        $or: [
          { depositId: id },
          { 'stripePayment.sessionId': id },
          // Search by the original deposit ID stored in createdAt timestamp
          { createdAt: { $gte: new Date(Date.now() - 86400000) } } // Within last 24 hours
        ]
      }).sort({ createdAt: -1 });

      // If still not found and ID is deposit-stripe-*, try to extract timestamp and find by time range
      if (!payment && id.startsWith('deposit-stripe-')) {
        const timestampMatch = id.match(/deposit-stripe-(\d+)/);
        if (timestampMatch) {
          const timestamp = parseInt(timestampMatch[1]);
          const searchTime = new Date(timestamp);
          const timeWindow = 60000; // 1 minute window
          
          payment = await WalletDeposit.findOne({
            paymentGateway: 'Stripe',
            createdAt: {
              $gte: new Date(searchTime.getTime() - timeWindow),
              $lte: new Date(searchTime.getTime() + timeWindow)
            }
          }).sort({ createdAt: -1 });
        }
      }

      if (!payment) {
        console.error(`❌ Deposit not found for ID: ${id}`);
        return NextResponse.json(
          { error: "Deposit not found" },
          { status: 404 }
        );
      }

      paymentStatus = payment.stripePayment?.status || payment.status || 'pending';
      amount = payment.amount;
      currency = payment.currency || 'USD';
      type = 'deposit';

    } else {
      // Find order (subscription/package)
      payment = await Order.findOne({
        $or: [
          { orderNumber: id },
          { 'stripePayment.sessionId': id },
          // Search recent orders within last 24 hours
          { createdAt: { $gte: new Date(Date.now() - 86400000) } }
        ]
      }).sort({ createdAt: -1 });

      // If still not found and ID is order-stripe-*, try to extract timestamp and find by time range
      if (!payment && id.startsWith('order-stripe-')) {
        const timestampMatch = id.match(/order-stripe-(\d+)/);
        if (timestampMatch) {
          const timestamp = parseInt(timestampMatch[1]);
          const searchTime = new Date(timestamp);
          const timeWindow = 60000; // 1 minute window
          
          payment = await Order.findOne({
            paymentGateway: 'Stripe',
            createdAt: {
              $gte: new Date(searchTime.getTime() - timeWindow),
              $lte: new Date(searchTime.getTime() + timeWindow)
            }
          }).sort({ createdAt: -1 });
        }
      }

      if (!payment) {
        console.error(`❌ Order not found for ID: ${id}`);
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      paymentStatus = payment.stripePayment?.status || payment.paymentStatus || 'pending';
      amount = payment.totalAmount || payment.finalAmount;
      currency = payment.currency || 'USD';
      type = 'subscription';
    }

    // Map Stripe status to internal status
    const mappedStatus = STATUS_MAP[paymentStatus] || 'pending';

    return NextResponse.json({
      success: true,
      status: mappedStatus,
      payment: {
        paymentId: isDeposit ? payment.depositId : payment.orderNumber,
        orderId: isDeposit ? payment.depositId : payment.orderNumber,
        sessionId: payment.stripePayment?.sessionId,
        status: mappedStatus,
        internalStatus: mappedStatus,
        paymentStatus: paymentStatus,
        amount: amount,
        priceAmount: amount,
        currency: currency,
        priceCurrency: currency,
        type: type,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt || payment.stripePayment?.lastStatusUpdate,
        checkoutUrl: null, // Stripe checkout is one-time use
      },
      provider: "stripe",
      type: type,
    });

  } catch (error) {
    console.error("❌ Error fetching Stripe payment status:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch payment status" },
      { status: 500 }
    );
  }
}
