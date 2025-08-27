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
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    keys: { type: [OrderKeySchema], default: [] },

    contactInfo: { type: ContactInfoSchema, required: true },

    status: {
      type: String,
      enum: ["completed", "cancelled"],
      default: "completed",
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
