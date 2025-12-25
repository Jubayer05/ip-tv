import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check current DB status
    const dbStatus = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

    // If disconnected, initiate connection in background (don't await)
    if (dbStatus === 0) {
      connectToDatabase().catch((err) => {
        console.error(
          "❌ Health check: DB connection initiation failed:",
          err.message
        );
      });
    }

    // Always return 200 if the app is running - DB connection is lazy
    // This allows the health check to pass while DB connects in background
    const statusText = dbStatus === 1 ? "ok" : "starting";

    return NextResponse.json(
      {
        status: statusText,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
        db: {
          status:
            dbStatus === 1
              ? "connected"
              : dbStatus === 2
              ? "connecting"
              : "initializing",
          readyState: dbStatus,
        },
      },
      { status: 200 } // Always return 200 if app is running
    );
  } catch (error) {
    console.error("❌ Health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
}
