#!/usr/bin/env node

/**
 * Admin Seed Script
 * Creates an admin user using credentials from .env.local
 *
 * Usage: node scripts/seed-admin.js
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
    console.error("❌ Could not load .env.local file:", error.message);
    process.exit(1);
  }
}

loadEnvFile();

const admin = require("firebase-admin");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ip_tv";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
  process.exit(1);
}

// User Schema (simplified for seeding)
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    firebaseUid: { type: String, unique: true, sparse: true },
    firebase: {
      uid: { type: String, default: null },
      provider: { type: String, default: null },
      emailVerified: { type: Boolean, default: false },
    },
    profile: {
      firstName: { type: String, required: true, trim: true, maxlength: 50 },
      lastName: { type: String, trim: true, maxlength: 50, default: "" },
      username: { type: String, trim: true, required: true, maxlength: 30, unique: true, sparse: true },
      avatar: { type: String, default: null },
      phone: { type: String, trim: true, maxlength: 20 },
      country: { type: String, trim: true, maxlength: 100 },
    },
    balance: { type: Number, default: 0, min: 0 },
    rank: {
      level: { type: String, enum: ["bronze", "silver", "gold", "platinum", "diamond"], default: "bronze" },
      totalSpent: { type: Number, default: 0, min: 0 },
      discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    },
    referral: {
      code: { type: String, unique: true, sparse: true, trim: true, uppercase: true },
      referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      earnings: { type: Number, default: 0, min: 0 },
    },
    role: { type: String, enum: ["user", "admin", "support"], default: "user" },
    isActive: { type: Boolean, default: true },
    createdByAdmin: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    trustedDevices: [],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

// Initialize Firebase Admin
function initFirebaseAdmin() {
  if (admin.apps.length) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ Firebase Admin credentials not found in environment variables");
    console.error("   Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
    process.exit(1);
  }

  // Handle private key formatting - remove surrounding quotes and convert \n to actual newlines
  privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  console.log("✅ Firebase Admin initialized");
}

function generateReferralCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function seedAdmin() {
  console.log("\n🚀 Starting Admin Seed Script\n");
  console.log(`📧 Admin Email: ${ADMIN_EMAIL}`);
  console.log(`🔗 MongoDB URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")}\n`);

  try {
    // Initialize Firebase Admin
    initFirebaseAdmin();

    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connected to MongoDB\n");

    // Check if user already exists in MongoDB
    const existingMongoUser = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existingMongoUser) {
      console.log("⚠️  User already exists in MongoDB");

      if (existingMongoUser.role !== "admin") {
        console.log("📝 Updating role to admin...");
        existingMongoUser.role = "admin";
        await existingMongoUser.save();
        console.log("✅ Role updated to admin");
      } else {
        console.log("✅ User is already an admin");
      }

      // Check Firebase user exists
      try {
        const firebaseUser = await admin.auth().getUserByEmail(ADMIN_EMAIL);
        console.log(`✅ Firebase user exists (UID: ${firebaseUser.uid})`);

        // Update password in Firebase
        console.log("📝 Updating Firebase password...");
        await admin.auth().updateUser(firebaseUser.uid, {
          password: ADMIN_PASSWORD,
          emailVerified: true,
        });
        console.log("✅ Firebase password updated");
      } catch (fbError) {
        if (fbError.code === "auth/user-not-found") {
          console.log("⚠️  Firebase user not found, creating...");
          const newFirebaseUser = await admin.auth().createUser({
            email: ADMIN_EMAIL.toLowerCase(),
            password: ADMIN_PASSWORD,
            emailVerified: true,
            displayName: "Super Admin",
          });

          existingMongoUser.firebaseUid = newFirebaseUser.uid;
          existingMongoUser.firebase = {
            uid: newFirebaseUser.uid,
            provider: "email",
            emailVerified: true,
          };
          await existingMongoUser.save();
          console.log(`✅ Firebase user created (UID: ${newFirebaseUser.uid})`);
        } else {
          throw fbError;
        }
      }

      console.log("\n✅ Admin user setup complete!\n");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Check if user exists in Firebase
    let firebaseUid;
    try {
      const existingFirebaseUser = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      console.log(`⚠️  Firebase user already exists (UID: ${existingFirebaseUser.uid})`);
      console.log("📝 Updating password...");
      await admin.auth().updateUser(existingFirebaseUser.uid, {
        password: ADMIN_PASSWORD,
        emailVerified: true,
      });
      firebaseUid = existingFirebaseUser.uid;
      console.log("✅ Firebase password updated");
    } catch (fbError) {
      if (fbError.code === "auth/user-not-found") {
        // Create new Firebase user
        console.log("📝 Creating Firebase user...");
        const newFirebaseUser = await admin.auth().createUser({
          email: ADMIN_EMAIL.toLowerCase(),
          password: ADMIN_PASSWORD,
          emailVerified: true,
          displayName: "Super Admin",
        });
        firebaseUid = newFirebaseUser.uid;
        console.log(`✅ Firebase user created (UID: ${firebaseUid})`);
      } else {
        throw fbError;
      }
    }

    // Create MongoDB user
    console.log("📝 Creating MongoDB user...");
    const newUser = new User({
      email: ADMIN_EMAIL.toLowerCase(),
      firebaseUid,
      firebase: {
        uid: firebaseUid,
        provider: "email",
        emailVerified: true,
      },
      profile: {
        firstName: "Super",
        lastName: "Admin",
        username: "superadmin",
      },
      role: "admin",
      isActive: true,
      createdByAdmin: true,
      referral: {
        code: generateReferralCode(),
      },
    });

    await newUser.save();
    console.log("✅ MongoDB user created\n");

    console.log("═══════════════════════════════════════════");
    console.log("       🎉 ADMIN USER CREATED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════");
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     admin`);
    console.log("═══════════════════════════════════════════");
    console.log("\n   Login at: http://localhost:3000/login\n");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.code) {
      console.error("   Code:", error.code);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
  }
}

seedAdmin();
