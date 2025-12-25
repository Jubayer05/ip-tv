import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import cryptomusService from "@/lib/paymentServices/cryptomusService";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import { getServerApiKeys } from "@/lib/serverApiKeys";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

// Verify webhook signature from Cryptomus
function verifyWebhookSignature(body, signature, apiKey) {
  if (!signature || !apiKey) {
    return false;
  }

  try {
    // Cryptomus sends the signature in the 'sign' header
    // The signature is: md5(base64(body) + apiKey)
    const dataString = JSON.stringify(body);
    const expectedSignature = crypto
      .createHash("md5")
      .update(Buffer.from(dataString).toString("base64") + apiKey)
      .digest("hex");

    return signature === expectedSignature;
  } catch (error) {
    console.error("Cryptomus signature verification error:", error);
    return false;
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    // Get API keys for signature verification
    const apiKeys = await getServerApiKeys();
    const cryptomusApiKey = apiKeys?.cryptomus?.apiKey;

    // Clone the request to read the body (can only be read once)
    const clonedRequest = request.clone();
    const body = await clonedRequest.json();
    const { order_id, status, payment_status, uuid } = body;

    // Get the signature from headers
    const signature = request.headers.get("sign");

    // Verify webhook signature if API key is configured
    if (cryptomusApiKey) {
      if (!verifyWebhookSignature(body, signature, cryptomusApiKey)) {
        console.error("Cryptomus webhook signature verification failed");
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    } else {
      console.warn("Cryptomus API key not configured - skipping signature verification");
    }

    if (!order_id || !uuid) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findOne({
      "cryptomusPayment.paymentId": uuid,
    });

    if (!order) {
      console.error("Order not found for Cryptomus webhook:", {
        order_id,
        uuid,
      });
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Map Cryptomus status to our payment status
    const paymentStatus = cryptomusService.mapStatusToPaymentStatus(status);
    const orderStatus = paymentStatus === "completed" ? "completed" : "pending";

    // Update order with webhook data
    order.paymentStatus = paymentStatus;
    order.orderStatus = orderStatus;
    order.cryptomusPayment.status = status;
    order.cryptomusPayment.paymentStatus = payment_status;
    order.cryptomusPayment.updatedAt = new Date().toISOString();

    await order.save();

    // Apply payment update logic (affiliate commissions, etc.)
    if (paymentStatus === "completed") {
      await applyPaymentUpdate({
        orderId: order._id,
        userId: order.userId,
        amount: order.amount,
        currency: order.currency,
        paymentMethod: "cryptomus",
        paymentId: uuid,
        metadata: order.metadata,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cryptomus webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
