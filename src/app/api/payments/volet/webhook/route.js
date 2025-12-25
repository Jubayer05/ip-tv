import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import voletService from "@/lib/paymentServices/voletService";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import WebhookLog from "@/models/WebhookLog";
import BalanceTransaction from "@/models/BalanceTransaction";
import { NextResponse } from "next/server";

/**
 * POST /api/payments/volet/webhook
 * Handle Volet SCI callbacks (Status URL)
 * This endpoint processes both deposits and orders
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    console.log("[Volet Webhook] Received callback");

    // Parse webhook body (Volet sends form data or JSON)
    let callbackData;
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      callbackData = Object.fromEntries(formData.entries());
    } else {
      callbackData = await request.json();
    }

    console.log("[Volet Webhook] Callback data:", {
      ac_order_id: callbackData.ac_order_id,
      ac_amount: callbackData.ac_amount,
      ac_currency: callbackData.ac_currency,
      ac_transaction_id: callbackData.ac_transaction_id,
      hasSignature: !!callbackData.ac_sign,
    });

    await connectToDatabase();

    // Get Volet payment settings
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "volet",
      isActive: true,
    });

    if (!paymentSettings) {
      console.error("[Volet Webhook] Payment settings not found");
      return NextResponse.json(
        { error: "Volet payment settings not configured" },
        { status: 500 }
      );
    }

    // Initialize service with credentials
    voletService.initialize(paymentSettings);

    // Create webhook log
    let webhookLog;
    try {
      webhookLog = new WebhookLog({
        gateway: "volet",
        eventType: "payment.callback",
        paymentId: callbackData.ac_order_id,
        orderId: callbackData.ac_order_id,
        rawPayload: callbackData,
        receivedSignature: callbackData.ac_sign,
        signatureValid: false,
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      });
    } catch (logError) {
      console.warn("[Volet Webhook] Could not create webhook log:", logError.message);
    }

    // Verify webhook signature
    const isValidSignature = voletService.verifyWebhookSignature(callbackData);

    if (webhookLog) {
      webhookLog.signatureValid = isValidSignature;
    }

    if (!isValidSignature) {
      console.error("[Volet Webhook] Invalid signature - REJECTING");
      if (webhookLog) {
        webhookLog.processingError = "Invalid signature";
        await webhookLog.save();
      }
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    console.log("[Volet Webhook] Signature verified successfully");

    // Parse webhook data
    const parsedData = voletService.parseWebhookData(callbackData);
    const orderId = parsedData.orderId;
    const status = parsedData.status;

    console.log("[Volet Webhook] Parsed data:", {
      orderId,
      status,
      amount: parsedData.amount,
      transactionId: parsedData.transactionId,
    });

    // Try to find as deposit first (deposits have IDs starting with "deposit-volet-")
    let deposit = null;
    let order = null;
    let userCredited = false;
    let creditedAmount = 0;

    if (orderId && orderId.startsWith("deposit-volet-")) {
      // This is a deposit
      deposit = await WalletDeposit.findOne({
        $or: [
          { "voletPayment.paymentId": orderId },
          { "voletPayment.orderId": orderId },
        ],
      });

      if (deposit) {
        console.log("[Volet Webhook] Found deposit:", deposit._id);

        // Update deposit status
        deposit.voletPayment.status = status;
        deposit.voletPayment.transactionId = parsedData.transactionId || "";
        deposit.voletPayment.callbackReceived = true;
        deposit.voletPayment.lastStatusUpdate = new Date();

        if (status === "completed") {
          deposit.status = "completed";
          deposit.voletPayment.completedAt = new Date();

          // Credit user balance (idempotency check)
          if (!deposit.voletPayment.metadata?.userCredited) {
            const user = await User.findById(deposit.userId);

            if (user) {
              // Credit the original amount (not including fees)
              const creditAmount = deposit.amount;

              // Update user balance
              user.wallet = user.wallet || { balance: 0, currency: "USD" };
              const balanceBefore = user.wallet.balance;
              user.wallet.balance += creditAmount;
              await user.save();

              // Create balance transaction
              try {
                const transaction = new BalanceTransaction({
                  userId: user._id,
                  type: "deposit",
                  amount: creditAmount,
                  currency: "USD",
                  balanceBefore: balanceBefore,
                  balanceAfter: user.wallet.balance,
                  description: `Volet deposit - Order ${orderId}`,
                  reference: `volet-${orderId}`,
                  status: "completed",
                  metadata: {
                    gateway: "volet",
                    orderId: orderId,
                    transactionId: parsedData.transactionId,
                    originalAmount: deposit.amount,
                    serviceFee: deposit.serviceFee,
                    finalAmount: deposit.finalAmount,
                  },
                });
                await transaction.save();
              } catch (txError) {
                console.warn("[Volet Webhook] Could not create balance transaction:", txError.message);
              }

              // Mark as credited
              deposit.voletPayment.metadata = {
                ...deposit.voletPayment.metadata,
                userCredited: true,
                creditedAmount: creditAmount,
                creditedAt: new Date(),
              };

              userCredited = true;
              creditedAmount = creditAmount;

              console.log("[Volet Webhook] User credited:", {
                userId: user._id,
                amount: creditAmount,
                newBalance: user.wallet.balance,
              });
            } else {
              console.error("[Volet Webhook] User not found for deposit:", deposit.userId);
            }
          } else {
            console.log("[Volet Webhook] User already credited for this deposit");
            userCredited = true;
            creditedAmount = deposit.voletPayment.metadata.creditedAmount || deposit.amount;
          }
        } else if (status === "failed") {
          deposit.status = "failed";
        }

        await deposit.save();
        console.log("[Volet Webhook] Deposit updated:", deposit._id);
      }
    }

    // If not a deposit, try to find as order
    if (!deposit) {
      order = await Order.findOne({
        $or: [
          { "voletPayment.paymentId": orderId },
          { orderNumber: orderId },
        ],
      });

      if (order) {
        console.log("[Volet Webhook] Found order:", order._id);

        // Update Volet payment status
        if (!order.voletPayment) {
          order.voletPayment = {};
        }

        order.voletPayment.status = status;
        order.voletPayment.transactionId = parsedData.transactionId || "";
        order.voletPayment.callbackReceived = true;
        order.voletPayment.lastStatusUpdate = new Date();

        // Use payment updater for consistent status handling
        await applyPaymentUpdate({
          order,
          gatewayKey: "voletPayment",
          rawStatus: status,
          gatewayFields: {
            transactionId: parsedData.transactionId || "",
            callbackReceived: true,
          },
        });

        console.log("[Volet Webhook] Order updated:", {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
        });
      }
    }

    // If neither deposit nor order found
    if (!deposit && !order) {
      console.error("[Volet Webhook] No deposit or order found for:", orderId);
      if (webhookLog) {
        webhookLog.processingError = "Payment record not found";
        await webhookLog.save();
      }
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // Save webhook log
    if (webhookLog) {
      webhookLog.processed = true;
      webhookLog.processedAt = new Date();
      webhookLog.userCredited = userCredited;
      webhookLog.creditedAmount = creditedAmount;
      await webhookLog.save();
    }

    const processingTime = Date.now() - startTime;
    console.log(`[Volet Webhook] Processed successfully in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      orderId: orderId,
      status: status,
      type: deposit ? "deposit" : "order",
      userCredited,
      creditedAmount,
    });
  } catch (error) {
    console.error("[Volet Webhook] Error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/volet/webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Volet webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
