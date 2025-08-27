import mongoose from "mongoose";

const withdrawalRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "BTC", "ETH", "USDT", "BNB"],
      default: "USD",
    },
    walletAddress: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      required: false, // Make it optional
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
withdrawalRequestSchema.index({ userId: 1, status: 1 });
withdrawalRequestSchema.index({ status: 1, createdAt: 1 });

const WithdrawalRequest =
  mongoose.models.WithdrawalRequest ||
  mongoose.model("WithdrawalRequest", withdrawalRequestSchema);

export default WithdrawalRequest;
