import { connectToDatabase } from "@/lib/db";
import WalletDeposit from "@/models/WalletDeposit";
import { NextResponse } from "next/server";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Deposit ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const deposit = await WalletDeposit.findOne({ depositId: id });

    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      status: deposit.status,
      amount: deposit.amount,
      currency: deposit.currency,
      createdAt: deposit.createdAt,
    });
  } catch (error) {
    console.error("Deposit status error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get deposit status" },
      { status: 500 }
    );
  }
}
