import mongoose from "mongoose";

const deviceLoginSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deviceInfo: {
      userAgent: {
        type: String,
        required: true,
      },
      device: {
        type: String,
        required: true,
      },
      browser: {
        type: String,
        required: true,
      },
      os: {
        type: String,
        required: true,
      },
      platform: {
        type: String,
        required: true,
      },
    },
    ipAddress: {
      type: String,
      required: true,
    },
    location: {
      country: String,
      city: String,
      region: String,
    },
    loginDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    isCurrentSession: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
deviceLoginSchema.index({ userId: 1, loginDate: -1 });
deviceLoginSchema.index({ sessionId: 1 });
deviceLoginSchema.index({ status: 1 });

// Static method to create device login
deviceLoginSchema.statics.createDeviceLogin = async function (
  userId,
  deviceInfo,
  ipAddress,
  sessionId,
  location = {}
) {
  // Mark all previous sessions as inactive
  await this.updateMany(
    { userId, isCurrentSession: true },
    { isCurrentSession: false, status: "inactive" }
  );

  // Create new device login
  const deviceLogin = new this({
    userId,
    deviceInfo,
    ipAddress,
    sessionId,
    location,
    isCurrentSession: true,
  });

  return await deviceLogin.save();
};

// Static method to update last activity
deviceLoginSchema.statics.updateLastActivity = async function (sessionId) {
  return await this.findOneAndUpdate(
    { sessionId, status: "active" },
    { lastActivity: new Date() },
    { new: true }
  );
};

// Static method to get user's device logins
deviceLoginSchema.statics.getUserDeviceLogins = async function (
  userId,
  limit = 15
) {
  return await this.find({ userId })
    .sort({ loginDate: -1 })
    .limit(limit)
    .select("-__v");
};

// Static method to suspend device
deviceLoginSchema.statics.suspendDevice = async function (
  deviceLoginId,
  userId
) {
  return await this.findOneAndUpdate(
    { _id: deviceLoginId, userId },
    { status: "suspended" },
    { new: true }
  );
};

export default mongoose.models.DeviceLogin ||
  mongoose.model("DeviceLogin", deviceLoginSchema);
