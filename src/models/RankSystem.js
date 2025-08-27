import mongoose from "mongoose";

const rankSystemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    benefits: {
      type: String,
      required: true,
      trim: true,
    },
    spending: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },
      max: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    bonusDevices: {
      type: Number,
      default: 0,
      min: 0,
    },
    earlyAccess: {
      type: Boolean,
      default: false,
    },
    vipSupport: {
      type: Boolean,
      default: false,
    },
    customCoupons: {
      type: Boolean,
      default: false,
    },
    exclusivePerks: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for order and isActive
rankSystemSchema.index({ order: 1, isActive: 1 });

const RankSystem =
  mongoose.models.RankSystem || mongoose.model("RankSystem", rankSystemSchema);

export default RankSystem;
