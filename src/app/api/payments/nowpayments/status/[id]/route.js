import { connectToDatabase } from "@/lib/db";
import CryptoPayment from "@/models/CryptoPayment";
import PaymentSettings from "@/models/PaymentSettings";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsServiceV2";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

/**
 * GET /api/payments/nowpayments/status/[id]
 * Get payment status (for polling)
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID required" },
        { status: 400 }
      );
    }

    console.log("🔍 Checking payment status:", id);

    await connectToDatabase();

    // Build query - only include _id if it's a valid ObjectId
    const query = {
      $or: [
        { invoiceId: id },
        { paymentId: id },
        { orderId: id },
      ],
    };

    // Only add _id lookup if the id is a valid ObjectId format
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or.unshift({ _id: id });
    }

    // Find payment in database
    const payment = await CryptoPayment.findOne(query);

    if (!payment) {
      console.error("❌ Payment not found:", id);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    console.log("✅ Payment found:", {
      id: payment._id,
      status: payment.paymentStatus,
      internalStatus: payment.internalStatus,
    });

    // If payment already completed/failed, return cached status
    if (
      ["completed", "failed", "cancelled"].includes(payment.internalStatus)
    ) {
      console.log("ℹ️ Returning cached status (payment finalized)");

      return NextResponse.json({
        success: true,
        data: {
          paymentId: payment.paymentId,
          invoiceId: payment.invoiceId,
          orderId: payment.orderId,
          status: payment.paymentStatus,
          internalStatus: payment.internalStatus,
          priceAmount: payment.priceAmount,
          priceCurrency: payment.priceCurrency,
          payCurrency: payment.payCurrency,
          payAmount: payment.payAmount,
          actuallyPaid: payment.actuallyPaid,
          payAddress: payment.payAddress,
          userCredited: payment.userCredited,
          creditedAmount: payment.creditedAmount,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          completedAt: payment.completedAt,
        },
      });
    }

    // Otherwise, fetch fresh status from NOWPayments
    if (payment.paymentId) {
      try {
        console.log("📡 Fetching fresh status from NOWPayments...");

        const paymentSettings = await PaymentSettings.findOne({
          gateway: "nowpayment",
          isActive: true,
        });

        if (paymentSettings) {
          await nowpaymentsService.initialize(paymentSettings);

          const statusResult = await nowpaymentsService.getPaymentStatus(
            payment.paymentId
          );

          if (statusResult.success) {
            const freshData = statusResult.data;

            // Update payment record
            payment.paymentStatus = freshData.paymentStatus;
            payment.internalStatus = nowpaymentsService.mapToInternalStatus(
              freshData.paymentStatus
            );
            payment.payAddress = freshData.payAddress;
            payment.payCurrency = freshData.payCurrency;
            payment.payAmount = freshData.payAmount;
            payment.actuallyPaid = freshData.actuallyPaid;
            payment.updatedAt = new Date();

            await payment.save();

            console.log("✅ Status updated from API:", {
              status: payment.paymentStatus,
              actuallyPaid: payment.actuallyPaid,
            });

            return NextResponse.json({
              success: true,
              data: {
                paymentId: payment.paymentId,
                invoiceId: payment.invoiceId,
                orderId: payment.orderId,
                status: payment.paymentStatus,
                internalStatus: payment.internalStatus,
                priceAmount: payment.priceAmount,
                priceCurrency: payment.priceCurrency,
                payCurrency: payment.payCurrency,
                payAmount: payment.payAmount,
                actuallyPaid: payment.actuallyPaid,
                payAddress: payment.payAddress,
                userCredited: payment.userCredited,
                creditedAmount: payment.creditedAmount,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt,
                completedAt: payment.completedAt,
              },
            });
          }
        }
      } catch (apiError) {
        console.error("⚠️ Failed to fetch fresh status:", apiError.message);
        // Fall through to return cached status
      }
    }

    // Return cached status as fallback
    console.log("ℹ️ Returning cached status");

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.paymentId,
        invoiceId: payment.invoiceId,
        orderId: payment.orderId,
        status: payment.paymentStatus,
        internalStatus: payment.internalStatus,
        priceAmount: payment.priceAmount,
        priceCurrency: payment.priceCurrency,
        payCurrency: payment.payCurrency,
        payAmount: payment.payAmount,
        actuallyPaid: payment.actuallyPaid,
        payAddress: payment.payAddress,
        userCredited: payment.userCredited,
        creditedAmount: payment.creditedAmount,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
      },
    });
  } catch (error) {
    console.error("❌ Status check error:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "Failed to check payment status",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
