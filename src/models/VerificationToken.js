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

// Update createToken method to include user data
verificationTokenSchema.statics.createToken = async function (email, userData) {
  const token = this.generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete any existing tokens for this email
  await this.deleteMany({ email });

  // Log to debug
  console.log("=== DEBUGGING TOKEN CREATION ===");
  console.log("Email:", email);
  console.log("UserData received:", userData);

  // Store data directly in the schema
  const tokenData = {
    email,
    token,
    expiresAt,
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    username: userData?.username || null,
  };

  console.log("Token data to be created:", JSON.stringify(tokenData, null, 2));

  try {
    const tokenDoc = await this.create(tokenData);

    // Log the created document to verify
    console.log("=== TOKEN CREATED SUCCESSFULLY ===");
    console.log("Created token document:", tokenDoc);
    console.log("FirstName:", tokenDoc.firstName);
    console.log("LastName:", tokenDoc.lastName);
    console.log("Username:", tokenDoc.username);

    return tokenDoc;
  } catch (error) {
    console.error("=== ERROR CREATING TOKEN ===");
    console.error("Error:", error);
    console.error("Token data that failed:", tokenData);
    throw error;
  }
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

// In dev, force recompile so schema updates take effect
if (mongoose.models.VerificationToken) {
  delete mongoose.models.VerificationToken;
}
const VerificationToken = mongoose.model(
  "VerificationToken",
  verificationTokenSchema
);

export default VerificationToken;
