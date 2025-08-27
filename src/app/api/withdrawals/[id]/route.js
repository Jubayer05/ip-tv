import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import WithdrawalRequest from "@/models/WithdrawalRequest";
import { NextResponse } from "next/server";

// PATCH - Update withdrawal request status
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params; // Fix: await params
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
      // Fix: Don't set processedBy if it's just "admin" string
      // Only set it if it's a valid ObjectId
      if (processedBy !== "admin") {
        withdrawal.processedBy = processedBy;
      }
      withdrawal.processedAt = new Date();
    }

    // If status changed to "paid", deduct amount from user balance
    if (prevStatus !== "paid" && status === "paid") {
      const user = await User.findById(withdrawal.userId);
      if (user) {
        if (user.balance >= withdrawal.amount) {
          user.balance -= withdrawal.amount;
          await user.save();
        } else {
          return NextResponse.json(
            { success: false, error: "Insufficient user balance" },
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
