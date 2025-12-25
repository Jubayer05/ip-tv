#!/usr/bin/env node

/**
 * Update User Rank Script
 * Manually updates a user's totalSpent and rank for testing purposes
 *
 * Usage: node scripts/update-user-rank.js <email> <totalSpent>
 * Example: node scripts/update-user-rank.js test@example.com 1000
 */

const { readFileSync } = require("fs");
const { resolve } = require("path");
const mongoose = require("mongoose");

// Parse .env.local file manually
function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const envContent = readFileSync(envPath, "utf8");
    const lines = envContent.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim();
          process.env[key.trim()] = value;
        }
      }
    }
  } catch (error) {
    console.error("Could not load .env.local file:", error.message);
    process.exit(1);
  }
}

loadEnvFile();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ip_tv";

// Get command line arguments
const args = process.argv.slice(2);
const email = args[0];
const totalSpent = parseFloat(args[1]);

if (!email || isNaN(totalSpent)) {
  console.error("\nUsage: node scripts/update-user-rank.js <email> <totalSpent>");
  console.error("Example: node scripts/update-user-rank.js test@example.com 1000\n");
  process.exit(1);
}

// User Schema (simplified)
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    profile: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      username: { type: String, trim: true },
    },
    rank: {
      level: { type: String, enum: ["bronze", "silver", "gold", "platinum", "diamond"], default: "bronze" },
      totalSpent: { type: Number, default: 0, min: 0 },
      discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    },
    referral: {
      code: { type: String },
      earnings: { type: Number, default: 0 },
    },
    balance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

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

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function updateUserRank() {
  console.log("\n=== Update User Rank Script ===\n");
  console.log(`Email: ${email}`);
  console.log(`New Total Spent: $${totalSpent}\n`);

  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Connected to MongoDB\n");

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`User with email "${email}" not found!`);
      process.exit(1);
    }

    console.log("=== Current User Data ===");
    console.log(`Name: ${user.profile?.firstName || 'N/A'} ${user.profile?.lastName || ''}`);
    console.log(`Current Rank: ${user.rank?.level || 'bronze'}`);
    console.log(`Current Total Spent: $${user.rank?.totalSpent || 0}`);
    console.log(`Current Discount: ${user.rank?.discountPercentage || 5}%`);
    console.log(`Current Balance: $${user.balance || 0}`);
    console.log(`Referral Earnings: $${user.referral?.earnings || 0}`);

    // Update total spent
    user.rank.totalSpent = totalSpent;

    // Calculate new rank
    user.updateRank();

    // Save changes
    await user.save();

    console.log("\n=== Updated User Data ===");
    console.log(`New Rank: ${user.rank.level}`);
    console.log(`New Total Spent: $${user.rank.totalSpent}`);
    console.log(`New Discount: ${user.rank.discountPercentage}%`);

    // Display rank thresholds for reference
    console.log("\n=== Rank Thresholds ===");
    console.log("Bronze:   $0-99     (5% discount)");
    console.log("Silver:   $100-249  (7% discount)");
    console.log("Gold:     $250-499  (10% discount)");
    console.log("Platinum: $500-999  (12% discount)");
    console.log("Diamond:  $1000+    (15% discount)");

    console.log("\n User rank updated successfully!\n");

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

updateUserRank();
