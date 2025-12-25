import mongoose from "mongoose";

const UrlTrackingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    uniqueClickCount: {
      type: Number,
      default: 0,
    },
    lastAccessed: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    pageType: {
      type: String,
      enum: ["existing", "non-existing"],
      default: "non-existing",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for better query performance
// Note: url and slug already have indexes from unique: true, so we don't need to add them again
UrlTrackingSchema.index({ isActive: 1 });
UrlTrackingSchema.index({ clickCount: -1 });
UrlTrackingSchema.index({ uniqueClickCount: -1 });

const UrlTracking =
  mongoose.models.UrlTracking ||
  mongoose.model("UrlTracking", UrlTrackingSchema);

export default UrlTracking;
