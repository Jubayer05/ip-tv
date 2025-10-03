import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Settings from "@/models/Settings";
import User from "@/models/User";
import { NextResponse } from "next/server";

// PATCH /api/orders/[id] - update order fields (paymentStatus) and handle referral commission
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = (await params) || {};
    if (!id) {
      return NextResponse.json(
        { error: "Order id is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const nextPaymentStatus = body?.paymentStatus;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const prevPaymentStatus = order.paymentStatus;
    if (nextPaymentStatus) {
      order.paymentStatus = nextPaymentStatus;
    }

    await order.save();

    // If transitioning to completed, ensure referral fields exist and credit referrer
    if (
      prevPaymentStatus !== "completed" &&
      order.paymentStatus === "completed"
    ) {
      // Fallback: enrich order if missing referral flags
      if (order.userId && !order.referredBy) {
        const buyer = await User.findById(order.userId);
        if (buyer?.referral?.referredBy) {
          const completedCount = await Order.countDocuments({
            userId: order.userId,
            paymentStatus: "completed",
          });
          if (completedCount === 1) {
            order.referredBy = buyer.referral.referredBy;
            order.isFirstOrder = true;
            await order.save();
          }
        }
      }

      if (order.isFirstOrder && order.referredBy) {
        try {
          const settings = await Settings.getSettings();
          const commissionPct = Number(settings.affiliateCommissionPct || 10);
          const commission =
            Math.round(
              ((Number(order.totalAmount || 0) * commissionPct) / 100) * 100
            ) / 100;

          if (commission > 0) {
            const referrer = await User.findById(order.referredBy);

            if (referrer) {
              // Update earnings for reporting
              referrer.referral.earnings =
                Number(referrer.referral.earnings || 0) + commission;
              await referrer.save();

              // Call balance API so the endpoint is visibly hit
              const origin = new URL(request.url).origin;

              const balanceResponse = await fetch(
                `${origin}/api/users/${referrer._id}/balance`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ amountToAdd: commission }),
                }
              );

              const balanceData = await balanceResponse.json();

              // Also update balance directly as backup
              referrer.balance = Number(referrer.balance || 0) + commission;
              await referrer.save();
            }
          }
        } catch (commissionError) {
          console.error(
            "Error processing referral commission:",
            commissionError
          );
        }
      } else {
      }
    }

    return NextResponse.json({
      success: true,
      order,
      message: "Order updated successfully",
    });
  } catch (e) {
    console.error("Order update error:", e);
    return NextResponse.json(
      { error: "Failed to update order", details: e.message },
      { status: 500 }
    );
  }
}
