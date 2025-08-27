import mongoose from "mongoose";

const devicePricingSchema = new mongoose.Schema(
  {
    deviceCount: { type: Number, required: true, min: 1 },
    multiplier: { type: Number, required: true, min: 1 },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const bulkDiscountSchema = new mongoose.Schema(
  {
    minQuantity: { type: Number, required: true, min: 1 },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    durationMonths: { type: Number, required: true, min: 1 },
    deviceLimit: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      default: "USD",
    },
    description: { type: String, default: "", trim: true },
    customerNote: { type: String, default: "", trim: true },
    features: [
      {
        text: { type: String, required: true, trim: true },
        included: { type: Boolean, default: true },
      },
    ],
    recommended: { type: Boolean, default: false },
  },
  {
    _id: true,
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },

    variants: {
      type: [variantSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one variant is required",
      },
    },

    // Device pricing rules
    devicePricing: {
      type: [devicePricingSchema],
      default: [
        { deviceCount: 1, multiplier: 1, description: "1 Device" },
        {
          deviceCount: 2,
          multiplier: 1.5,
          description: "2 Devices (50% more)",
        },
        { deviceCount: 3, multiplier: 2, description: "3 Devices (100% more)" },
      ],
    },

    // Bulk discount rules
    bulkDiscounts: {
      type: [bulkDiscountSchema],
      default: [
        {
          minQuantity: 3,
          discountPercentage: 5,
          description: "3+ Orders: 5% OFF",
        },
        {
          minQuantity: 5,
          discountPercentage: 10,
          description: "5+ Orders: 10% OFF",
        },
        {
          minQuantity: 10,
          discountPercentage: 15,
          description: "10+ Orders: 15% OFF",
        },
      ],
    },

    // Adult channels fee percentage
    adultChannelsFeePercentage: { type: Number, default: 20, min: 0, max: 100 },

    allowAnyQuantity: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;

        ret.meta = {
          createdAt: ret.createdAt,
          updatedAt: ret.updatedAt,
          status: ret.status,
        };
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.status;

        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Ensure uniqueness at DB level
productSchema.index({ uniquePath: 1 }, { unique: true });

// Helper: generate slug from name if not provided
function slugify(input) {
  return (input || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

productSchema.pre("validate", function (next) {
  if (!this.uniquePath && this.name) {
    this.uniquePath = slugify(this.name);
  }
  next();
});

// Add this validation after the productSchema definition
productSchema.pre("validate", function (next) {
  // Check if only one variant is recommended
  const recommendedVariants = this.variants.filter((v) => v.recommended);
  if (recommendedVariants.length > 1) {
    return next(new Error("Only one variant can be marked as recommended"));
  }
  next();
});

// Avoid OverwriteModelError in dev
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
