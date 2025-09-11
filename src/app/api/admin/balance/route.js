import { connectToDatabase } from "@/lib/db";
import BalanceTransaction from "@/models/BalanceTransaction";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET - Search users and get balance info
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    // Build search query
    let query = { isActive: true };
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { "profile.firstName": { $regex: search, $options: "i" } },
        { "profile.lastName": { $regex: search, $options: "i" } },
        { "profile.username": { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("profile email balance createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search users" },
      { status: 500 }
    );
  }
}

// POST - Update user balance
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { userId, type, amount, description, adminId } = body;

    // Validate required fields
    if (!userId || !type || !amount || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ["admin_add", "admin_deduct", "purchase"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const previousBalance = user.balance;
    let newBalance;

    // Calculate new balance
    if (type === "admin_add") {
      newBalance = previousBalance + amount;
    } else if (type === "admin_deduct" || type === "purchase") {
      if (previousBalance < amount) {
        return NextResponse.json(
          { success: false, error: "Insufficient balance" },
          { status: 400 }
        );
      }
      newBalance = previousBalance - amount;
    }

    // Update user balance
    user.balance = newBalance;
    await user.save();

    // Create balance transaction record
    const transaction = new BalanceTransaction({
      userId,
      type,
      amount,
      description,
      previousBalance,
      newBalance,
      adminId: adminId || null,
      status: "completed",
    });

    await transaction.save();

    return NextResponse.json({
      success: true,
      message: "Balance updated successfully",
      data: {
        userId: user._id,
        previousBalance,
        newBalance,
        transactionId: transaction._id,
      },
    });
  } catch (error) {
    console.error("Error updating balance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update balance" },
      { status: 500 }
    );
  }
}
