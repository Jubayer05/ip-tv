import { connectToDatabase } from "@/lib/db";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsServiceV2";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import WalletDeposit from "@/models/WalletDeposit";
import CryptoPayment from "@/models/CryptoPayment";
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

    console.log(`🔄 Polling payment status for ID: ${id}`);

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

    // Try CryptoPayment first
    const cryptoPayment = await CryptoPayment.findById(id);
    
    if (cryptoPayment?.paymentId) {
      const result = await nowpaymentsService.getPaymentStatus(
        cryptoPayment.paymentId
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to get payment status" },
          { status: 500 }
        );
      }

      const nowpaymentsStatus = result.data;

      // Update CryptoPayment record
      const internalStatus = nowpaymentsService.mapToInternalStatus(
        nowpaymentsStatus.payment_status
      );

      cryptoPayment.paymentStatus = nowpaymentsStatus.payment_status;
      cryptoPayment.internalStatus = internalStatus;
      cryptoPayment.actuallyPaid = nowpaymentsStatus.actually_paid || 0;
      cryptoPayment.payAddress = nowpaymentsStatus.pay_address || cryptoPayment.payAddress;
      cryptoPayment.payCurrency = nowpaymentsStatus.pay_currency || cryptoPayment.payCurrency;
      cryptoPayment.payAmount = nowpaymentsStatus.pay_amount || cryptoPayment.payAmount;
      cryptoPayment.updatedAt = new Date();

      if (nowpaymentsStatus.payment_status === "finished" && !cryptoPayment.paidAt) {
        cryptoPayment.paidAt = new Date();
      }

      await cryptoPayment.save();

      return NextResponse.json({
        success: true,
        payment: {
          id: cryptoPayment._id,
          status: nowpaymentsStatus.payment_status,
          internalStatus: internalStatus,
          paymentId: nowpaymentsStatus.payment_id,
          invoiceId: cryptoPayment.invoiceId,
          orderId: cryptoPayment.orderId,
          priceAmount: nowpaymentsStatus.price_amount,
          priceCurrency: nowpaymentsStatus.price_currency,
          payAmount: nowpaymentsStatus.pay_amount,
          payCurrency: nowpaymentsStatus.pay_currency,
          actuallyPaid: nowpaymentsStatus.actually_paid,
          payAddress: nowpaymentsStatus.pay_address,
          createdAt: nowpaymentsStatus.created_at,
          updatedAt: nowpaymentsStatus.updated_at,
        },
        rawStatus: nowpaymentsStatus,
      });
    }

    // Fallback: check Order
    const order = await Order.findOne({
      $or: [
        { _id: id },
        { "nowpaymentsPayment.paymentId": id },
        { "nowpaymentsPayment.invoiceId": id },
      ],
    });

    if (order?.nowpaymentsPayment?.paymentId) {
      const result = await nowpaymentsService.getPaymentStatus(
        order.nowpaymentsPayment.paymentId
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to get payment status" },
          { status: 500 }
        );
      }

      const nowpaymentsStatus = result.data;
      const internalStatus = nowpaymentsService.mapToInternalStatus(
        nowpaymentsStatus.payment_status
      );

      // Update order
      order.nowpaymentsPayment.paymentStatus = nowpaymentsStatus.payment_status;
      order.paymentStatus = internalStatus;
      order.nowpaymentsPayment.actuallyPaid = nowpaymentsStatus.actually_paid || 0;
      order.nowpaymentsPayment.lastStatusUpdate = new Date();

      if (nowpaymentsStatus.payment_status === "finished") {
        order.status = "completed";
        if (!order.paidAt) {
          order.paidAt = new Date();
        }
      }

      await order.save();

      return NextResponse.json({
        success: true,
        payment: {
          id: order._id,
          status: nowpaymentsStatus.payment_status,
          internalStatus: internalStatus,
          paymentId: nowpaymentsStatus.payment_id,
          orderId: order.orderNumber,
          priceAmount: nowpaymentsStatus.price_amount,
          priceCurrency: nowpaymentsStatus.price_currency,
          payAmount: nowpaymentsStatus.pay_amount,
          payCurrency: nowpaymentsStatus.pay_currency,
          actuallyPaid: nowpaymentsStatus.actually_paid,
          payAddress: nowpaymentsStatus.pay_address,
        },
        rawStatus: nowpaymentsStatus,
      });
    }

    // Fallback: check WalletDeposit
    const deposit = await WalletDeposit.findOne({
      $or: [
        { _id: id },
        { "nowpaymentsPayment.paymentId": id },
        { "nowpaymentsPayment.invoiceId": id },
      ],
    });

    if (deposit?.nowpaymentsPayment?.paymentId) {
      const result = await nowpaymentsService.getPaymentStatus(
        deposit.nowpaymentsPayment.paymentId
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to get payment status" },
          { status: 500 }
        );
      }

      const nowpaymentsStatus = result.data;

      return NextResponse.json({
        success: true,
        payment: {
          id: deposit._id,
          status: nowpaymentsStatus.payment_status,
          paymentId: nowpaymentsStatus.payment_id,
          depositId: deposit.depositId,
          priceAmount: nowpaymentsStatus.price_amount,
          priceCurrency: nowpaymentsStatus.price_currency,
          actuallyPaid: nowpaymentsStatus.actually_paid,
        },
        rawStatus: nowpaymentsStatus,
      });
    }

    return NextResponse.json(
      { error: "Payment not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("❌ Poll error:", error);
    return NextResponse.json(
      {
        error: "Failed to poll payment status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
