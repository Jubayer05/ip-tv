import { connectToDatabase } from "@/lib/db";
import { applyPaymentUpdate } from "@/lib/payments/paymentUpdater";
import paygateService from "@/lib/paymentServices/paygateService";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import WebhookLog from "@/models/WebhookLog";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestId = `WEBHOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`[PayGate Webhook ${requestId}] Webhook callback received`);
    
    await connectToDatabase();

    // Get PayGate payment settings
    console.log(`[PayGate Webhook ${requestId}] Fetching PayGate settings...`);
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "paygate",
      isActive: true,
    });

    if (paymentSettings?.webhookSecret) {
      console.log(`[PayGate Webhook ${requestId}] Configuring webhook secret`);
      paygateService.setWebhookSecret(paymentSettings.webhookSecret);
    }

    // PayGate sends callback as GET request with query parameters
    const { searchParams } = new URL(request.url);
    console.log(`[PayGate Webhook ${requestId}] Query parameters received:`, {
      orderNumber: searchParams.get("orderNumber") || searchParams.get("number"),
      userId: searchParams.get("userId"),
      purpose: searchParams.get("purpose"),
      status: searchParams.get("status"),
      hasIpnToken: !!searchParams.get("ipn_token"),
      coin: searchParams.get("coin"),
      valueCoin: searchParams.get("value_coin")
    });

    // Extract all callback parameters according to PayGate API documentation
    const callbackData = {
      // Original parameters from your callback URL (these will vary)
      orderNumber: searchParams.get("orderNumber") || searchParams.get("number"),
      userId: searchParams.get("userId"),
      purpose: searchParams.get("purpose"),

      // PayGate payment data (from API documentation)
      value_coin: searchParams.get("value_coin"), // Amount of USDC paid
      coin: searchParams.get("coin"), // Usually "polygon_usdc" or "polygon_usdt"
      txid_in: searchParams.get("txid_in"), // Polygon TXID from provider to order wallet
      txid_out: searchParams.get("txid_out"), // Instant payout TXID to merchant wallet
      address_in: searchParams.get("address_in"), // Should match polygon_address_in from step 1
      status: searchParams.get("status") || "paid", // Payment status
      ipn_token: searchParams.get("ipn_token"), // IPN token for verification
    };

    // 🔍 Detect payment type from callback parameters
    const isCryptoPayment = callbackData.coin && callbackData.txid_in;
    const isCardPayment = !isCryptoPayment; // Existing card flow

    console.log(`[PayGate Webhook ${requestId}] Callback data extracted:`, {
      orderNumber: callbackData.orderNumber,
      purpose: callbackData.purpose,
      valueCoin: callbackData.value_coin,
      coin: callbackData.coin,
      status: callbackData.status,
      addressIn: callbackData.address_in?.substring(0, 10) + '...',
      paymentType: isCryptoPayment ? 'CRYPTO' : 'CARD',
      hasTxidIn: !!callbackData.txid_in
    });

    // Log webhook received
    console.log(`[PayGate Webhook ${requestId}] Creating webhook log...`);
    await WebhookLog.create({
      provider: "paygate",
      eventType: isCryptoPayment ? "crypto_payment_callback" : "card_payment_callback",
      payload: callbackData,
      processed: false,
      receivedAt: new Date(),
    });

    // Verify callback parameters
    console.log(`[PayGate Webhook ${requestId}] Verifying callback parameters...`);
    if (!paygateService.verifyCallbackParameters(callbackData)) {
      console.warn(`[PayGate Webhook ${requestId}] Invalid PayGate callback parameters:`, callbackData);
      return NextResponse.json(
        { received: true, warning: "Invalid parameters" },
        { status: 400 }
      );
    }
    console.log(`[PayGate Webhook ${requestId}] Parameters verified successfully`);

    // Find order/deposit by IPN token OR order number OR address
    let order = null;
    let deposit = null;

    // First try to find by IPN token (most reliable)
    if (callbackData.ipn_token) {
      console.log(`[PayGate Webhook ${requestId}] Searching by IPN token:`, callbackData.ipn_token?.substring(0, 10) + '...');
      
      deposit = await WalletDeposit.findOne({
        "paygatePayment.walletData.ipn_token": callbackData.ipn_token,
      }).populate("userId", "email username balance");

      order = await Order.findOne({
        "paygatePayment.walletData.ipn_token": callbackData.ipn_token,
      });
    }

    // Fallback: Search by order number
    if (!order && !deposit && callbackData.orderNumber) {
      console.log(`[PayGate Webhook ${requestId}] Searching by orderNumber:`, callbackData.orderNumber);
      order = await Order.findOne({ orderNumber: callbackData.orderNumber });
      deposit = await WalletDeposit.findOne({ depositId: callbackData.orderNumber });
    }

    // Fallback: Search by address
    if (!order && !deposit && callbackData.address_in) {
      console.log(`[PayGate Webhook ${requestId}] Searching by address_in:`, callbackData.address_in?.substring(0, 10) + '...');
      order = await Order.findOne({
        "paygatePayment.walletData.polygon_address_in": callbackData.address_in,
      });
      deposit = await WalletDeposit.findOne({
        "paygatePayment.walletData.polygon_address_in": callbackData.address_in,
      });
    }

    if (!order && !deposit) {
      console.warn(`[PayGate Webhook ${requestId}] ❌ No order or deposit found for callback:`, {
        ipnToken: callbackData.ipn_token?.substring(0, 10),
        orderNumber: callbackData.orderNumber,
        addressIn: callbackData.address_in?.substring(0, 10)
      });
      return NextResponse.json({ received: true, warning: "Payment record not found" });
    }

    const record = order || deposit;
    const recordType = order ? 'order' : 'deposit';

    console.log(`[PayGate Webhook ${requestId}] Record found:`, {
      type: recordType,
      id: order?.orderNumber || deposit?.depositId,
      currentStatus: record.paygatePayment?.status,
      amount: record.amount || record.totalAmount
    });

    // Verify the address matches (security check)
    const storedAddress = record.paygatePayment?.walletData?.polygon_address_in;
    if (storedAddress && storedAddress !== callbackData.address_in) {
      console.error(`[PayGate Webhook ${requestId}] ❌ Address mismatch:`, {
        stored: storedAddress,
        received: callbackData.address_in,
        recordId: order?.orderNumber || deposit?.depositId,
      });
      return NextResponse.json({ received: true, error: "Address mismatch" });
    }
    console.log(`[PayGate Webhook ${requestId}] ✅ Address verification passed`);

    // 🆕 Store crypto-specific transaction data
    let cryptoTxData = {};
    if (isCryptoPayment) {
      console.log(`[PayGate Webhook ${requestId}] 💰 Processing crypto transaction...`);
      
      const networkFromCoin = callbackData.coin.includes('polygon') ? 'polygon' : 
                              callbackData.coin.includes('trc20') ? 'tron' : 
                              callbackData.coin.includes('ethereum') ? 'ethereum' : 
                              callbackData.coin.includes('btc') ? 'bitcoin' : 'unknown';

      cryptoTxData = {
        coin: callbackData.coin,
        network: networkFromCoin,
        txid_in: callbackData.txid_in,
        txid_out: callbackData.txid_out,
        value_coin: callbackData.value_coin,
        confirmedAt: new Date(),
      };

      console.log(`[PayGate Webhook ${requestId}] Crypto transaction data:`, {
        network: networkFromCoin,
        coin: callbackData.coin,
        value: callbackData.value_coin,
        txIn: callbackData.txid_in?.substring(0, 20) + '...',
        txOut: callbackData.txid_out?.substring(0, 20) + '...'
      });
    }

    const purpose = record.paygatePayment?.metadata?.purpose || (deposit ? "deposit" : "order");
    const userIdMeta =
      record.paygatePayment?.metadata?.user_id || record.userId?.toString() || "";

    console.log(`[PayGate Webhook ${requestId}] Payment purpose: ${purpose}`);

    // Handle deposit completion
    if (deposit) {
      console.log(`[PayGate Webhook ${requestId}] Processing deposit completion...`);
      
      // Update deposit payment data
      deposit.paygatePayment.status = 'paid';
      deposit.paygatePayment.callbackReceived = true;
      deposit.paygatePayment.lastStatusUpdate = new Date();
      deposit.paygatePayment.paymentData = {
        ...deposit.paygatePayment.paymentData,
        ...callbackData,
        ...cryptoTxData
      };

      // Credit user balance if not already completed
      if (deposit.status !== 'completed') {
        const user = await User.findById(deposit.userId);
        if (user) {
          const oldBalance = user.balance;
          user.balance += deposit.amount;
          await user.save();

          deposit.status = 'completed';
          await deposit.save();

          console.log(`[PayGate Webhook ${requestId}] ✅ Deposit completed:`, {
            depositId: deposit.depositId,
            amount: deposit.amount,
            oldBalance,
            newBalance: user.balance,
            paymentType: isCryptoPayment ? 'crypto' : 'card'
          });

          return NextResponse.json({
            received: true,
            processed: true,
            depositId: deposit.depositId,
            status: 'completed',
            balance: user.balance
          });
        }
      }

      console.log(`[PayGate Webhook ${requestId}] Deposit already completed`);
      return NextResponse.json({ received: true, processed: false, reason: 'already_completed' });
    }

    // Handle order completion (existing logic)
    if (order) {
      console.log(`[PayGate Webhook ${requestId}] Processing order completion...`);
    
      // Update order with payment completion
      console.log(`[PayGate Webhook ${requestId}] Applying payment update to order...`);
      await applyPaymentUpdate({
        order,
        gatewayKey: "paygatePayment",
        rawStatus: "paid",
        gatewayFields: {
          status: "paid",
          callbackReceived: true,
          paymentData: { ...callbackData, ...cryptoTxData },
          lastStatusUpdate: new Date(),
        },
        onCompleted: async ({ order }) => {
          if (purpose === "deposit") {
            console.log(`[PayGate Webhook ${requestId}] Processing deposit completion...`);
            // Credit user balance with order.totalAmount
            const userId = userIdMeta || order.userId?.toString();
            if (userId) {
              console.log(`[PayGate Webhook ${requestId}] Fetching user:`, userId);
              const user = await User.findById(userId);
              if (user) {
                const creditAmount = Number(callbackData.value_coin || order.totalAmount || 0);
                const previousBalance = Number(user.balance || 0);
                user.balance = previousBalance + creditAmount;
                await user.save();
                console.log(`[PayGate Webhook ${requestId}] User balance credited:`, {
                  userId,
                  previousBalance,
                  creditAmount,
                  newBalance: user.balance
                });
              } else {
                console.warn(`[PayGate Webhook ${requestId}] User not found for crediting:`, userId);
              }
            } else {
              console.warn(`[PayGate Webhook ${requestId}] No userId available for crediting`);
            }
          }
        },
      });
      console.log(`[PayGate Webhook ${requestId}] Order payment update completed`);

      console.log(`[PayGate Webhook ${requestId}] Webhook processing completed successfully`);
      return NextResponse.json({ 
        received: true, 
        success: true,
        orderNumber: order.orderNumber,
        status: "paid"
      });
    }

    // Fallback response
    console.log(`[PayGate Webhook ${requestId}] No action taken - no matching record found`);
    return NextResponse.json({ received: true, warning: "No action taken" });
    
  } catch (error) {
    console.error(`[PayGate Webhook ${requestId}] Unexpected error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Log webhook error
    try {
      await WebhookLog.create({
        provider: "paygate",
        eventType: "webhook_error",
        payload: { error: error.message },
        processed: false,
        receivedAt: new Date(),
      });
    } catch (logError) {
      console.error(`[PayGate Webhook ${requestId}] Failed to log webhook error:`, logError);
    }

    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    message: "PayGate webhook endpoint - use GET for callbacks",
  });
}
