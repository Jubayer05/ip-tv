import { connectToDatabase } from "@/lib/db";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsServiceV2";
import CryptoPayment from "@/models/CryptoPayment";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import WalletDeposit from "@/models/WalletDeposit";
import { NextResponse } from "next/server";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking payment status for ID: ${id}`);

    await connectToDatabase();

    // Get payment settings
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "nowpayment",
      isActive: true,
    });

    if (!paymentSettings || !paymentSettings.apiKey) {
      return NextResponse.json(
        { error: "NOWPayments not configured" },
        { status: 500 }
      );
    }

    // 🔥 Initialize V2 service
    await nowpaymentsService.initialize(paymentSettings);

    // 🔥 Try to find CryptoPayment record first
    const cryptoPayment = await CryptoPayment.findById(id);

    if (cryptoPayment) {
      console.log(`📝 Found CryptoPayment record:`, {
        id: cryptoPayment._id,
        invoiceId: cryptoPayment.invoiceId,
        paymentId: cryptoPayment.paymentId,
        status: cryptoPayment.paymentStatus,
        internalStatus: cryptoPayment.internalStatus,
      });

      // If we have a payment_id, fetch live status from NOWPayments
      let liveStatus = null;
      if (cryptoPayment.paymentId) {
        try {
          const result = await nowpaymentsService.getPaymentStatus(
            cryptoPayment.paymentId
          );

          if (result.success) {
            liveStatus = result.data;
            
            // Update local record if status changed
            if (liveStatus.payment_status !== cryptoPayment.paymentStatus) {
              cryptoPayment.paymentStatus = liveStatus.payment_status;
              cryptoPayment.internalStatus = nowpaymentsService.mapToInternalStatus(
                liveStatus.payment_status
              );
              cryptoPayment.actuallyPaid = liveStatus.actually_paid || cryptoPayment.actuallyPaid;
              cryptoPayment.updatedAt = new Date();
              await cryptoPayment.save();
            }
          }
        } catch (apiError) {
          console.warn("⚠️ Could not fetch live status:", apiError.message);
        }
      }

      return NextResponse.json({
        success: true,
        payment: {
          id: cryptoPayment._id,
          invoiceId: cryptoPayment.invoiceId,
          paymentId: cryptoPayment.paymentId,
          orderId: cryptoPayment.orderId,
          status: cryptoPayment.paymentStatus,
          internalStatus: cryptoPayment.internalStatus,
          priceAmount: cryptoPayment.priceAmount,
          priceCurrency: cryptoPayment.priceCurrency,
          payCurrency: cryptoPayment.payCurrency,
          payAmount: cryptoPayment.payAmount,
          actuallyPaid: cryptoPayment.actuallyPaid,
          payAddress: cryptoPayment.payAddress,
          invoiceUrl: cryptoPayment.invoiceUrl,
          createdAt: cryptoPayment.createdAt,
          updatedAt: cryptoPayment.updatedAt,
          paidAt: cryptoPayment.paidAt,
        },
        liveStatus: liveStatus,
      });
    }

    // 🔥 Fallback: Check if it's an order ID
    const order = await Order.findById(id);
    if (order?.nowpaymentsPayment) {
      console.log(`📋 Found order with NOWPayments data:`, {
        orderId: order._id,
        invoiceId: order.nowpaymentsPayment.invoiceId,
        paymentId: order.nowpaymentsPayment.paymentId,
        status: order.nowpaymentsPayment.paymentStatus,
      });

      // Fetch live status if we have payment_id
      let liveStatus = null;
      if (order.nowpaymentsPayment.paymentId) {
        try {
          const result = await nowpaymentsService.getPaymentStatus(
            order.nowpaymentsPayment.paymentId
          );

          if (result.success) {
            liveStatus = result.data;
          }
        } catch (apiError) {
          console.warn("⚠️ Could not fetch live status:", apiError.message);
        }
      }

      return NextResponse.json({
        success: true,
        payment: {
          id: order._id,
          invoiceId: order.nowpaymentsPayment.invoiceId,
          paymentId: order.nowpaymentsPayment.paymentId,
          orderId: order.orderNumber,
          status: order.nowpaymentsPayment.paymentStatus,
          internalStatus: order.paymentStatus,
          priceAmount: order.nowpaymentsPayment.priceAmount,
          priceCurrency: order.nowpaymentsPayment.priceCurrency,
          payCurrency: order.nowpaymentsPayment.payCurrency,
          payAmount: order.nowpaymentsPayment.payAmount,
          actuallyPaid: order.nowpaymentsPayment.actuallyPaid,
          payAddress: order.nowpaymentsPayment.payAddress,
          invoiceUrl: order.nowpaymentsPayment.paymentUrl,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          paidAt: order.paidAt,
        },
        liveStatus: liveStatus,
      });
    }

    // 🔥 Fallback: Check wallet deposits
    const deposit = await WalletDeposit.findById(id);
    if (deposit?.nowpaymentsPayment) {
      console.log(`💰 Found wallet deposit:`, {
        depositId: deposit._id,
        invoiceId: deposit.nowpaymentsPayment.invoiceId,
        paymentId: deposit.nowpaymentsPayment.paymentId,
        status: deposit.nowpaymentsPayment.status,
      });

      // Fetch live status if we have payment_id
      let liveStatus = null;
      if (deposit.nowpaymentsPayment.paymentId) {
        try {
          const result = await nowpaymentsService.getPaymentStatus(
            deposit.nowpaymentsPayment.paymentId
          );

          if (result.success) {
            liveStatus = result.data;
          }
        } catch (apiError) {
          console.warn("⚠️ Could not fetch live status:", apiError.message);
        }
      }

      return NextResponse.json({
        success: true,
        payment: {
          id: deposit._id,
          invoiceId: deposit.nowpaymentsPayment.invoiceId,
          paymentId: deposit.nowpaymentsPayment.paymentId,
          orderId: deposit.depositId,
          status: deposit.nowpaymentsPayment.status,
          internalStatus: deposit.status,
          priceAmount: deposit.nowpaymentsPayment.priceAmount,
          priceCurrency: deposit.nowpaymentsPayment.priceCurrency,
          payCurrency: deposit.nowpaymentsPayment.payCurrency,
          payAmount: deposit.nowpaymentsPayment.payAmount,
          actuallyPaid: deposit.nowpaymentsPayment.actuallyPaid,
          payAddress: deposit.nowpaymentsPayment.payAddress,
          invoiceUrl: deposit.nowpaymentsPayment.invoiceUrl,
          createdAt: deposit.createdAt,
          updatedAt: deposit.updatedAt,
        },
        liveStatus: liveStatus,
      });
    }

    console.log(`❌ Payment/Order/Deposit not found for ID: ${id}`);

    return NextResponse.json(
      {
        error: "Payment not found",
        details: "No payment, order, or deposit found with this ID",
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("❌ Status check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check payment status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
