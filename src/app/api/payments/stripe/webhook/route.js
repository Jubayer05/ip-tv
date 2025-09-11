import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import stripeService from "@/lib/paymentServices/stripeService";
import Order from "@/models/Order";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure edge is not used (Stripe needs raw body)
export const dynamic = "force-dynamic";

export async function POST(request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not configured" },
      { status: 500 }
    );
  }

  let event;
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");
    event = stripeService.constructWebhookEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const purpose = session?.metadata?.purpose;

        if (purpose === "deposit") {
          // Handle deposit completion
          const deposit = await WalletDeposit.findOne({
            "stripePayment.sessionId": session.id,
          });

          if (deposit) {
            deposit.status = "completed";
            deposit.stripePayment.status = "completed";
            deposit.stripePayment.callbackReceived = true;
            await deposit.save();

            // Credit user balance
            const user = await User.findById(deposit.userId);
            if (user) {
              user.balance = Number(user.balance || 0) + Number(deposit.amount);
              await user.save();
            }
          }
        } else {
          // Find order via session id or provided orderNumber
          const providedOrderNumber =
            session?.metadata?.providedOrderNumber || "";
          let order =
            (providedOrderNumber &&
              (await Order.findOne({ orderNumber: providedOrderNumber }))) ||
            (await Order.findOne({
              $or: [
                { "stripePayment.sessionId": session.id },
                { orderNumber: session.id },
              ],
            }));

          if (!order) {
            console.warn("Order not found for completed session:", session.id);
            return NextResponse.json({ received: true });
          }

          const userIdMeta =
            session?.metadata?.userId || order.userId?.toString() || "";

          await applyPaymentUpdate({
            order,
            gatewayKey: "stripePayment",
            rawStatus: "completed",
            gatewayFields: {
              paymentIntentId:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : null,
              status: "completed",
              callbackReceived: true,
            },
            onCompleted: async ({ order }) => {
              if (purpose === "deposit") {
                // Credit user balance with order.totalAmount
                const userId = userIdMeta || order.userId?.toString();
                if (userId) {
                  const user = await User.findById(userId);
                  if (user) {
                    user.balance =
                      Number(user.balance || 0) +
                      Number(order.totalAmount || 0);
                    await user.save();
                  }
                }
              }
            },
          });
        }
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const order = await Order.findOne({
          "stripePayment.paymentIntentId": pi.id,
        });
        if (order) {
          await applyPaymentUpdate({
            order,
            gatewayKey: "stripePayment",
            rawStatus: "completed",
            gatewayFields: {
              paymentIntentId: pi.id,
              status: "completed",
              callbackReceived: true,
            },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        const order = await Order.findOne({
          "stripePayment.paymentIntentId": pi.id,
        });
        if (order) {
          await applyPaymentUpdate({
            order,
            gatewayKey: "stripePayment",
            rawStatus: "failed",
            gatewayFields: {
              paymentIntentId: pi.id,
              status: "failed",
              callbackReceived: true,
            },
          });
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const order = await Order.findOne({
          $or: [
            { "stripePayment.sessionId": session.id },
            { orderNumber: session.id },
          ],
        });
        if (order) {
          await applyPaymentUpdate({
            order,
            gatewayKey: "stripePayment",
            rawStatus: "cancelled",
            gatewayFields: { status: "cancelled", callbackReceived: true },
          });
        }
        break;
      }

      default:
        // No-op for unhandled events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Stripe webhook endpoint" });
}
