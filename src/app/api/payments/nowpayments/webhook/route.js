import { connectToDatabase } from "@/lib/db";
import PaymentSettings from "@/models/PaymentSettings";
import CryptoPayment from "@/models/CryptoPayment";
import NOWPaymentsWebhookLog from "@/models/NOWPaymentsWebhookLog";
import User from "@/models/User";
import BalanceTransaction from "@/models/BalanceTransaction";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsServiceV2";
import { NextResponse } from "next/server";

/**
 * POST /api/payments/nowpayments/webhook
 * Handle NOWPayments IPN callbacks - PRODUCTION READY
 * This endpoint is IDEMPOTENT - safe to call multiple times
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    console.log("Received NOWPayments webhook");

    // PARSE WEBHOOK BODY
    const body = await request.json();
    const signature = request.headers.get("x-nowpayments-sig");

    console.log("Webhook payload:", {
      payment_id: body.payment_id,
      invoice_id: body.invoice_id,
      order_id: body.order_id,
      payment_status: body.payment_status,
      actually_paid: body.actually_paid,
      signature: signature?.substring(0, 20) + "...",
    });

    // DATABASE CONNECTION
    await connectToDatabase();

    // GET PAYMENT SETTINGS
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "nowpayment",
      isActive: true,
    });

    if (!paymentSettings) {
      console.error("NOWPayments settings not found");
      return NextResponse.json(
        { error: "Payment settings not configured" },
        { status: 500 }
      );
    }

    // INITIALIZE SERVICE
    await nowpaymentsService.initialize(paymentSettings);

    // CREATE WEBHOOK LOG
    const webhookLog = new NOWPaymentsWebhookLog({
      paymentId: body.payment_id,
      invoiceId: body.invoice_id,
      orderId: body.order_id,
      eventType: `payment.${body.payment_status}`,
      rawPayload: body,
      receivedSignature: signature,
      signatureValid: false,
      paymentStatus: body.payment_status,
      actuallyPaid: parseFloat(body.actually_paid || 0),
      payAmount: parseFloat(body.pay_amount || 0),
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    // VERIFY SIGNATURE
    if (!paymentSettings.sandboxMode) {
      const isValidSignature = nowpaymentsService.verifyIpnSignature(
        body,
        signature
      );

      webhookLog.signatureValid = isValidSignature;

      if (!isValidSignature) {
        console.error("Invalid webhook signature - REJECTING");
        webhookLog.processingError = "Invalid signature";
        await webhookLog.save();

        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }

      console.log("Webhook signature verified");
    } else {
      console.warn("Sandbox mode - skipping signature verification");
      webhookLog.signatureValid = true;
    }

    // FIND PAYMENT RECORD
    const payment = await CryptoPayment.findOne({
      $or: [
        { invoiceId: body.invoice_id },
        { paymentId: body.payment_id },
        { orderId: body.order_id },
      ],
    });

    if (!payment) {
      console.error("Payment record not found:", {
        invoice_id: body.invoice_id,
        payment_id: body.payment_id,
        order_id: body.order_id,
      });

      webhookLog.processingError = "Payment record not found";
      await webhookLog.save();

      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    console.log("Payment record found:", payment._id);

    // UPDATE PAYMENT RECORD
    payment.paymentId = body.payment_id;
    payment.paymentStatus = body.payment_status;
    payment.internalStatus = nowpaymentsService.mapToInternalStatus(
      body.payment_status
    );
    payment.payAddress = body.pay_address;
    payment.payCurrency = body.pay_currency?.toUpperCase();
    payment.payAmount = parseFloat(body.pay_amount || 0);
    payment.actuallyPaid = parseFloat(body.actually_paid || 0);
    payment.webhookReceived = true;
    payment.webhookReceivedAt = new Date();
    payment.webhookCount += 1;
    payment.updatedAt = new Date();

    await payment.save();

    console.log("Payment record updated:", {
      status: payment.paymentStatus,
      internalStatus: payment.internalStatus,
      actuallyPaid: payment.actuallyPaid,
    });

    // PROCESS PAYMENT STATUS
    let userCredited = false;
    let creditedAmount = 0;

    if (body.payment_status === "finished") {
      console.log("💰 Payment finished - processing user credit");

      // Check if already credited (idempotency)
      if (payment.userCredited) {
        console.warn("⚠️ User already credited for this payment - skipping");
        webhookLog.userCredited = true;
        webhookLog.creditedAmount = payment.creditedAmount;
      } else {
        // Credit user wallet
        try {
          const creditAmount = payment.priceAmount; // Credit USD amount

          if (payment.userId) {
            const user = await User.findById(payment.userId);

            if (user) {
              // Update user balance
              user.wallet = user.wallet || { balance: 0, currency: "USD" };
              user.wallet.balance += creditAmount;
              await user.save();

              // Create balance transaction
              const transaction = new BalanceTransaction({
                userId: user._id,
                type: "deposit",
                amount: creditAmount,
                currency: "USD",
                balanceBefore: user.wallet.balance - creditAmount,
                balanceAfter: user.wallet.balance,
                description: `Crypto deposit via NOWPayments - ${payment.payCurrency}`,
                reference: `crypto-${payment.invoiceId}`,
                status: "completed",
                metadata: {
                  gateway: "nowpayments",
                  invoiceId: payment.invoiceId,
                  paymentId: payment.paymentId,
                  payCurrency: payment.payCurrency,
                  payAmount: payment.payAmount,
                  actuallyPaid: payment.actuallyPaid,
                },
              });

              await transaction.save();

              console.log("User credited successfully:", {
                userId: user._id,
                amount: creditAmount,
                newBalance: user.wallet.balance,
              });

              // Mark payment as credited
              await payment.creditUser(creditAmount);

              userCredited = true;
              creditedAmount = creditAmount;

              webhookLog.userCredited = true;
              webhookLog.creditedAmount = creditAmount;
            } else {
              console.error("User not found:", payment.userId);
              webhookLog.processingError = "User not found";
            }
          } else {
            console.warn("No userId associated with payment");
            webhookLog.processingError = "No userId";
          }
        } catch (creditError) {
          console.error("Error crediting user:", creditError);
          webhookLog.processingError = `Credit error: ${creditError.message}`;
        }
      }

      // Mark payment as completed
      await payment.markAsCompleted();
    } else if (body.payment_status === "failed") {
      console.log("Payment failed");
      await payment.markAsFailed("Payment failed by NOWPayments");
    } else if (body.payment_status === "expired") {
      console.log("Payment expired");
      await payment.markAsFailed("Payment expired");
    } else if (body.payment_status === "partially_paid") {
      console.log("Payment partially paid");
      webhookLog.processingError = "Partially paid";
    } else {
      console.log("Payment status:", body.payment_status);
    }

    // MARK WEBHOOK AS PROCESSED
    webhookLog.processed = true;
    webhookLog.processedAt = new Date();
    await webhookLog.save();

    const processingTime = Date.now() - startTime;
    console.log(`Webhook processed successfully in ${processingTime}ms`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Webhook processed",
      paymentId: body.payment_id,
      status: body.payment_status,
      userCredited,
      creditedAmount,
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/nowpayments/webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "NOWPayments webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
