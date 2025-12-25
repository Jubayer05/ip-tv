import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import paygateService from "@/lib/paymentServices/paygateService";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import { NextResponse } from "next/server";

export async function GET(_request, { params }) {
  const requestId = `STATUS-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    console.log(`[PayGate Status ${requestId}] Request started`);

    const { id } = await params;
    console.log(`[PayGate Status ${requestId}] Identifier:`, id);

    if (!id) {
      console.error(`[PayGate Status ${requestId}] Missing identifier`);
      return NextResponse.json(
        { error: "Payment identifier is required" },
        { status: 400 }
      );
    }

    console.log(`[PayGate Status ${requestId}] Connecting to database...`);
    await connectToDatabase();

    // Get PayGate payment settings
    console.log(`[PayGate Status ${requestId}] Fetching PayGate settings...`);
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "paygate",
      isActive: true,
    });

    if (paymentSettings?.webhookSecret) {
      console.log(`[PayGate Status ${requestId}] Configuring webhook secret`);
      paygateService.setWebhookSecret(paymentSettings.webhookSecret);
    }

    // Try to find by payment ID or order number first
    let order = await Order.findOne({
      $or: [{ "paygatePayment.paymentId": id }, { orderNumber: id }],
    });

    // If not found, try to find by IPN token (for both deposits and orders)
    let deposit = null;
    if (!order) {
      deposit = await WalletDeposit.findOne({
        "paygatePayment.walletData.ipn_token": id,
      }).populate("userId", "email username");

      order = await Order.findOne({
        "paygatePayment.walletData.ipn_token": id,
      });
    }

    const record = order || deposit;

    if (!record) {
      console.error(
        `[PayGate Status ${requestId}] Payment not found for identifier:`,
        id
      );
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    console.log(`[PayGate Status ${requestId}] Record found:`, {
      type: deposit ? "deposit" : "order",
      id: deposit?.depositId || order?.orderNumber,
      currentStatus: record.paygatePayment?.status || record.status,
      amount: record.amount,
    });

    // Check current status from database first
    const currentStatus = record.paygatePayment?.status || record.status;

    // If already completed, return immediately
    if (["completed", "paid", "confirmed"].includes(currentStatus)) {
      console.log(`[PayGate Status ${requestId}] ✅ Payment already completed`);
      return NextResponse.json({
        success: true,
        paymentId: id,
        status: "paid",
        isCompleted: true,
        isPending: false,
        isFailed: false,
        amount: record.amount,
        currency: record.paygatePayment?.currency || "USD",
        record: {
          id: deposit?.depositId || order?.orderNumber,
          amount: record.amount,
          status: record.status,
          type: deposit ? "deposit" : "order",
        },
        orderId: order?._id,
        orderNumber: order?.orderNumber,
      });
    }

    // Try to get payment status from PayGate API using IPN token
    let payment;
    let statusInfo = { isCompleted: false, isPending: true, isFailed: false };

    try {
      const ipnToken = record.paygatePayment?.walletData?.ipn_token;
      if (ipnToken) {
        console.log(
          `[PayGate Status ${requestId}] IPN token found, checking payment status via API...`
        );
        const result = await paygateService.checkPaymentStatus(ipnToken);
        payment = result.data;

        console.log(
          `[PayGate Status ${requestId}] PayGate API status response:`,
          {
            status: payment?.status,
            isPaid: payment?.status === "paid",
          }
        );

        // Update record if status changed to paid
        if (
          result.success &&
          ["paid", "completed", "confirmed"].includes(payment.status) &&
          record.status !== "completed"
        ) {
          console.log(
            `[PayGate Status ${requestId}] 💰 Payment confirmed! Updating record...`
          );

          // Update payment data
          if (record.paygatePayment) {
            record.paygatePayment.status = payment.status;
            record.paygatePayment.paymentData = {
              ...record.paygatePayment.paymentData,
              value_coin: payment.value_coin,
              txid_out: payment.txid_out,
              coin: payment.coin,
              confirmedAt: new Date(),
            };
          }

          // For deposits: Credit user balance
          if (deposit) {
            try {
              const user = await User.findById(deposit.userId);
              if (user) {
                const oldBalance = user.balance;
                user.balance += deposit.amount;
                await user.save();

                deposit.status = "completed";
                await deposit.save();

                console.log(
                  `[PayGate Status ${requestId}] ✅ User balance updated:`,
                  {
                    userId: user._id,
                    oldBalance,
                    newBalance: user.balance,
                    credited: deposit.amount,
                  }
                );
              }
            } catch (balanceError) {
              console.error(
                `[PayGate Status ${requestId}] ❌ Balance update failed:`,
                balanceError
              );
            }
          }

          // For orders: Use payment updater
          if (order) {
            await applyPaymentUpdate({
              order,
              gatewayKey: "paygatePayment",
              rawStatus: payment.status || "unpaid",
              gatewayFields: {
                status: payment.status === "paid" ? "paid" : "pending",
              },
            });
            console.log(
              `[PayGate Status ${requestId}] ✅ Order updated via payment updater`
            );
          }
        } else if (order) {
          // For orders, use payment updater even if not paid yet
          await applyPaymentUpdate({
            order,
            gatewayKey: "paygatePayment",
            rawStatus: payment?.status || "unpaid",
            gatewayFields: {
              status: payment?.status === "paid" ? "paid" : "pending",
            },
          });
        }

        statusInfo = paygateService.getStatusDescription(
          payment?.status || currentStatus
        );
      } else {
        // If no IPN token, use stored status
        console.log(
          `[PayGate Status ${requestId}] No IPN token, using stored status`
        );
        const storedStatus = record.paygatePayment?.status || "pending";
        statusInfo = paygateService.getStatusDescription(storedStatus);
        console.log(
          `[PayGate Status ${requestId}] Stored status:`,
          storedStatus
        );
      }
    } catch (apiError) {
      console.warn(
        `[PayGate Status ${requestId}] PayGate API error, using stored record status:`,
        {
          message: apiError.message,
          response: apiError.response?.data,
          status: apiError.response?.status,
        }
      );

      // If PayGate API fails, use the stored status from our database
      const storedStatus =
        record.paygatePayment?.status || record.status || "pending";
      statusInfo = paygateService.getStatusDescription(storedStatus);
    }

    const finalStatus =
      record.paygatePayment?.status || record.status || "pending";

    console.log(`[PayGate Status ${requestId}] Returning status response:`, {
      paymentId: id,
      status: finalStatus,
      isCompleted: statusInfo.isCompleted,
      isPending: statusInfo.isPending,
      isFailed: statusInfo.isFailed,
    });

    return NextResponse.json({
      success: true,
      paymentId: id,
      status: finalStatus,
      isCompleted: statusInfo.isCompleted,
      isPending: statusInfo.isPending,
      isFailed: statusInfo.isFailed,
      amount: record.amount,
      currency: record.paygatePayment?.currency || "USD",
      orderUpdated: !!order,
      orderId: order?._id,
      orderNumber: order?.orderNumber,
      record: deposit
        ? {
            id: deposit.depositId,
            amount: deposit.amount,
            status: deposit.status,
            type: "deposit",
          }
        : undefined,
    });
  } catch (error) {
    console.error(`[PayGate Status ${requestId}] Unexpected error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { error: error?.message || "Failed to get PayGate payment status" },
      { status: 500 }
    );
  }
}
