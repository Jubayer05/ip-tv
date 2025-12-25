import { connectToDatabase } from "@/lib/db";
import hoodpayService from "@/lib/paymentServices/hoodpayService";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import PaymentSettings from "@/models/PaymentSettings";
import { NextResponse } from "next/server";

/**
 * CRON Job for HoodPay Subscription Renewals
 *
 * This endpoint should be called daily to check for subscriptions that need renewal
 * and create new payment orders for them.
 *
 * Setup with Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/hoodpay-renewals",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 *
 * Or use external cron services like:
 * - cron-job.org
 * - EasyCron
 * - GitHub Actions
 */

export async function GET(request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    console.log("🔄 Starting HoodPay subscription renewals check...");

    // Get HoodPay settings
    const hoodpaySettings = await PaymentSettings.findOne({
      gateway: "hoodpay",
      isActive: true,
    });

    if (!hoodpaySettings) {
      console.warn("⚠️ HoodPay settings not found");
      return NextResponse.json({
        success: false,
        message: "HoodPay not configured",
      });
    }

    // Configure service
    hoodpayService.setApiKey(hoodpaySettings.apiKey);
    hoodpayService.setBusinessId(hoodpaySettings.businessId);

    // Find active subscriptions that need renewal (within next 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const subscriptionsToRenew = await Order.find({
      paymentGateway: "HoodPay",
      "subscription.status": "active",
      "subscription.nextRenewalDate": {
        $lte: threeDaysFromNow,
        $gte: new Date(),
      },
    }).populate("userId");

    console.log(
      `📋 Found ${subscriptionsToRenew.length} subscriptions to process`
    );

    const results = {
      total: subscriptionsToRenew.length,
      renewed: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    for (const order of subscriptionsToRenew) {
      try {
        // Check if renewal was already attempted recently
        const recentRenewal = await Order.findOne({
          userId: order.userId,
          paymentGateway: "HoodPay",
          "hoodpayPayment.metadata.renewal_of": order._id.toString(),
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
        });

        if (recentRenewal) {
          console.log(
            `⏭️ Renewal already attempted for order ${order.orderNumber}`
          );
          results.skipped++;
          continue;
        }

        // Create new payment for renewal
        const renewalAmount = order.originalAmount || order.totalAmount;
        const origin =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const result = await hoodpayService.createPayment({
          amount: renewalAmount,
          currency: order.hoodpayPayment?.currency || "USD",
          orderId: `renewal-${order.orderNumber}-${Date.now()}`,
          orderDescription: `Subscription Renewal - ${order.orderNumber}`,
          customerEmail: order.userId?.email || order.guestEmail,
          metadata: {
            renewal_of: order._id.toString(),
            original_order: order.orderNumber,
            user_id: order.userId?._id.toString(),
            is_subscription: true,
            subscription_days: order.subscription?.intervalDays || 30,
          },
          notifyUrl: `${origin}/api/payments/hoodpay/webhook`,
          returnUrl: `${origin}/dashboard/subscriptions`,
          cancelUrl: `${origin}/dashboard/subscriptions`,
        });

        // Create new renewal order
        const renewalOrder = new Order({
          orderNumber: `renewal-${order.orderNumber}-${Date.now()}`,
          userId: order.userId,
          guestEmail: order.guestEmail,
          products: order.products,
          totalAmount: renewalAmount,
          originalAmount: renewalAmount,
          serviceFee: 0,
          paymentMethod: "Card",
          paymentGateway: "HoodPay",
          paymentStatus: "pending",
          contactInfo: order.contactInfo,
          status: "new",
          hoodpayPayment: {
            paymentId: result.data.paymentId,
            paymentUrl: result.data.paymentUrl,
            status: result.data.status || "pending",
            amount: renewalAmount,
            currency: order.hoodpayPayment?.currency || "USD",
            callbackReceived: false,
            lastStatusUpdate: new Date(),
            metadata: {
              renewal_of: order._id.toString(),
              original_order: order.orderNumber,
              user_id: order.userId?._id.toString(),
              is_subscription: true,
              subscription_days: order.subscription?.intervalDays || 30,
            },
          },
          subscription: {
            status: "inactive",
            planId: order.subscription?.planId,
            intervalDays: order.subscription?.intervalDays || 30,
          },
        });

        await renewalOrder.save();

        // Create Payment record
        await Payment.create({
          paymentId: result.data.paymentId,
          orderId: renewalOrder._id,
          userId: order.userId,
          amount: renewalAmount,
          currency: order.hoodpayPayment?.currency || "USD",
          status: "pending",
          gateway: "hoodpay",
          rawPayload: result.data,
        });

        // Send renewal notification email (if you have email service)
        // await sendRenewalEmail(order.userId, renewalOrder);

        console.log(
          `✅ Created renewal order ${renewalOrder.orderNumber} for ${order.orderNumber}`
        );
        results.renewed++;
      } catch (error) {
        console.error(`❌ Failed to renew order ${order.orderNumber}:`, error);
        results.failed++;
        results.errors.push({
          orderId: order._id,
          orderNumber: order.orderNumber,
          error: error.message,
        });
      }
    }

    console.log("🏁 HoodPay renewal check completed:", results);

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ HoodPay renewals CRON error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  // Allow POST requests as well for manual triggering
  return GET(request);
}
