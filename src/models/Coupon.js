import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: { type: String, default: "", trim: true },

    // percentage or fixed
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },

    // optional constraints
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, default: 0, min: 0 }, // 0 = no max

    // validity window
    startDate: { type: Date, default: () => new Date() },
    endDate: { type: Date, default: null },

    // usage control
    usageLimit: { type: Number, default: 0, min: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0, min: 0 },

    // status
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// CouponSchema.index({ code: 1 }, { unique: true });

CouponSchema.methods.isCurrentlyValid = function (amount) {
  if (!this.isActive) return false;
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  if (this.minOrderAmount && amount < this.minOrderAmount) return false;
  return true;
};

CouponSchema.methods.calculateDiscount = function (amount) {
  let discount = 0;
  if (this.discountType === "percentage") {
    discount = (amount * this.discountValue) / 100;
  } else {
    discount = this.discountValue;
  }
  if (this.maxDiscountAmount && this.maxDiscountAmount > 0) {
    discount = Math.min(discount, this.maxDiscountAmount);
  }
  discount = Math.max(0, Math.min(discount, amount));
  return Math.round(discount * 100) / 100;
};

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
export default Coupon;
