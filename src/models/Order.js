import mongoose from "mongoose";

const OrderProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }, // per-line price (pre-discount)
    duration: { type: Number, default: 0, min: 0 }, // months
    devicesAllowed: { type: Number, required: true, min: 1 },
    adultChannels: { type: Boolean, default: false },
  },
  { _id: false }
);

const OrderKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const ContactInfoSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

// Add Plisio payment tracking schema
const PlisioPaymentSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, required: true, index: true }, // Plisio transaction ID
    status: {
      type: String,
      enum: ["new", "pending", "completed", "error", "cancelled", "expired"],
      default: "new",
    },
    amount: { type: String, required: true }, // Crypto amount
    currency: { type: String, required: true }, // Crypto currency (BTC, ETH, etc.)
    sourceAmount: { type: String, required: true }, // Original fiat amount
    sourceCurrency: { type: String, default: "USD" }, // Original fiat currency
    walletAddress: { type: String, required: true },
    confirmations: { type: Number, default: 0 },
    actualSum: { type: String, default: "0.00000000" },
    expiresAt: { type: Date, required: true },
    callbackReceived: { type: Boolean, default: false },
    lastStatusUpdate: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StripePaymentSchema = new mongoose.Schema(
  {
    sessionId: { type: String, index: true },
    paymentIntentId: { type: String, index: true },
    status: {
      type: String,
      enum: [
        "new",
        "pending",
        "completed",
        "failed",
        "cancelled",
        "requires_action",
        "processing",
      ],
      default: "new",
    },
    amount: { type: Number, default: 0 }, // fiat in minor units? you can store cents or dollars; choose one consistently
    currency: { type: String, default: "usd" },
    receiptUrl: { type: String, default: "" },
    callbackReceived: { type: Boolean, default: false },
    lastStatusUpdate: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Add this schema near the PlisioPaymentSchema
const HoodPayPaymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, index: true }, // Remove required: true
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "canceled", "expired"],
      default: "pending",
    },
    amount: { type: Number, default: 0 }, // Remove required: true
    currency: { type: String, default: "USD" }, // Remove required: true
    customerEmail: { type: String, default: "" },
    description: { type: String, default: "" },
    paymentUrl: { type: String }, // Remove required: true
    callbackReceived: { type: Boolean, default: false },
    lastStatusUpdate: { type: Date, default: Date.now },
    metadata: { type: Object, default: {} }, // Add metadata field
  },
  { _id: false }
);

// Add this schema near the other payment schemas
const NOWPaymentsSchema = new mongoose.Schema(
  {
    paymentId: { type: String, index: true },
    orderId: { type: String, index: true },
    status: {
      type: String,
      enum: [
        "waiting",
        "confirming",
        "confirmed",
        "finished",
        "failed",
        "expired",
        "refunded",
        "partially_paid",
      ],
      default: "waiting",
    },
    priceAmount: { type: Number, required: true },
    priceCurrency: { type: String, required: true },
    payAmount: { type: Number, default: 0 },
    payCurrency: { type: String, default: "" },
    paymentUrl: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    orderDescription: { type: String, default: "" },
    callbackReceived: { type: Boolean, default: false },
    lastStatusUpdate: { type: Date, default: Date.now },
    metadata: { type: Object, default: {} },
  },
  { _id: false }
);

const ChangeNOWPaymentSchema = new mongoose.Schema(
  {
    transactionId: { type: String, index: true },
    payinAddress: { type: String, required: true },
    payoutAddress: { type: String, required: true },
    fromCurrency: { type: String, required: true },
    toCurrency: { type: String, required: true },
    fromAmount: { type: Number, required: true },
    toAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "new",
        "waiting",
        "confirming",
        "exchanging",
        "sending",
        "finished",
        "failed",
        "refunded",
        "expired",
        "hold",
      ],
      default: "new",
    },
    payinExtraId: { type: String, default: "" },
    refundAddress: { type: String, default: "" },
    refundExtraId: { type: String, default: "" },
    userId: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    flow: { type: String, default: "standard" },
    callbackReceived: { type: Boolean, default: false },
    lastStatusUpdate: { type: Date, default: Date.now },
    metadata: { type: Object, default: {} },
  },
  { _id: false }
);

// Add Cryptomus payment schema
const CryptomusPaymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, index: true },
    orderId: { type: String, required: true },
    amount: { type: String, required: true },
    currency: { type: String, required: true },
    toCurrency: { type: String },
    toAmount: { type: String },
    address: { type: String },
    network: { type: String },
    from: { type: String },
    status: { type: String, required: true },
    isFinal: { type: Boolean, default: false },
    additionalData: { type: String },
    currencies: [{ type: String }],
    createdAt: { type: String },
    updatedAt: { type: String },
    expiredAt: { type: String },
    isTest: { type: Boolean, default: false },
    paymentMethod: { type: String },
    paymentStatus: { type: String },
    transactions: [{ type: mongoose.Schema.Types.Mixed }],
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    guestEmail: { type: String, default: null },

    products: { type: [OrderProductSchema], required: true },

    totalAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: "" },

    paymentMethod: { type: String, default: "Manual" },
    paymentGateway: { type: String, default: "None" },
    paymentStatus: {
      type: String,
      default: "pending",
    },

    // Add Plisio payment tracking
    plisioPayment: { type: PlisioPaymentSchema, default: null },
    stripePayment: { type: StripePaymentSchema, default: null },
    hoodpayPayment: { type: HoodPayPaymentSchema, default: null },
    nowpaymentsPayment: { type: NOWPaymentsSchema, default: null },
    changenowPayment: { type: ChangeNOWPaymentSchema, default: null },
    cryptomusPayment: { type: CryptomusPaymentSchema, default: null }, // Add this line

    keys: { type: [OrderKeySchema], default: [] },

    contactInfo: { type: ContactInfoSchema, required: true },

    status: {
      type: String,
      enum: ["new", "pending", "completed", "cancelled"],
      default: "new",
    },

    // Add referral tracking
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isFirstOrder: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Generate unique order number if missing
OrderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).toUpperCase().slice(2, 8);
    this.orderNumber = `CS-${y}${m}${d}-${rand}`;
  }
  next();
});

// Force recompilation to ensure new fields are recognized
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

const Order = mongoose.model("Order", OrderSchema);
export default Order;
