import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      amount,
      currency = "USD",
      userId,
      customerEmail,
      paymentGateway,
      gatewayData = {},
    } = await request.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create wallet deposit record
    const deposit = new WalletDeposit({
      userId,
      amount: Number(amount),
      currency,
      paymentMethod: "Cryptocurrency",
      paymentGateway,
      [paymentGateway + "Payment"]: gatewayData,
    });

    await deposit.save();

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      amount: deposit.amount,
      currency: deposit.currency,
      status: deposit.status,
      ...gatewayData,
    });
  } catch (error) {
    console.error("Deposit creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create deposit" },
      { status: 500 }
    );
  }
}
