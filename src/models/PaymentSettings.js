import mongoose from "mongoose";

const PaymentSettingsSchema = new mongoose.Schema(
  {
    gateway: {
      type: String,
      required: true,
      unique: true,
      enum: [
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
      required: function () {
        return [
          "plisio",
          "hoodpay",
          "nowpayment",
          "changenow",
          "cryptomus",
        ].includes(this.gateway);
      },
    },
    apiSecret: {
      type: String,
      required: function () {
        return this.gateway === "nowpayment";
      },
    },
    merchantId: {
      type: String,
      required: function () {
        return ["hoodpay", "changenow", "cryptomus", "paygate"].includes(
          this.gateway
        );
      },
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
    // Add imageUrl field for custom uploaded images
    imageUrl: {
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
