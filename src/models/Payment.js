import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Amount details
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },

    // NOWPayments specific
    purchaseId: String,
    invoiceId: String,

    // Status
    status: {
      type: String,
      enum: [
        "waiting",
        "confirming",
        "confirmed",
        "finished",
        "partially_paid",
        "refunded",
        "failed",
        "expired",
      ],
      default: "waiting",
    },

    // Tracking
    gateway: {
      type: String,
      default: "NOWPayments",
    },

    // Raw data from gateway
    rawPayload: mongoose.Schema.Types.Mixed,

    // Timestamps
    paidAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

// Indexes for performance
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;
