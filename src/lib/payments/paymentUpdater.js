// src/lib/payments/paymentUpdater.js
import Order from "@/models/Order";
import Settings from "@/models/Settings";
import User from "@/models/User";

// Default mapping you can override per-gateway if needed
const DEFAULT_STATUS_MAP = {
  completed: { paymentStatus: "completed", orderStatus: "completed" },
  pending: { paymentStatus: "pending", orderStatus: "pending" },
  new: { paymentStatus: "pending", orderStatus: "new" },
  error: { paymentStatus: "failed", orderStatus: "cancelled" },
  cancelled: { paymentStatus: "failed", orderStatus: "cancelled" },
  expired: { paymentStatus: "failed", orderStatus: "cancelled" },
};

function deriveStatuses(rawStatus, statusMap = DEFAULT_STATUS_MAP) {
  const lower = String(rawStatus || "").toLowerCase();
  return (
    statusMap[lower] || { paymentStatus: "pending", orderStatus: "pending" }
  );
}

async function maybeAwardReferralOnFirstCompleted(order) {
  try {
    // Hydrate missing referral info if needed
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

    // Award commission if first order and referredBy present
    if (order.isFirstOrder && order.referredBy) {
      const settings = await Settings.getSettings();
      const commissionPct = Number(settings.affiliateCommissionPct || 10);
      const commission =
        Math.round(
          ((Number(order.totalAmount || 0) * commissionPct) / 100) * 100
        ) / 100;

      if (commission > 0) {
        const referrer = await User.findById(order.referredBy);
        if (referrer) {
          // Reporting/stat
          referrer.referral.earnings =
            Number(referrer.referral.earnings || 0) + commission;
          // Wallet balance credit
          referrer.balance = Number(referrer.balance || 0) + commission;
          await referrer.save();
        }
      }
    }
  } catch (e) {
    console.error("Referral award error:", e);
  }
}

/**
 * Centralized payment update for any gateway.
 *
 * @param {Object} params
 * @param {Order} params.order - Mongoose Order doc (already loaded)
 * @param {String} params.gatewayKey - e.g. "plisioPayment" or "stripePayment"
 * @param {String} params.rawStatus - raw gateway status (e.g. "completed")
 * @param {Object} [params.gatewayFields] - fields to merge into order[gatewayKey]
 * @param {Object} [params.statusMap] - optional custom mapping from raw status to {paymentStatus, orderStatus}
 * @param {Function} [params.onCompleted] - optional callback when status transitions into completed
 * @param {Function} [params.onFailed] - optional callback when status transitions into failed
 */
export async function applyPaymentUpdate({
  order,
  gatewayKey,
  rawStatus,
  gatewayFields = {},
  statusMap = DEFAULT_STATUS_MAP,
  onCompleted,
  onFailed,
}) {
  if (!order) throw new Error("order is required");
  if (!gatewayKey) throw new Error("gatewayKey is required");

  if (!order[gatewayKey]) {
    order[gatewayKey] = {};
  }

  // Merge gateway-specific details
  Object.assign(order[gatewayKey], {
    ...gatewayFields,
    status: rawStatus,
    lastStatusUpdate: new Date(),
  });

  // Compute normalized statuses
  const prevPaymentStatus = order.paymentStatus;
  const { paymentStatus, orderStatus } = deriveStatuses(rawStatus, statusMap);

  order.paymentStatus = paymentStatus;
  order.status = orderStatus || order.status;

  await order.save();

  // Handle transitions/side-effects
  if (prevPaymentStatus !== "completed" && paymentStatus === "completed") {
    await maybeAwardReferralOnFirstCompleted(order);
    if (typeof onCompleted === "function") {
      await onCompleted({ order });
    }
  }

  if (
    prevPaymentStatus !== "failed" &&
    paymentStatus === "failed" &&
    typeof onFailed === "function"
  ) {
    await onFailed({ order });
  }

  return order;
}
