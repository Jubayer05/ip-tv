import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import WithdrawalRequest from "@/models/WithdrawalRequest";
import { NextResponse } from "next/server";

// GET - Fetch withdrawal requests (for admin or user)
export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const isAdmin = searchParams.get("isAdmin") === "true";

    let query = {};

    if (userId && !isAdmin) {
      // User can only see their own requests
      query.userId = userId;
    }

    const withdrawals = await WithdrawalRequest.find(query)
      .populate(
        "userId",
        "profile.firstName profile.lastName profile.username email"
      )
      .populate("processedBy", "profile.firstName profile.lastName")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: withdrawals,
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch withdrawals" },
      { status: 500 }
    );
  }
}

// POST - Create new withdrawal request
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { userId, amount, currency, walletAddress, message } = body;

    // Validation
    if (!userId || !amount || !currency || !walletAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Check if user has sufficient referral earnings
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const referralEarnings = Number(user.referral?.earnings || 0);
    if (referralEarnings < amount) {
      return NextResponse.json(
        { success: false, error: "Insufficient referral earnings" },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawal = new WithdrawalRequest({
      userId,
      amount,
      currency,
      walletAddress,
      message,
      status: "pending",
    });

    await withdrawal.save();

    return NextResponse.json({
      success: true,
      data: withdrawal,
      message: "Withdrawal request submitted successfully",
    });
  } catch (error) {
    console.error("Error creating withdrawal:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create withdrawal request" },
      { status: 500 }
    );
  }
}

// PATCH - Update withdrawal request status
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes, processedBy } = body;

    const withdrawal = await WithdrawalRequest.findById(id);
    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: "Withdrawal request not found" },
        { status: 404 }
      );
    }

    const prevStatus = withdrawal.status;
    withdrawal.status = status;

    if (adminNotes) {
      withdrawal.adminNotes = adminNotes;
    }

    if (processedBy) {
      withdrawal.processedBy = processedBy;
      withdrawal.processedAt = new Date();
    }

    // If status changed to "paid", deduct amount from user referral earnings
    if (prevStatus !== "paid" && status === "paid") {
      const user = await User.findById(withdrawal.userId);
      if (user) {
        const referralEarnings = Number(user.referral?.earnings || 0);
        if (referralEarnings >= withdrawal.amount) {
          user.referral.earnings = referralEarnings - withdrawal.amount;
          await user.save();
        } else {
          return NextResponse.json(
            { success: false, error: "Insufficient referral earnings" },
            { status: 400 }
          );
        }
      }
    }

    await withdrawal.save();

    return NextResponse.json({
      success: true,
      data: withdrawal,
      message: "Withdrawal request updated successfully",
    });
  } catch (error) {
    console.error("Error updating withdrawal:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update withdrawal request" },
      { status: 500 }
    );
  }
}
