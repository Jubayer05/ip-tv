import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const headersList = await headers();
    const signature = headersList.get("plisio-signature");

    // Verify webhook signature for security
    if (!verifyWebhookSignature(request, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = await request.json();
    const {
      txn_id,
      status,
      order_number,
      source_amount,
      source_currency,
      email,
      invoice_url,
    } = body;

    console.log("Plisio webhook received:", {
      txn_id,
      status,
      order_number,
      source_amount,
      source_currency,
      email,
    });

    // Handle different payment statuses
    switch (status) {
      case "paid":
      case "completed":
        // Payment successful - update order status
        await handleSuccessfulPayment({
          txn_id,
          order_number,
          source_amount,
          source_currency,
          email,
        });
        break;

      case "error":
      case "canceled":
      case "expired":
        // Payment failed - update order status
        await handleFailedPayment({
          txn_id,
          order_number,
          email,
        });
        break;

      case "pending":
        // Payment pending - log for monitoring
        console.log("Payment pending:", txn_id);
        break;

      default:
        console.log("Unknown payment status:", status, txn_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Plisio webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Verify webhook signature for security
function verifyWebhookSignature(request, signature) {
  // TODO: Implement signature verification using Plisio's webhook secret
  // For now, return true in development/sandbox
  if (
    process.env.NODE_ENV === "development" ||
    process.env.PLISIO_SANDBOX === "true"
  ) {
    return true;
  }

  // In production, verify the signature
  // const webhookSecret = process.env.PLISIO_WEBHOOK_SECRET;
  // const payload = await request.text();
  // const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');
  // return signature === expectedSignature;

  return true; // Placeholder - implement proper verification
}

async function handleSuccessfulPayment(paymentData) {
  try {
    // TODO: Update order status in your database
    // TODO: Send confirmation email to customer
    // TODO: Update user subscription status

    console.log("Payment successful:", paymentData);

    // Example database update:
    // await Order.findOneAndUpdate(
    //   { orderNumber: paymentData.order_number },
    //   {
    //     status: 'completed',
    //     paymentId: paymentData.txn_id,
    //     completedAt: new Date()
    //   }
    // );
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

async function handleFailedPayment(paymentData) {
  try {
    // TODO: Update order status in your database
    // TODO: Send failure notification to customer

    console.log("Payment failed:", paymentData);

    // Example database update:
    // await Order.findOneAndUpdate(
    //   { orderNumber: paymentData.order_number },
    //   {
    //     status: 'failed',
    //     paymentId: paymentData.txn_id,
    //     failedAt: new Date()
    //   }
    // );
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}
