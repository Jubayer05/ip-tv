import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ip_tv";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Check if running in Docker
    const isDocker =
      process.env.MONGODB_URI?.includes("mongodb+srv://") ||
      process.env.NODE_ENV === "production";

    const opts = {
      bufferCommands: false,
      // Connection pool settings - optimized for Docker + Atlas
      maxPoolSize: isDocker ? 15 : 10, // Increased pool for production load
      minPoolSize: isDocker ? 3 : 2,   // Keep minimum connections ready
      maxIdleTimeMS: 60000,            // Increased idle time to reduce reconnections

      // Critical: More lenient timeouts to handle network latency
      serverSelectionTimeoutMS: isDocker ? 10000 : 5000, // 10s in Docker for Atlas
      socketTimeoutMS: isDocker ? 45000 : 45000,         // 45s for long operations
      connectTimeoutMS: isDocker ? 15000 : 10000,        // 15s in Docker for slow connections

      // Retry settings
      retryWrites: true,
      retryReads: true,

      // Force IPv4 (Docker sometimes has IPv6 issues)
      family: 4,

      // Compression (reduces network traffic)
      compressors: ["zlib"],

      // Heartbeat to keep connection alive
      heartbeatFrequencyMS: 10000,

      // Direct connection mode for faster initial connection (if single cluster)
      // Note: Remove this if using replica set
      // directConnection: false, // Keep false for Atlas
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        const connectionTime = Date.now();
        console.log("✅ MongoDB connected successfully");
        if (
          process.env.NODE_ENV === "development" ||
          process.env.DEBUG_MONGODB === "true"
        ) {
          console.log(
            "📊 Connection pool size:",
            mongoose.connection.maxPoolSize
          );
          console.log("🌐 Host:", mongoose.connection.host);
        }
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error.message);
        if (
          error.message.includes("getaddrinfo") ||
          error.message.includes("ENOTFOUND")
        ) {
          console.error(
            "⚠️ DNS resolution issue detected. Check Docker DNS settings."
          );
        }
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function disconnectFromDatabase() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

// Add connection event listeners for debugging
if (
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_MONGODB === "true"
) {
  mongoose.connection.on("connected", () => {
    console.log("✅ Mongoose connected to MongoDB");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ Mongoose connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("⚠️ Mongoose disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("🔄 Mongoose reconnected");
  });
}
