import { connectToDatabase } from "@/lib/db";
import WalletDeposit from "@/models/WalletDeposit";
import User from "@/models/User";
import Payment from "@/models/Payment";
import { NextResponse } from "next/server";

/**
 * Sandbox Deposit Completion Endpoint
 * 
 * This endpoint simulates the webhook callback from NOWPayments
 * in sandbox/testing mode. It manually completes or fails deposits
 * without requiring real cryptocurrency payments.
 * 
 * Security: This endpoint should ONLY work when NOWPAYMENTS_SANDBOX_MODE=true
 */
export async function POST(request) {
  try {
    // ✅ SECURITY CHECK: Only allow in sandbox mode
    const isSandboxMode = process.env.NOWPAYMENTS_SANDBOX_MODE === "true";
    
    if (!isSandboxMode) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Sandbox endpoint is only available in sandbox mode" 
        },
        { status: 403 }
      );
    }

    const { depositId, status, amount, currency = "USD" } = await request.json();

    console.log("🎮 SANDBOX: Simulating deposit completion:", {
      depositId,
      status,
      amount,
      currency,
    });

    if (!depositId || !status) {
      return NextResponse.json(
        { error: "depositId and status are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the deposit by NOWPayments orderId
    const deposit = await WalletDeposit.findOne({
      "nowpaymentsPayment.orderId": depositId,
    });

    if (!deposit) {
      console.error("❌ Deposit not found:", depositId);
      return NextResponse.json(
        { error: "Deposit not found" },
        { status: 404 }
      );
    }

    // Verify this is a sandbox deposit
    if (!deposit.nowpaymentsPayment?.metadata?.sandbox_mode) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot simulate completion for non-sandbox deposits" 
        },
        { status: 403 }
      );
    }

    const user = await User.findById(deposit.userId);
    if (!user) {
      console.error("❌ User not found:", deposit.userId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Simulate payment completion or failure
    if (status === "completed") {
      // ✅ SIMULATE SUCCESSFUL PAYMENT
      console.log("✅ SANDBOX: Simulating successful payment");

      // Update deposit status
      deposit.status = "completed";
      deposit.nowpaymentsPayment.status = "finished";
      deposit.nowpaymentsPayment.actuallyPaid = Number(amount || deposit.finalAmount);
      deposit.nowpaymentsPayment.callbackReceived = true;
      deposit.nowpaymentsPayment.lastStatusUpdate = new Date();

      // Credit user balance with ORIGINAL amount (not final amount with fees)
      const creditAmount = Number(deposit.originalAmount || deposit.amount);
      const previousBalance = Number(user.balance || 0);
      user.balance = previousBalance + creditAmount;

      await Promise.all([deposit.save(), user.save()]);

      console.log("💰 SANDBOX: Balance credited:", {
        userId: user._id,
        previousBalance,
        creditAmount,
        newBalance: user.balance,
      });

      // Create or update Payment record for tracking
      await Payment.findOneAndUpdate(
        { payment_id: deposit.nowpaymentsPayment.paymentId },
        {
          payment_id: deposit.nowpaymentsPayment.paymentId,
          order_id: depositId,
          payment_status: "finished",
          price_amount: deposit.finalAmount,
          price_currency: deposit.currency.toLowerCase(),
          pay_amount: deposit.finalAmount,
          pay_currency: "btc",
          actually_paid: deposit.finalAmount,
          outcome_amount: deposit.originalAmount,
          outcome_currency: deposit.currency.toLowerCase(),
          order_description: `Wallet Deposit - Sandbox Test`,
          purchase_id: depositId,
          updated_at: new Date(),
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        success: true,
        message: "Payment simulated successfully",
        deposit: {
          depositId: deposit.depositId,
          status: deposit.status,
          amount: deposit.amount,
          originalAmount: deposit.originalAmount,
          finalAmount: deposit.finalAmount,
          serviceFee: deposit.serviceFee,
        },
        user: {
          userId: user._id,
          previousBalance,
          creditAmount,
          newBalance: user.balance,
        },
      });

    } else if (status === "failed") {
      // ❌ SIMULATE FAILED PAYMENT
      console.log("❌ SANDBOX: Simulating failed payment");

      deposit.status = "failed";
      deposit.nowpaymentsPayment.status = "failed";
      deposit.nowpaymentsPayment.callbackReceived = true;
      deposit.nowpaymentsPayment.lastStatusUpdate = new Date();

      await deposit.save();

      // Create or update Payment record
      await Payment.findOneAndUpdate(
        { payment_id: deposit.nowpaymentsPayment.paymentId },
        {
          payment_id: deposit.nowpaymentsPayment.paymentId,
          order_id: depositId,
          payment_status: "failed",
          price_amount: deposit.finalAmount,
          price_currency: deposit.currency.toLowerCase(),
          updated_at: new Date(),
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        success: true,
        message: "Payment failure simulated successfully",
        deposit: {
          depositId: deposit.depositId,
          status: deposit.status,
          amount: deposit.amount,
        },
      });

    } else {
      return NextResponse.json(
        { error: "Invalid status. Use 'completed' or 'failed'" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("❌ SANDBOX completion error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || "Failed to simulate payment completion" 
      },
      { status: 500 }
    );
  }
}
