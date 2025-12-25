import mongoose from "mongoose";

const verificationTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired tokens
    },
    used: {
      type: Boolean,
      default: false,
    },
    // Store data directly instead of nested object
    firstName: String,
    lastName: String,
    username: String,
    referralCode: String,
    country: {
      type: String,
      default: "Unknown",
    },
    countryCode: {
      type: String,
      default: "XX",
    },
  },
  {
    timestamps: true,
  }
);

// Generate a random token
verificationTokenSchema.statics.generateToken = function () {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

verificationTokenSchema.statics.createToken = async function (email, userData) {
  const token = this.generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete any existing tokens for this email
  await this.deleteMany({ email });

  // Store data directly in the schema
  const tokenData = {
    email,
    token,
    expiresAt,
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    username: userData?.username || null,
    referralCode: userData?.referralCode
      ? String(userData.referralCode).toUpperCase()
      : null,
    country: userData?.country || "Unknown",
    countryCode: userData?.countryCode || "XX",
  };

  const tokenDoc = await this.create(tokenData);
  return tokenDoc;
};

// Verify token
verificationTokenSchema.statics.verifyToken = async function (email, token) {
  const verificationToken = await this.findOne({
    email,
    token,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (verificationToken) {
    verificationToken.used = true;
    await verificationToken.save();
    return true;
  }

  return false;
};

const VerificationToken = mongoose.model(
  "VerificationToken",
  verificationTokenSchema
);

export default VerificationToken;
