import { connectToDatabase } from "@/lib/db";
import hoodpayService from "@/lib/paymentServices/hoodpayService";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
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

    // Load HoodPay settings
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "hoodpay",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "HoodPay payment method is not configured" },
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

    // Find order by HoodPay payment ID
    const order = await Order.findOne({
      "hoodpayPayment.paymentId": id,
    });

    if (!order) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    let paymentStatus = order.hoodpayPayment?.status || 'pending';
    let amount = order.totalAmount;
    let currency = order.hoodpayPayment?.currency || 'USD';

    // Try to get latest status from HoodPay API
    try {
      const statusResult = await hoodpayService.getPaymentStatus(id);
      
      if (statusResult.success && statusResult.data) {
        const apiStatus = statusResult.data.status;
        
        console.log("HoodPay API status:", {
          paymentId: id,
          apiStatus: apiStatus,
          mappedStatus: STATUS_MAP[apiStatus] || 'pending',
          amount: statusResult.data.amount,
        });

        // Map HoodPay status to internal status
        const mappedStatus = STATUS_MAP[apiStatus] || 'pending';
        
        // Update order if status changed
        if (mappedStatus !== order.hoodpayPayment?.status) {
          order.hoodpayPayment.status = mappedStatus;
          order.hoodpayPayment.lastStatusUpdate = new Date();
          
          // Update main payment status if completed
          if (mappedStatus === 'completed' && order.paymentStatus !== 'completed') {
            order.paymentStatus = 'completed';
            order.status = 'completed';
            order.paidAt = new Date();
          } else if (mappedStatus === 'failed' || mappedStatus === 'cancelled') {
            order.paymentStatus = mappedStatus;
            order.status = 'cancelled';
          }
          
          await order.save();
        }

        paymentStatus = mappedStatus;
        amount = statusResult.data.amount || amount;
        currency = statusResult.data.currency || currency;
      }
    } catch (apiError) {
      console.log("HoodPay API error, using stored order status:", apiError.message);
      // Continue with stored order status if API fails
    }

    console.log("Returning payment status:", {
      paymentId: id,
      status: paymentStatus,
      paymentStatus: order.paymentStatus,
      amount: amount,
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: id,
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: paymentStatus,
        paymentStatus: order.paymentStatus,
        amount: amount,
        currency: currency,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        paymentUrl: order.hoodpayPayment?.paymentUrl,
      },
    });
  } catch (error) {
    console.error("HoodPay status error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get payment status" },
      { status: 500 }
    );
  }
}
