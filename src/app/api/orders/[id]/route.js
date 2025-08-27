import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Settings from "@/models/Settings";
import User from "@/models/User";
import { NextResponse } from "next/server";

// PATCH /api/orders/[id] - update order fields (paymentStatus) and handle referral commission
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params || {};
    if (!id) {
      return NextResponse.json(
        { error: "Order id is required" },
        { status: 400 }
      );
    }

    console.log("=== ORDER UPDATE START ===");
    console.log("Order ID:", id);

    const body = await request.json();
    const nextPaymentStatus = body?.paymentStatus;
    console.log("Request body:", body);
    console.log("Next payment status:", nextPaymentStatus);

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("Current order data:", {
      id: order._id,
      userId: order.userId,
      paymentStatus: order.paymentStatus,
      referredBy: order.referredBy,
      isFirstOrder: order.isFirstOrder,
      totalAmount: order.totalAmount,
    });

    const prevPaymentStatus = order.paymentStatus;
    if (nextPaymentStatus) {
      order.paymentStatus = nextPaymentStatus;
    }

    await order.save();
    console.log("Order updated and saved");

    // If transitioning to completed, ensure referral fields exist and credit referrer
    if (
      prevPaymentStatus !== "completed" &&
      order.paymentStatus === "completed"
    ) {
      console.log("=== ORDER COMPLETION DETECTED ===");

      // Fallback: enrich order if missing referral flags
      if (order.userId && !order.referredBy) {
        console.log("=== FALLBACK: ENRICHING MISSING REFERRAL DATA ===");
        const buyer = await User.findById(order.userId);
        console.log("Buyer found:", buyer ? "yes" : "no");
        if (buyer?.referral?.referredBy) {
          console.log("Buyer has referral:", buyer.referral.referredBy);
          const completedCount = await Order.countDocuments({
            userId: order.userId,
            paymentStatus: "completed",
          });
          console.log("Completed orders count:", completedCount);
          if (completedCount === 1) {
            order.referredBy = buyer.referral.referredBy;
            order.isFirstOrder = true;
            await order.save();
            console.log("Order enriched with referral data");
          }
        }
      }

      if (order.isFirstOrder && order.referredBy) {
        console.log("=== PROCESSING REFERRAL COMMISSION ON COMPLETION ===");
        try {
          const settings = await Settings.getSettings();
          const commissionPct = Number(settings.affiliateCommissionPct || 10);
          const commission =
            Math.round(
              ((Number(order.totalAmount || 0) * commissionPct) / 100) * 100
            ) / 100;

          console.log("Commission calculation:", {
            totalAmount: order.totalAmount,
            percentage: commissionPct,
            commission: commission,
          });

          if (commission > 0) {
            const referrer = await User.findById(order.referredBy);
            console.log("Referrer found:", referrer ? "yes" : "no");

            if (referrer) {
              console.log("Referrer current data:", {
                id: referrer._id,
                currentEarnings: referrer.referral?.earnings || 0,
                currentBalance: referrer.balance || 0,
              });

              // Update earnings for reporting
              referrer.referral.earnings =
                Number(referrer.referral.earnings || 0) + commission;
              await referrer.save();

              console.log(
                "Referrer earnings updated to:",
                referrer.referral.earnings
              );

              // Call balance API so the endpoint is visibly hit
              const origin = new URL(request.url).origin;
              console.log(
                "Calling balance API:",
                `${origin}/api/users/${referrer._id}/balance`
              );

              const balanceResponse = await fetch(
                `${origin}/api/users/${referrer._id}/balance`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ amountToAdd: commission }),
                }
              );

              console.log(
                "Balance API response status:",
                balanceResponse.status
              );
              const balanceData = await balanceResponse.json();
              console.log("Balance API response:", balanceData);

              // Also update balance directly as backup
              referrer.balance = Number(referrer.balance || 0) + commission;
              await referrer.save();
              console.log("Referrer balance updated to:", referrer.balance);
            }
          }
        } catch (commissionError) {
          console.error(
            "Error processing referral commission:",
            commissionError
          );
        }
      } else {
        console.log(
          "Order does not qualify for referral commission on completion"
        );
      }
    }

    console.log("=== ORDER UPDATE COMPLETE ===");
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
