import mongoose from "mongoose";

const WalletDepositSchema = new mongoose.Schema(
  {
    depositId: {
      type: String,
      unique: true,
      index: true,
      required: false, // Changed from true to false since it's auto-generated
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled", "expired"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentGateway: {
      type: String,
      required: true,
    },

    // Gateway-specific payment data - all optional
    stripePayment: {
      sessionId: { type: String, index: true },
      paymentIntentId: { type: String, index: true },
      status: { type: String, default: "new" },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "usd" },
      callbackReceived: { type: Boolean, default: false },
      lastStatusUpdate: { type: Date, default: Date.now },
    },

    hoodpayPayment: {
      paymentId: { type: String, index: true },
      status: { type: String, default: "pending" },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      paymentUrl: { type: String },
      callbackReceived: { type: Boolean, default: false },
      lastStatusUpdate: { type: Date, default: Date.now },
    },

    nowpaymentsPayment: {
      paymentId: { type: String, index: true },
      orderId: { type: String, index: true },
      status: { type: String, default: "waiting" },
      priceAmount: { type: Number, default: 0 },
      priceCurrency: { type: String, default: "USD" },
      payAmount: { type: Number, default: 0 },
      payCurrency: { type: String, default: "" },
      paymentUrl: { type: String, default: "" },
      callbackReceived: { type: Boolean, default: false },
      lastStatusUpdate: { type: Date, default: Date.now },
    },

    plisioPayment: {
      invoiceId: { type: String, index: true },
      status: { type: String, default: "new" },
      amount: { type: String, default: "0" },
      currency: { type: String, default: "BTC" },
      sourceAmount: { type: String, default: "0" },
      sourceCurrency: { type: String, default: "USD" },
      walletAddress: { type: String, default: "" },
      confirmations: { type: Number, default: 0 },
      actualSum: { type: String, default: "0.00000000" },
      expiresAt: { type: Date, default: Date.now },
      callbackReceived: { type: Boolean, default: false },
      lastStatusUpdate: { type: Date, default: Date.now },
    },

    cryptomusPayment: {
      paymentId: { type: String, index: true },
      orderId: { type: String, default: "" },
      amount: { type: String, default: "0" },
      currency: { type: String, default: "USD" },
      toCurrency: { type: String, default: "" },
      toAmount: { type: String, default: "" },
      address: { type: String, default: "" },
      network: { type: String, default: "" },
      status: { type: String, default: "new" },
      callbackReceived: { type: Boolean, default: false },
      lastStatusUpdate: { type: Date, default: Date.now },
    },

    changenowPayment: {
      transactionId: { type: String, index: true },
      payinAddress: { type: String, default: "" },
      payoutAddress: { type: String, default: "" },
      fromCurrency: { type: String, default: "" },
      toCurrency: { type: String, default: "" },
      fromAmount: { type: Number, default: 0 },
      toAmount: { type: Number, default: 0 },
      status: { type: String, default: "new" },
      callbackReceived: { type: Boolean, default: false },
      lastStatusUpdate: { type: Date, default: Date.now },
    },

    paygatePayment: {
      paymentId: { type: String, index: true },
      status: { type: String, default: "pending" },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      customerEmail: { type: String, default: "" },
      description: { type: String, default: "" },
      paymentUrl: { type: String },
      provider: { type: String, default: "moonpay" },
      walletData: {
        address_in: { type: String },
        polygon_address_in: { type: String },
        callback_url: { type: String },
        ipn_token: { type: String },
      },
      paymentData: {
        value_coin: { type: String },
        coin: { type: String },
        txid_in: { type: String },
        txid_out: { type: String },
        address_in: { type: String },
      },
      callbackReceived: { type: Boolean, default: false },
      lastStatusUpdate: { type: Date, default: Date.now },
      metadata: { type: Object, default: {} },
    },
  },
  { timestamps: true }
);

// Generate unique deposit ID
WalletDepositSchema.pre("save", function (next) {
  if (!this.depositId) {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).toUpperCase().slice(2, 8);
    this.depositId = `WD-${y}${m}${d}-${rand}`;
  }
  next();
});

// Force recompilation to ensure new fields are recognized
if (mongoose.models.WalletDeposit) {
  delete mongoose.models.WalletDeposit;
}

const WalletDeposit = mongoose.model("WalletDeposit", WalletDepositSchema);
export default WalletDeposit;
