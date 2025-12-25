import { connectToDatabase } from "@/lib/db";
import voletService from "@/lib/paymentServices/voletService";
import Order from "@/models/Order";
import WalletDeposit from "@/models/WalletDeposit";
import { NextResponse } from "next/server";

// Map Volet statuses to internal statuses
const STATUS_MAP = {
  'new': 'pending',
  'pending': 'pending',
  'processing': 'confirming',
  'completed': 'completed',
  'success': 'completed',
  'paid': 'completed',
  'failed': 'failed',
  'cancelled': 'cancelled',
  'expired': 'expired',
};

/**
 * GET /api/payments/volet/status/[id]
 * Check payment status from local database
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Try to find as deposit first
    let deposit = null;
    let order = null;
    let paymentData = null;
    let type = null;

    // Check if it's a deposit (IDs starting with "deposit-volet-" or "WD-")
    if (id.startsWith("deposit-volet-") || id.startsWith("WD-")) {
      deposit = await WalletDeposit.findOne({
        $or: [
          { "voletPayment.paymentId": id },
          { "voletPayment.orderId": id },
          { depositId: id },
        ],
      });

      if (deposit && deposit.voletPayment) {
        paymentData = {
          paymentId: deposit.voletPayment.paymentId,
          orderId: deposit.voletPayment.orderId,
          status: deposit.voletPayment.status || deposit.status,
          amount: deposit.voletPayment.priceAmount || deposit.finalAmount,
          currency: deposit.voletPayment.priceCurrency || deposit.currency,
          transactionId: deposit.voletPayment.transactionId,
          callbackReceived: deposit.voletPayment.callbackReceived,
          lastStatusUpdate: deposit.voletPayment.lastStatusUpdate,
          completedAt: deposit.voletPayment.completedAt,
          userCredited: deposit.voletPayment.metadata?.userCredited || false,
          creditedAmount: deposit.voletPayment.metadata?.creditedAmount || 0,
        };
        type = "deposit";
      }
    }

    // If not found as deposit, try as order
    if (!deposit) {
      order = await Order.findOne({
        $or: [
          { "voletPayment.paymentId": id },
          { orderNumber: id },
        ],
      });

      if (order && order.voletPayment) {
        paymentData = {
          paymentId: order.voletPayment.paymentId,
          orderId: order.orderNumber,
          status: order.voletPayment.status || order.paymentStatus,
          amount: order.voletPayment.priceAmount || order.totalAmount,
          currency: order.voletPayment.priceCurrency || "USD",
          transactionId: order.voletPayment.transactionId,
          callbackReceived: order.voletPayment.callbackReceived,
          lastStatusUpdate: order.voletPayment.lastStatusUpdate,
          orderStatus: order.status,
          paymentStatus: order.paymentStatus,
        };
        type = "order";
      }
    }

    // If still not found
    if (!paymentData) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Get status description
    const statusInfo = voletService.getStatusDescription(paymentData.status);
    
    // Map to internal status format (matching Stripe endpoint)
    const mappedStatus = STATUS_MAP[paymentData.status] || 'pending';

    return NextResponse.json({
      success: true,
      status: mappedStatus,
      payment: {
        paymentId: id,
        orderId: type === "deposit" ? deposit?.depositId : order?.orderNumber,
        transactionId: paymentData.transactionId || null,
        status: mappedStatus,
        internalStatus: mappedStatus,
        paymentStatus: paymentData.status,
        amount: paymentData.amount,
        priceAmount: paymentData.amount,
        currency: paymentData.currency,
        priceCurrency: paymentData.currency,
        type: type,
        checkoutUrl: null,
        createdAt: type === "deposit" ? deposit?.createdAt : order?.createdAt,
        updatedAt: paymentData.lastStatusUpdate || new Date().toISOString(),
        completedAt: paymentData.completedAt || null,
        callbackReceived: paymentData.callbackReceived || false,
        // Additional info based on type
        ...(type === "deposit" && {
          userCredited: paymentData.userCredited,
          creditedAmount: paymentData.creditedAmount,
        }),
        ...(type === "order" && {
          orderStatus: paymentData.orderStatus,
        }),
      },
      provider: "volet",
      type: type,
      // Legacy fields for backward compatibility
      statusDescription: statusInfo.status,
      isCompleted: statusInfo.isCompleted,
      isPending: statusInfo.isPending,
      isFailed: statusInfo.isFailed,
    });
  } catch (error) {
    console.error("[Volet Status] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to check payment status" },
      { status: 500 }
    );
  }
}
