import { connectToDatabase } from "@/lib/db";
import WalletDeposit from "@/models/WalletDeposit";
import Order from "@/models/Order";
import User from "@/models/User";
import paygateService from "@/lib/paymentServices/paygateService";
import { NextResponse } from "next/server";

export async function GET(_request, { params }) {
  const requestId = `status-${Date.now()}`;
  
  try {
    const { ipnToken } = await params;

    if (!ipnToken) {
      console.error(`[PayGate Status ${requestId}] ❌ IPN token missing`);
      return NextResponse.json(
        { success: false, error: "IPN token required" },
        { status: 400 }
      );
    }

    console.log(`[PayGate Status ${requestId}] 🔍 Checking payment status for IPN: ${ipnToken.substring(0, 10)}...`);

    await connectToDatabase();

    // Find deposit or order by IPN token
    const deposit = await WalletDeposit.findOne({
      "paygatePayment.walletData.ipn_token": ipnToken,
    }).populate("userId", "email username");

    const order = await Order.findOne({
      "paygatePayment.walletData.ipn_token": ipnToken,
    }).populate("userId", "email username");

    const record = deposit || order;

    if (!record) {
      console.error(`[PayGate Status ${requestId}] ❌ Payment not found for IPN: ${ipnToken.substring(0, 10)}`);
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    console.log(`[PayGate Status ${requestId}] 📦 Found record:`, {
      type: deposit ? 'deposit' : 'order',
      id: deposit?.depositId || order?.orderNumber,
      currentStatus: record.status,
      amount: record.amount,
    });

    // Check current status from database first
    const currentStatus = record.paygatePayment?.status || record.status;

    // If already completed, return immediately
    if (['completed', 'paid', 'confirmed'].includes(currentStatus)) {
      console.log(`[PayGate Status ${requestId}] ✅ Payment already completed`);
      return NextResponse.json({
        success: true,
        status: 'paid',
        record: {
          id: deposit?.depositId || order?.orderNumber,
          amount: record.amount,
          status: record.status,
          type: deposit ? 'deposit' : 'order',
        },
      });
    }

    // Check with PayGate API
    console.log(`[PayGate Status ${requestId}] 🌐 Querying PayGate API...`);
    
    let statusResult;
    try {
      statusResult = await paygateService.checkPaymentStatus(ipnToken);
      console.log(`[PayGate Status ${requestId}] 📊 PayGate API response:`, {
        success: statusResult.success,
        status: statusResult.data?.status,
        value_coin: statusResult.data?.value_coin,
        coin: statusResult.data?.coin,
      });
    } catch (apiError) {
      console.error(`[PayGate Status ${requestId}] ❌ PayGate API error:`, apiError.message);
      // Return current status if API fails
      return NextResponse.json({
        success: true,
        status: currentStatus,
        record: {
          id: deposit?.depositId || order?.orderNumber,
          amount: record.amount,
          status: record.status,
          type: deposit ? 'deposit' : 'order',
        },
      });
    }

    if (statusResult.success) {
      const { status, value_coin, txid_out, coin } = statusResult.data;

      console.log(`[PayGate Status ${requestId}] 📈 Payment status from API: ${status}`);

      // Update record if status changed to paid
      if (['paid', 'completed', 'confirmed'].includes(status) && record.status !== 'completed') {
        console.log(`[PayGate Status ${requestId}] 💰 Payment confirmed! Updating record...`);

        // Update payment data
        record.paygatePayment.status = status;
        record.paygatePayment.paymentData = {
          ...record.paygatePayment.paymentData,
          value_coin,
          txid_out,
          coin,
          confirmedAt: new Date(),
        };

        // For deposits: Credit user balance
        if (deposit) {
          try {
            const user = await User.findById(deposit.userId);
            if (user) {
              const oldBalance = user.balance;
              user.balance += deposit.amount;
              await user.save();

              deposit.status = 'completed';
              await deposit.save();

              console.log(`[PayGate Status ${requestId}] ✅ User balance updated:`, {
                userId: user._id,
                oldBalance,
                newBalance: user.balance,
                credited: deposit.amount,
              });
            }
          } catch (balanceError) {
            console.error(`[PayGate Status ${requestId}] ❌ Balance update failed:`, balanceError);
          }
        }

        // For orders: Mark as paid
        if (order) {
          order.status = 'paid';
          order.paymentStatus = 'completed';
          await order.save();

          console.log(`[PayGate Status ${requestId}] ✅ Order marked as paid:`, {
            orderNumber: order.orderNumber,
            status: order.status,
          });
        }

        console.log(`[PayGate Status ${requestId}] 💾 Record updated successfully`);
      }

      return NextResponse.json({
        success: true,
        status: status,
        record: {
          id: deposit?.depositId || order?.orderNumber,
          amount: record.amount,
          status: record.status,
          type: deposit ? 'deposit' : 'order',
          transaction: {
            coin,
            value_coin,
            txid_out,
          },
        },
      });
    }

    // Fallback: return current status
    console.log(`[PayGate Status ${requestId}] 📊 Returning current status: ${currentStatus}`);
    return NextResponse.json({
      success: true,
      status: currentStatus,
      record: {
        id: deposit?.depositId || order?.orderNumber,
        amount: record.amount,
        status: record.status,
        type: deposit ? 'deposit' : 'order',
      },
    });

  } catch (error) {
    console.error(`[PayGate Status ${requestId}] ❌ Error:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to check payment status" 
      },
      { status: 500 }
    );
  }
}
