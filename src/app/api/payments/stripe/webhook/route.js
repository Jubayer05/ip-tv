import { connectToDatabase } from "@/lib/db";
import stripeService from "@/lib/paymentServices/stripeService";
import Order from "@/models/Order";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import WebhookLog from "@/models/WebhookLog";
import PaymentSettings from "@/models/PaymentSettings";
import { NextResponse } from "next/server";

export async function POST(request) {
  let webhookLog = null;

  try {
    await connectToDatabase();

    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Extract signature from headers
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ Missing Stripe signature");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    console.log("🔔 Stripe Webhook received");

    // Load Stripe settings
    const stripeSettings = await PaymentSettings.findOne({
      gateway: "stripe",
      isActive: true,
    });

    if (!stripeSettings) {
      console.error("❌ Stripe settings not found");
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 400 }
      );
    }

    // Configure Stripe service
    stripeService.initialize(stripeSettings.apiKey);
    
    if (stripeSettings.webhookSecret) {
      stripeService.setWebhookSecret(stripeSettings.webhookSecret);
    }

    // Verify webhook signature
    const event = stripeService.verifyWebhookSignature(rawBody, signature);

    if (!event) {
      console.error("❌ Invalid Stripe webhook signature");
      
      // Create webhook log for failed verification
      await WebhookLog.create({
        gateway: "stripe",
        signature: signature.substring(0, 50) + "...",
        body: { error: "Invalid signature" },
        headers: Object.fromEntries(request.headers.entries()),
        processed: true,
        processingError: "Invalid webhook signature",
      });

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log("✅ Webhook signature verified");
    console.log("📨 Event type:", event.type);

    // Create webhook log for audit trail
    webhookLog = await WebhookLog.create({
      gateway: "stripe",
      signature: signature.substring(0, 50) + "...",
      body: event,
      headers: Object.fromEntries(request.headers.entries()),
      processed: false,
    });

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        console.log("💳 Checkout session completed:", {
          sessionId: session.id,
          mode: session.mode,
          paymentStatus: session.payment_status,
          metadata: session.metadata,
        });

        // Determine payment type from metadata
        const paymentType = session.metadata?.type || session.metadata?.purpose;

        if (paymentType === "deposit") {
          await handleDepositCheckoutCompleted(session, webhookLog);
        } else if (paymentType === "subscription") {
          await handleSubscriptionCheckoutCompleted(session, webhookLog);
        } else if (session.mode === "subscription") {
          // Fallback: treat as subscription if mode is subscription
          await handleSubscriptionCheckoutCompleted(session, webhookLog);
        } else {
          console.warn("⚠️ Unknown payment type:", paymentType);
        }
        
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        
        console.log("✅ Payment intent succeeded:", {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          metadata: paymentIntent.metadata,
        });

        const paymentType = paymentIntent.metadata?.type || paymentIntent.metadata?.purpose;

        if (paymentType === "deposit") {
          await handleDepositPaymentSucceeded(paymentIntent, webhookLog);
        } else if (paymentType === "subscription") {
          await handleSubscriptionPaymentSucceeded(paymentIntent, webhookLog);
        }
        
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        
        console.log("❌ Payment intent failed:", {
          paymentIntentId: paymentIntent.id,
          metadata: paymentIntent.metadata,
        });

        await handlePaymentFailed(paymentIntent, webhookLog);
        
        break;
      }

      // ==================== SUBSCRIPTION EVENTS ====================

      case "invoice.paid": {
        const invoice = event.data.object;
        
        console.log("💰 Invoice paid:", {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
          customerId: invoice.customer,
        });

        await handleInvoicePaid(invoice, webhookLog);
        
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        
        console.log("❌ Invoice payment failed:", {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
        });

        await handleInvoicePaymentFailed(invoice, webhookLog);
        
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        console.log("📋 Subscription updated:", {
          subscriptionId: subscription.id,
          status: subscription.status,
        });

        await handleSubscriptionUpdated(subscription, webhookLog);
        
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        console.log("🗑️ Subscription deleted:", {
          subscriptionId: subscription.id,
        });

        await handleSubscriptionDeleted(subscription, webhookLog);
        
        break;
      }

      default:
        console.log("ℹ️ Unhandled event type:", event.type);
    }

    // Mark webhook as processed
    if (webhookLog) {
      webhookLog.processed = true;
      await webhookLog.save();
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("❌ Stripe webhook error:", error);

    if (webhookLog) {
      webhookLog.processed = true;
      webhookLog.processingError = error.message;
      await webhookLog.save();
    }

    // Return 200 to prevent Stripe retry storms
    return NextResponse.json(
      { error: error.message },
      { status: 200 }
    );
  }
}

// ==================== HELPER FUNCTIONS ====================

async function handleDepositCheckoutCompleted(session, webhookLog) {
  try {
    const depositId = session.metadata?.deposit_id;
    
    if (!depositId) {
      console.warn("⚠️ No deposit_id in session metadata");
      return;
    }

    // Find deposit by session ID
    const deposit = await WalletDeposit.findOne({
      "stripePayment.sessionId": session.id,
    });

    if (!deposit) {
      console.warn("⚠️ Deposit not found for session:", session.id);
      return;
    }

    // Update deposit status
    deposit.stripePayment.paymentIntentId = session.payment_intent;
    deposit.stripePayment.status = session.payment_status;
    deposit.stripePayment.callbackReceived = true;
    deposit.stripePayment.lastStatusUpdate = new Date();
    
    // If payment is complete, credit the balance
    if (session.payment_status === "paid") {
      deposit.status = "completed";
      deposit.completedAt = new Date();

      // Credit user balance with originalAmount (not finalAmount with fees)
      const user = await User.findById(deposit.userId);
      if (user) {
        user.balance += deposit.originalAmount;
        await user.save();

        console.log("✅ Balance credited:", {
          userId: user._id,
          amount: deposit.originalAmount,
          newBalance: user.balance,
        });
      }
    }

    await deposit.save();

    if (webhookLog) {
      webhookLog.paymentId = session.id;
    }

    console.log("✅ Deposit checkout completed:", {
      depositId: deposit.depositId,
      status: deposit.status,
    });

  } catch (error) {
    console.error("❌ Error handling deposit checkout:", error);
    throw error;
  }
}

async function handleDepositPaymentSucceeded(paymentIntent, webhookLog) {
  try {
    const depositId = paymentIntent.metadata?.deposit_id;

    if (!depositId) {
      console.warn("⚠️ No deposit_id in payment intent metadata");
      return;
    }

    // Find deposit by payment intent ID
    const deposit = await WalletDeposit.findOne({
      "stripePayment.paymentIntentId": paymentIntent.id,
    });

    if (!deposit) {
      console.warn("⚠️ Deposit not found for payment intent:", paymentIntent.id);
      return;
    }

    // Update deposit status
    deposit.stripePayment.status = "succeeded";
    deposit.stripePayment.callbackReceived = true;
    deposit.stripePayment.lastStatusUpdate = new Date();
    deposit.status = "completed";
    deposit.completedAt = new Date();

    // Credit user balance with originalAmount
    const user = await User.findById(deposit.userId);
    if (user) {
      user.balance += deposit.originalAmount;
      await user.save();

      console.log("✅ Balance credited:", {
        userId: user._id,
        amount: deposit.originalAmount,
        newBalance: user.balance,
      });
    }

    await deposit.save();

    if (webhookLog) {
      webhookLog.paymentId = paymentIntent.id;
    }

    console.log("✅ Deposit payment succeeded:", {
      depositId: deposit.depositId,
      amount: deposit.originalAmount,
    });

  } catch (error) {
    console.error("❌ Error handling deposit payment:", error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent, webhookLog) {
  try {
    // Check if it's a deposit
    const deposit = await WalletDeposit.findOne({
      "stripePayment.paymentIntentId": paymentIntent.id,
    });

    if (deposit) {
      deposit.stripePayment.status = "failed";
      deposit.stripePayment.callbackReceived = true;
      deposit.stripePayment.lastStatusUpdate = new Date();
      deposit.status = "failed";
      await deposit.save();

      console.log("❌ Deposit payment failed:", {
        depositId: deposit.depositId,
      });
    }

    // Check if it's an order
    const order = await Order.findOne({
      "stripePayment.paymentIntentId": paymentIntent.id,
    });

    if (order) {
      order.stripePayment.status = "failed";
      order.stripePayment.callbackReceived = true;
      order.stripePayment.lastStatusUpdate = new Date();
      order.status = "failed";
      order.paymentStatus = "failed";
      await order.save();

      console.log("❌ Order payment failed:", {
        orderId: order.orderId,
      });
    }

    if (webhookLog) {
      webhookLog.paymentId = paymentIntent.id;
    }

  } catch (error) {
    console.error("❌ Error handling payment failure:", error);
    throw error;
  }
}
async function handleSubscriptionCheckoutCompleted(session, webhookLog) {
  try {
    const orderId = session.metadata?.order_id;
    
    if (!orderId) {
      console.warn("⚠️ No order_id in session metadata");
      return;
    }

    const order = await Order.findOne({
      "stripePayment.sessionId": session.id,
    });

    if (!order) {
      console.warn("⚠️ Order not found for session:", session.id);
      return;
    }

    order.stripePayment.paymentIntentId = session.payment_intent;
    order.stripePayment.status = session.payment_status;
    order.stripePayment.callbackReceived = true;
    order.stripePayment.lastStatusUpdate = new Date();
    
    if (session.payment_status === "paid") {
      order.status = "completed";
      order.paymentStatus = "paid";
      order.completedAt = new Date();

      console.log("✅ Order payment completed:", {
        orderId: order.orderId,
        amount: order.finalAmount,
      });
    }

    await order.save();

    if (webhookLog) {
      webhookLog.paymentId = session.id;
    }

  } catch (error) {
    console.error("❌ Error handling subscription checkout:", error);
    throw error;
  }
}

// NEW: Handle subscription payment intent succeeded
async function handleSubscriptionPaymentSucceeded(paymentIntent, webhookLog) {
  try {
    const orderId = paymentIntent.metadata?.order_id;

    if (!orderId) {
      console.warn("⚠️ No order_id in payment intent metadata");
      return;
    }

    const order = await Order.findOne({
      "stripePayment.paymentIntentId": paymentIntent.id,
    });

    if (!order) {
      console.warn("⚠️ Order not found for payment intent:", paymentIntent.id);
      return;
    }

    order.stripePayment.status = "succeeded";
    order.stripePayment.callbackReceived = true;
    order.stripePayment.lastStatusUpdate = new Date();
    order.status = "completed";
    order.paymentStatus = "paid";
    order.completedAt = new Date();

    await order.save();

    if (webhookLog) {
      webhookLog.paymentId = paymentIntent.id;
    }

    console.log("✅ Order payment succeeded:", {
      orderId: order.orderId,
      amount: order.finalAmount,
    });

  } catch (error) {
    console.error("❌ Error handling subscription payment:", error);
    throw error;
  }
}

async function handleInvoicePaid(invoice, webhookLog) {
  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: customerId });
    if (!user) {
      console.warn("⚠️ User not found for customer:", customerId);
      return;
    }

    // Update subscription status
    user.subscriptionStatus = "active";
    user.stripeSubscriptionId = subscriptionId;
    
    // Update next billing date
    if (invoice.period_end) {
      user.subscriptionEndDate = new Date(invoice.period_end * 1000);
    }

    await user.save();

    console.log("✅ Invoice paid - subscription renewed:", {
      userId: user._id,
      subscriptionId,
    });

    if (webhookLog) {
      webhookLog.paymentId = invoice.id;
    }

  } catch (error) {
    console.error("❌ Error handling invoice paid:", error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(invoice, webhookLog) {
  try {
    const customerId = invoice.customer;

    const user = await User.findOne({ stripeCustomerId: customerId });
    if (!user) {
      console.warn("⚠️ User not found for customer:", customerId);
      return;
    }

    // Mark subscription as past_due
    user.subscriptionStatus = "past_due";
    await user.save();

    console.log("❌ Invoice payment failed:", {
      userId: user._id,
    });

    if (webhookLog) {
      webhookLog.paymentId = invoice.id;
    }

  } catch (error) {
    console.error("❌ Error handling invoice failure:", error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription, webhookLog) {
  try {
    const customerId = subscription.customer;

    const user = await User.findOne({ stripeCustomerId: customerId });
    if (!user) {
      console.warn("⚠️ User not found for customer:", customerId);
      return;
    }

    // Update subscription status
    user.stripeSubscriptionId = subscription.id;
    user.subscriptionStatus = subscription.status;
    
    if (subscription.current_period_end) {
      user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    }

    await user.save();

    console.log("✅ Subscription updated:", {
      userId: user._id,
      status: subscription.status,
    });

    if (webhookLog) {
      webhookLog.paymentId = subscription.id;
    }

  } catch (error) {
    console.error("❌ Error handling subscription update:", error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription, webhookLog) {
  try {
    const customerId = subscription.customer;

    const user = await User.findOne({ stripeCustomerId: customerId });
    if (!user) {
      console.warn("⚠️ User not found for customer:", customerId);
      return;
    }

    // Mark subscription as cancelled
    user.subscriptionStatus = "cancelled";
    await user.save();

    console.log("✅ Subscription deleted:", {
      userId: user._id,
    });

    if (webhookLog) {
      webhookLog.paymentId = subscription.id;
    }

  } catch (error) {
    console.error("❌ Error handling subscription deletion:", error);
    throw error;
  }
}
