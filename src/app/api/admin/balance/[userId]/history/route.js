import { connectToDatabase } from "@/lib/db";
import BalanceTransaction from "@/models/BalanceTransaction";
import { NextResponse } from "next/server";

// GET - Get user balance history
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    // Await params in Next.js 15
    const { userId } = await params;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const type = searchParams.get("type"); // Filter by transaction type

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Build query
    let query = { userId };
    if (type && type !== "all") {
      if (type === "deposit") {
        // Include both deposit and admin_add for deposit history
        query.type = { $in: ["deposit", "admin_add"] };
      } else {
        query.type = type;
      }
    }

    const skip = (page - 1) * limit;

    const transactions = await BalanceTransaction.find(query)
      .populate("adminId", "profile.firstName profile.lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BalanceTransaction.countDocuments(query);

    // Get balance summary
    const summary = await BalanceTransaction.getUserSummary(userId);

    const response = {
      success: true,
      data: transactions,
      summary: summary[0] || {
        totalDeposits: 0,
        totalWithdrawals: 0,
        transactionCount: 0,
        lastTransaction: null,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching balance history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch balance history" },
      { status: 500 }
    );
  }
}
