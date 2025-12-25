import { connectToDatabase } from "@/lib/db";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsService";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("⏰ Running subscription renewal cron job");

    await connectToDatabase();

    // Get NOWPayments settings
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "nowpayment",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "NOWPayments not configured" },
        { status: 400 }
      );
    }

    nowpaymentsService.setApiKey(paymentSettings.apiKey);
    if (paymentSettings.ipnSecret || paymentSettings.apiSecret) {
      nowpaymentsService.setIpnSecret(
        paymentSettings.ipnSecret || paymentSettings.apiSecret
      );
    }
    if (paymentSettings.sandboxMode) {
      nowpaymentsService.setSandboxMode(true);
    }

    // Find subscriptions due for renewal
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueOrders = await Order.find({
      "subscription.isActive": true,
      "subscription.autoRenew": true,
      "subscription.nextBillingDate": { $lte: today },
      paymentGateway: "NOWPayments",
    }).populate("userId");

    console.log(`📋 Found ${dueOrders.length} subscriptions due for renewal`);

    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const order of dueOrders) {
      results.processed++;

      try {
        console.log(`💳 Creating renewal invoice for order ${order._id}`);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        // Create new invoice for renewal
        const invoiceResult = await nowpaymentsService.createInvoice({
          price_amount: order.totalAmount,
          price_currency: order.nowpaymentsPayment?.priceCurrency || "usd",
          order_id: `renewal-${order.orderNumber}-${Date.now()}`,
          order_description: `Subscription Renewal - ${order.orderNumber}`,
          ipn_callback_url: `${baseUrl}/api/payments/nowpayment/webhook`,
          success_url: `${baseUrl}/subscription/renewed?orderId=${order.orderNumber}`,
          cancel_url: `${baseUrl}/subscription/renewal-failed?orderId=${order.orderNumber}`,
          customer_email: order.contactInfo?.email || order.guestEmail,
          purchase_id: order.nowpaymentsPayment?.purchaseId, // Link to same purchase
        });

        if (invoiceResult.success) {
          // Update order with new invoice
          order.nowpaymentsPayment.invoiceId = invoiceResult.data.invoiceId;
          order.nowpaymentsPayment.lastStatusUpdate = new Date();
          order.subscription.status = "past_due"; // Mark as past due until paid

          await order.save();

          results.success++;

          console.log(`✅ Renewal invoice created: ${invoiceResult.data.invoiceUrl}`);

          // TODO: Send email with invoice link to customer
        } else {
          throw new Error("Failed to create renewal invoice");
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          orderId: order._id.toString(),
          error: error.message,
        });
        console.error(`❌ Failed to renew ${order._id}:`, error);

        // Mark subscription as past_due
        order.subscription.status = "past_due";
        await order.save();
      }
    }

    console.log("✅ Cron job completed:", results);

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Cron job error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
