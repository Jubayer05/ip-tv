import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ["info", "discount", "promotions", "notice"],
      default: "info",
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sentTo: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for notification status
notificationSchema.virtual("isExpired").get(function () {
  return new Date() > this.validUntil;
});

// Virtual for read count
notificationSchema.virtual("readCount").get(function () {
  return this.sentTo.filter((sent) => sent.isRead).length;
});

// Virtual for sent count
notificationSchema.virtual("sentCount").get(function () {
  return this.sentTo.length;
});

// Index for better query performance
notificationSchema.index({ isActive: 1, validUntil: 1 });
notificationSchema.index({ "sentTo.user": 1 });
notificationSchema.index({ type: 1 });

// Pre-save middleware to validate dates
notificationSchema.pre("save", function (next) {
  if (this.validUntil && this.validUntil <= this.validFrom) {
    next(new Error("Valid until date must be after valid from date"));
  }
  next();
});

// Static method to find active notifications for a user
notificationSchema.statics.findActiveForUser = function (userId) {
  const now = new Date();

  let query = {
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gt: now },
    "sentTo.user": userId,
  };

  return this.find(query).sort({ createdAt: -1 });
};

// Static method to mark notification as read for a user
notificationSchema.statics.markAsRead = function (notificationId, userId) {
  return this.findByIdAndUpdate(
    notificationId,
    {
      $set: {
        "sentTo.$[elem].isRead": true,
      },
    },
    {
      arrayFilters: [{ "elem.user": userId }],
      new: true,
    }
  );
};

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
