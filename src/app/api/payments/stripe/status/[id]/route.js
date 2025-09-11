import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import stripeService from "@/lib/paymentServices/stripeService";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const session = await stripeService.retrieveSession(id);

    // Map Stripe status to our normalized status
    // session.status can be: open, complete. payment_status can be: paid, unpaid, no_payment_required
    let rawStatus = "pending";
    if (session.status === "complete" && session.payment_status === "paid") {
      rawStatus = "completed";
    } else if (session.status === "open") {
      rawStatus = "pending";
    }

    const order = await Order.findOne({
      $or: [{ "stripePayment.sessionId": id }, { orderNumber: id }],
    });

    if (order) {
      await applyPaymentUpdate({
        order,
        gatewayKey: "stripePayment",
        rawStatus,
        gatewayFields: {
          paymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      sessionId: id,
      status: rawStatus,
      stripeStatus: session.status,
      stripePaymentStatus: session.payment_status,
      orderUpdated: !!order,
      orderId: order?._id,
      orderNumber: order?.orderNumber,
    });
  } catch (error) {
    console.error("Stripe status error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve Stripe status" },
      { status: 500 }
    );
  }
}
