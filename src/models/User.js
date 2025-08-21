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
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
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
        validate: {
          validator: function (v) {
            return !v || v.startsWith("https://i.ibb.co/");
          },
          message: "Avatar must be a valid ImgBB URL",
        },
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
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
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

// Check if model already exists to prevent overwrite error
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
