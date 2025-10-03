// User model
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    firebaseUid: { type: String, unique: true, sparse: true },
    firebase: {
      uid: { type: String, default: null },
      provider: { type: String, default: null },
      emailVerified: { type: Boolean, default: false },
    },
    profile: {
      firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
      },
      lastName: {
        type: String,
        required: false, // Changed from required: true to false
        trim: true,
        maxlength: 50,
        default: "", // Add default empty string
      },
      username: {
        type: String,
        trim: true,
        required: true,
        maxlength: 30,
        unique: true, // Add unique constraint
        sparse: true, // Allows multiple null values but ensures uniqueness for actual values
      },
      avatar: {
        type: String,
        default: null,
      },
      phone: {
        type: String,
        trim: true,
        maxlength: 20,
      },
      country: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      dateOfBirth: {
        type: Date,
        validate: {
          validator: function (v) {
            return !v || v <= new Date();
          },
          message: "Date of birth cannot be in the future",
        },
      },
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    rank: {
      level: {
        type: String,
        enum: ["bronze", "silver", "gold", "platinum", "diamond"],
        default: "bronze",
      },
      totalSpent: {
        type: Number,
        default: 0,
        min: 0,
      },
      discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    referral: {
      code: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        uppercase: true,
        minlength: 6,
        maxlength: 10,
      },
      referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      earnings: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    settings: {
      notifications: {
        type: Boolean,
        default: true,
      },
      // Remove the twoFactorEnabled field since 2FA is always required
    },
    role: {
      type: String,
      enum: ["user", "admin", "support"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    twoFactorCode: {
      type: String,
      default: null,
    },
    twoFactorCodeExpires: {
      type: Date,
      default: null,
    },
    // Add visitor tracking for 2FA
    trustedDevices: [
      {
        visitorId: {
          type: String,
          required: true,
        },
        deviceInfo: {
          userAgent: String,
          ip: String,
          lastUsed: {
            type: Date,
            default: Date.now,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      },
    ],
    // Add free trial tracking
    freeTrial: {
      hasUsed: {
        type: Boolean,
        default: false,
      },
      usedAt: {
        type: Date,
        default: null,
      },
      trialData: {
        lineId: String,
        username: String,
        password: String,
        templateId: Number,
        templateName: String,
        lineType: Number,
        expireDate: Date,
      },
    },
    // Add current plan tracking
    currentPlan: {
      isActive: {
        type: Boolean,
        default: false,
      },
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null,
      },
      planName: {
        type: String,
        default: "",
      },
      price: {
        type: Number,
        default: 0,
      },
      duration: {
        type: Number,
        default: 0, // months
      },
      devicesAllowed: {
        type: Number,
        default: 1,
      },
      adultChannels: {
        type: Boolean,
        default: false,
      },
      startDate: {
        type: Date,
        default: null,
      },
      expireDate: {
        type: Date,
        default: null,
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("profile.fullName").get(function () {
  if (this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.profile.firstName;
});

// Virtual for referral link
userSchema.virtual("referral.link").get(function () {
  return this.referral.code
    ? `${process.env.NEXT_PUBLIC_APP_URL || ""}/register?ref=${
        this.referral.code
      }`
    : null;
});

// Pre-save middleware to generate referral code if not exists
userSchema.pre("save", async function (next) {
  if (this.isNew && !this.referral.code) {
    this.referral.code = this.generateReferralCode();
  }
  next();
});

// Method to generate unique referral code
userSchema.methods.generateReferralCode = function () {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Method to update rank based on total spent
userSchema.methods.updateRank = function () {
  const spent = this.rank.totalSpent;

  if (spent >= 1000) {
    this.rank.level = "diamond";
    this.rank.discountPercentage = 15;
  } else if (spent >= 500) {
    this.rank.level = "platinum";
    this.rank.discountPercentage = 12;
  } else if (spent >= 250) {
    this.rank.level = "gold";
    this.rank.discountPercentage = 10;
  } else if (spent >= 100) {
    this.rank.level = "silver";
    this.rank.discountPercentage = 7;
  } else {
    this.rank.level = "bronze";
    this.rank.discountPercentage = 5;
  }
};

// Method to check if user can use free trial
userSchema.methods.canUseFreeTrial = function () {
  return !this.freeTrial.hasUsed;
};

// Method to mark free trial as used
userSchema.methods.markFreeTrialUsed = function (trialData) {
  this.freeTrial.hasUsed = true;
  this.freeTrial.usedAt = new Date();
  this.freeTrial.trialData = {
    lineId: trialData.lineId,
    username: trialData.username,
    password: trialData.password, // Add password field
    templateId: trialData.templateId,
    templateName: trialData.templateName,
    lineType: trialData.lineType,
    expireDate: new Date(trialData.expire * 1000),
  };
  return this.save();
};

// Method to update current plan
userSchema.methods.updateCurrentPlan = function (orderData) {
  this.currentPlan = {
    isActive: true,
    orderId: orderData.orderId,
    planName: orderData.planName,
    price: orderData.price,
    duration: orderData.duration,
    devicesAllowed: orderData.devicesAllowed,
    adultChannels: orderData.adultChannels,
    startDate: new Date(),
    expireDate: new Date(
      Date.now() + orderData.duration * 30 * 24 * 60 * 60 * 1000
    ), // duration in months
    autoRenew: false,
  };
  return this.save();
};

// Method to cancel current plan
userSchema.methods.cancelCurrentPlan = function () {
  this.currentPlan = {
    isActive: false,
    orderId: null,
    planName: "",
    price: 0,
    duration: 0,
    devicesAllowed: 1,
    adultChannels: false,
    startDate: null,
    expireDate: null,
    autoRenew: false,
  };
  return this.save();
};

// Method to check if plan is expired
userSchema.methods.isPlanExpired = function () {
  if (!this.currentPlan.isActive || !this.currentPlan.expireDate) {
    return true;
  }
  return new Date() > this.currentPlan.expireDate;
};

// Method to get plan status
userSchema.methods.getPlanStatus = function () {
  if (!this.currentPlan.isActive) {
    return { status: "inactive", message: "No active plan" };
  }

  if (this.isPlanExpired()) {
    return { status: "expired", message: "Plan has expired" };
  }

  const daysLeft = Math.ceil(
    (this.currentPlan.expireDate - new Date()) / (1000 * 60 * 60 * 24)
  );
  return {
    status: "active",
    message: `Valid for ${daysLeft} more days`,
    daysLeft,
  };
};

// Static method to find users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true });
};

// Static method to find top referrers
userSchema.statics.findTopReferrers = function (limit = 10) {
  return this.aggregate([
    { $match: { "referral.earnings": { $gt: 0 } } },
    { $sort: { "referral.earnings": -1 } },
    { $limit: limit },
    {
      $project: {
        email: 1,
        "profile.firstName": 1,
        "profile.lastName": 1,
        "referral.earnings": 1,
      },
    },
  ]);
};

// Method to add trusted device
userSchema.methods.addTrustedDevice = function (visitorId, deviceInfo) {
  // Check if device already exists
  const existingDevice = this.trustedDevices.find(
    (device) => device.visitorId === visitorId
  );

  if (existingDevice) {
    // Update last used time
    existingDevice.deviceInfo.lastUsed = new Date();
  } else {
    // Add new trusted device
    this.trustedDevices.push({
      visitorId,
      deviceInfo: {
        ...deviceInfo,
        lastUsed: new Date(),
        createdAt: new Date(),
      },
    });
  }

  return this.save();
};

// Method to check if device is trusted
userSchema.methods.isDeviceTrusted = function (visitorId) {
  return this.trustedDevices.some((device) => device.visitorId === visitorId);
};

// Method to remove trusted device
userSchema.methods.removeTrustedDevice = function (visitorId) {
  this.trustedDevices = this.trustedDevices.filter(
    (device) => device.visitorId !== visitorId
  );
  return this.save();
};

// Clear the model from cache to ensure new methods are available
if (mongoose.models.User) {
  delete mongoose.models.User;
}

// Check if model already exists to prevent overwrite error
const User = mongoose.model("User", userSchema);

export default User;
