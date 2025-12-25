import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema(
  {
    signature: String,
    body: mongoose.Schema.Types.Mixed,
    headers: mongoose.Schema.Types.Mixed,

    processed: {
      type: Boolean,
      default: false,
      // index: true,
    },

    processingError: String,

    paymentId: {
      type: String,
      // index: true,
    },
    orderId: String,

    gateway: {
      type: String,
      default: "NOWPayments",
      // index: true,
    },
  },
  { timestamps: true }
);

// Indexes for performance
webhookLogSchema.index({ createdAt: -1 });
webhookLogSchema.index({ processed: 1 });
webhookLogSchema.index({ paymentId: 1 });
webhookLogSchema.index({ gateway: 1, createdAt: -1 });

const WebhookLog =
  mongoose.models.WebhookLog || mongoose.model("WebhookLog", webhookLogSchema);

export default WebhookLog;
