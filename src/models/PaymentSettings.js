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
        "volet",
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
          "volet",
        ].includes(this.gateway);
      },
    },
    apiSecret: {
      type: String,
      required: function () {
        return this.gateway === "nowpayment";
      },
    },
    ipnSecret: {
      type: String, // NOWPayments IPN secret for webhook verification
    },
    webhookSecret: {
      type: String, // HoodPay/other gateways webhook secret for HMAC verification
    },
    allowedIps: {
      type: [String], // IP whitelist for webhook security
      default: [],
    },
    businessId: {
      type: String, // HoodPay Business ID
      required: function () {
        return this.gateway === "hoodpay";
      },
    },
    sandboxMode: {
      type: Boolean,
      default: false,
    },
    fiatApiKey: {
      type: String, // For ChangeNOW fiat transactions
    },
    externalPartnerLinkId: {
      type: String, // For ChangeNOW partner tracking
    },
    merchantId: {
      type: String,
      required: function () {
        return ["hoodpay", "changenow", "cryptomus", "paygate", "volet"].includes(
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
    
    // ===================================
    // PayGate Provider Configuration
    // ===================================
    paygateProviders: [
      {
        code: {
          type: String,
          required: true,
          // e.g., 'card-multi', 'card-wert', 'card-stripe', etc.
        },
        name: {
          type: String,
          required: true,
          // Display name that admin can customize
        },
        description: {
          type: String,
          default: '',
        },
        minAmount: {
          type: Number,
          required: true,
          min: 0,
        },
        maxAmount: {
          type: Number,
          default: null,
        },
        icon: {
          type: String,
          default: '💳',
        },
        type: {
          type: String,
          enum: ['card', 'bank', 'crypto'],
          required: true,
        },
        provider: {
          type: String,
          required: true,
          // The actual provider code for PayGate API: auto, wert, stripe, etc.
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        sortOrder: {
          type: Number,
          default: 0,
        },
        supportedRegions: [
          {
            type: String,
            // e.g., ['GLOBAL', 'US', 'EU', 'UK']
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // ===================================
    
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
PaymentSettingsSchema.index({ 'paygateProviders.code': 1 }); // Index for provider lookups

export default mongoose.models.PaymentSettings ||
  mongoose.model("PaymentSettings", PaymentSettingsSchema);
