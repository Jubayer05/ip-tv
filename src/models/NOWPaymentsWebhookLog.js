import mongoose from "mongoose";

const NOWPaymentsWebhookLogSchema = new mongoose.Schema(
  {
    // Webhook Identification
    paymentId: {
      type: String,
      required: true,
      index: true,
    },
    invoiceId: {
      type: String,
      index: true,
    },
    orderId: {
      type: String,
      index: true,
    },

    // Webhook Event Type
    eventType: {
      type: String,
      enum: [
        "payment.waiting",
        "payment.confirming",
        "payment.confirmed",
        "payment.finished",
        "payment.failed",
        "payment.expired",
        "payment.refunded",
        "payment.partially_paid",
      ],
      required: true,
    },

    // Webhook Payload
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Signature Verification
    receivedSignature: {
      type: String,
    },
    signatureValid: {
      type: Boolean,
      default: false,
    },

    // Processing Status
    processed: {
      type: Boolean,
      default: false,
    },
    processedAt: {
      type: Date,
    },
    processingError: {
      type: String,
    },

    // Payment Status from Webhook
    paymentStatus: {
      type: String,
    },
    actuallyPaid: {
      type: Number,
    },
    payAmount: {
      type: Number,
    },

    // User Action
    userCredited: {
      type: Boolean,
      default: false,
    },
    creditedAmount: {
      type: Number,
    },

    // Request Details
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },

    // Timestamps
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NOWPaymentsWebhookLogSchema.index({ paymentId: 1, receivedAt: -1 });
NOWPaymentsWebhookLogSchema.index({ processed: 1, receivedAt: -1 });
NOWPaymentsWebhookLogSchema.index({ signatureValid: 1 });

export default mongoose.models.NOWPaymentsWebhookLog ||
  mongoose.model("NOWPaymentsWebhookLog", NOWPaymentsWebhookLogSchema);
