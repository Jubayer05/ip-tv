import mongoose from "mongoose";

const UrlClickTrackingSchema = new mongoose.Schema(
  {
    urlTrackingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UrlTracking",
      required: true,
      index: true,
    },
    visitorId: {
      type: String,
      required: true,
      index: true,
    },
    clickCount: {
      type: Number,
      default: 1,
    },
    deviceInfo: {
      platform: {
        type: String,
        enum: ["Mobile", "Tablet", "Desktop"],
        default: "Desktop",
      },
      deviceType: String,
      browser: String,
      os: String,
      userAgent: String,
      screenResolution: String,
    },
    location: {
      country: String,
      countryCode: String,
    },
    firstClickAt: {
      type: Date,
      default: Date.now,
    },
    lastClickAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique visitor per URL tracking
UrlClickTrackingSchema.index(
  { urlTrackingId: 1, visitorId: 1 },
  { unique: true }
);
UrlClickTrackingSchema.index({ clickCount: -1 });
UrlClickTrackingSchema.index({ "location.country": 1 });
UrlClickTrackingSchema.index({ "deviceInfo.platform": 1 });

const UrlClickTracking =
  mongoose.models.UrlClickTracking ||
  mongoose.model("UrlClickTracking", UrlClickTrackingSchema);

export default UrlClickTracking;
