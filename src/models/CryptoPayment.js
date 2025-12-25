import mongoose from "mongoose";

const CryptoPaymentSchema = new mongoose.Schema(
  {
    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userEmail: {
      type: String,
      required: true,
    },

    // Payment Gateway
    gateway: {
      type: String,
      enum: ["nowpayments"],
      default: "nowpayments",
      required: true,
    },

    // NOWPayments Invoice Details
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      index: true,
    },
    purchaseId: {
      type: String,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },

    // Amount Details
    priceAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    priceCurrency: {
      type: String,
      required: true,
      uppercase: true,
      default: "USD",
    },
    payAmount: {
      type: Number,
      default: 0,
    },
    payCurrency: {
      type: String,
      uppercase: true,
    },
    actuallyPaid: {
      type: Number,
      default: 0,
    },

    // Payment Status
    paymentStatus: {
      type: String,
      enum: [
        "waiting",
        "confirming",
        "confirmed",
        "sending",
        "partially_paid",
        "finished",
        "failed",
        "refunded",
        "expired",
      ],
      default: "waiting",
      index: true,
    },

    // Internal Status
    internalStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
      index: true,
    },

    // Payment URLs
    invoiceUrl: {
      type: String,
    },
    payAddress: {
      type: String,
    },

    // Webhook Processing
    webhookReceived: {
      type: Boolean,
      default: false,
    },
    webhookReceivedAt: {
      type: Date,
    },
    webhookCount: {
      type: Number,
      default: 0,
    },

    // User Credited
    userCredited: {
      type: Boolean,
      default: false,
    },
    creditedAt: {
      type: Date,
    },
    creditedAmount: {
      type: Number,
      default: 0,
    },

    // Additional Details
    orderDescription: {
      type: String,
    },
    networkFee: {
      type: Number,
      default: 0,
    },
    expirationEstimateDate: {
      type: Date,
    },

    // Metadata
    metadata: {
      type: Map,
      of: String,
      default: {},
    },

    // Error Handling
    lastError: {
      type: String,
    },
    errorCount: {
      type: Number,
      default: 0,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
CryptoPaymentSchema.index({ userId: 1, createdAt: -1 });
CryptoPaymentSchema.index({ paymentStatus: 1, createdAt: -1 });
CryptoPaymentSchema.index({ internalStatus: 1, userCredited: 1 });

// Methods
CryptoPaymentSchema.methods.markAsCompleted = async function () {
  this.internalStatus = "completed";
  this.completedAt = new Date();
  await this.save();
};

CryptoPaymentSchema.methods.markAsFailed = async function (error) {
  this.internalStatus = "failed";
  this.lastError = error;
  this.errorCount += 1;
  await this.save();
};

CryptoPaymentSchema.methods.creditUser = async function (amount) {
  if (this.userCredited) {
    throw new Error("User already credited for this payment");
  }

  this.userCredited = true;
  this.creditedAt = new Date();
  this.creditedAmount = amount;
  await this.save();
};

export default mongoose.models.CryptoPayment ||
  mongoose.model("CryptoPayment", CryptoPaymentSchema);
