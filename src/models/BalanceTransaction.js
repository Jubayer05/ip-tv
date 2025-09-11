import mongoose from "mongoose";

const BalanceTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "deposit",
        "withdrawal",
        "admin_add",
        "admin_deduct",
        "purchase",
        "refund",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    currency: {
      type: String,
      default: "USD",
    },
    description: {
      type: String,
      required: true,
    },
    previousBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    newBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for system transactions
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null, // null for non-order transactions
    },
    depositId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletDeposit",
      default: null, // null for non-deposit transactions
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
BalanceTransactionSchema.index({ userId: 1, createdAt: -1 });
BalanceTransactionSchema.index({ type: 1, createdAt: -1 });
BalanceTransactionSchema.index({ status: 1 });

// Virtual for transaction display name
BalanceTransactionSchema.virtual("displayName").get(function () {
  const typeMap = {
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    admin_add: "Admin Credit",
    admin_deduct: "Admin Debit",
    purchase: "Purchase",
    refund: "Refund",
  };
  return typeMap[this.type] || this.type;
});

// Virtual for amount with sign
BalanceTransactionSchema.virtual("signedAmount").get(function () {
  const creditTypes = ["deposit", "admin_add", "refund"];
  return creditTypes.includes(this.type) ? this.amount : -this.amount;
});

// Static method to get user balance history
BalanceTransactionSchema.statics.getUserHistory = function (
  userId,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;

  return this.find({ userId })
    .populate("adminId", "profile.firstName profile.lastName email")
    .populate("orderId", "orderNumber totalAmount")
    .populate("depositId", "depositId amount currency")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get user balance summary
BalanceTransactionSchema.statics.getUserSummary = function (userId) {
  // Validate userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return Promise.resolve([]);
  }

  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalDeposits: {
          $sum: {
            $cond: [
              { $in: ["$type", ["deposit", "admin_add", "refund"]] },
              "$amount",
              0,
            ],
          },
        },
        totalWithdrawals: {
          $sum: {
            $cond: [
              { $in: ["$type", ["withdrawal", "admin_deduct", "purchase"]] },
              "$amount",
              0,
            ],
          },
        },
        transactionCount: { $sum: 1 },
        lastTransaction: { $max: "$createdAt" },
      },
    },
  ]);
};

const BalanceTransaction =
  mongoose.models.BalanceTransaction ||
  mongoose.model("BalanceTransaction", BalanceTransactionSchema);

export default BalanceTransaction;
