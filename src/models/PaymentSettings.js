import mongoose from "mongoose";

const PaymentSettingsSchema = new mongoose.Schema(
  {
    gateway: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "stripe",
        "plisio",
        "hoodpay",
        "nowpayment",
        "changenow",
        "cryptomus",
        "paygate",
      ],
    },
    name: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    apiKey: {
      type: String,
      required: true,
    },
    apiSecret: {
      type: String,
      required: false,
    },
    merchantId: {
      type: String,
      default: "",
    },
    minAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    // Added bonus settings array
    bonusSettings: [
      {
        minAmount: {
          type: Number,
          required: true,
        },
        bonusPercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    // Added fee settings
    feeSettings: {
      isActive: {
        type: Boolean,
        default: false,
      },
      feePercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      feeType: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "percentage",
      },
      fixedAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    description: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
PaymentSettingsSchema.index({ gateway: 1, isActive: 1 });

export default mongoose.models.PaymentSettings ||
  mongoose.model("PaymentSettings", PaymentSettingsSchema);
