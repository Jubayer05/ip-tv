import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import paygateService from '@/lib/paymentServices/paygateService';
import PaymentSettings from '@/models/PaymentSettings';
import WalletDeposit from '@/models/WalletDeposit';
import Order from '@/models/Order';
import User from '@/models/User';

/**
 * PayGate.to Webhook Handler
 * PayGate sends GET request with payment confirmation
 * 
 * Parameters received:
 * - value_coin: Amount paid in USDC
 * - coin: Coin type (polygon_usdc or polygon_usdt)
 * - txid_in: TX from provider to order wallet
 * - txid_out: Payout TX to merchant wallet
 * - address_in: Polygon address
 * - [your original callback params]: order_id, user_id, etc.
 */
export async function GET(request) {
  try {
    console.log('[PayGate Webhook] Received callback');

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);

    console.log('[PayGate Webhook] Parameters:', {
      valueCoin: params.value_coin,
      coin: params.coin,
      hasTxidIn: !!params.txid_in,
      hasTxidOut: !!params.txid_out,
      addressIn: params.address_in?.substring(0, 10) + '...',
      orderId: params.order_id,
      depositId: params.deposit_id
    });

    await connectToDatabase();

    // Verify callback parameters
    if (!paygateService.verifyCallbackParameters(params)) {
      return NextResponse.json(
        { error: 'Invalid callback parameters' },
        { status: 400 }
      );
    }

    const {
      value_coin,
      coin,
      txid_in,
      txid_out,
      address_in,
      order_id,
      deposit_id,
      user_id,
      purpose,
    } = params;

    // Determine if this is a deposit or order
    const isDeposit = purpose === 'deposit' || !!deposit_id;

    console.log('[PayGate Webhook] Processing:', {
      type: isDeposit ? 'deposit' : 'order',
      amount: value_coin,
      coin,
      id: deposit_id || order_id
    });

    if (isDeposit) {
      // Handle wallet deposit
      const deposit = await WalletDeposit.findOne({
        depositId: deposit_id,
      });

      if (!deposit) {
        console.error('[PayGate Webhook] Deposit not found:', deposit_id);
        return NextResponse.json(
          { error: 'Deposit not found' },
          { status: 404 }
        );
      }

      if (deposit.status === 'completed') {
        console.log('[PayGate Webhook] Deposit already processed');
        return NextResponse.json({
          success: true,
          message: 'Already processed'
        });
      }

      // Update deposit
      deposit.status = 'completed';
      deposit.processedAt = new Date();
      deposit.paygatePayment.status = 'completed';
      deposit.paygatePayment.transactionHash = txid_out;
      deposit.paygatePayment.providerTransactionHash = txid_in;
      deposit.paygatePayment.payoutAmount = Number(value_coin);
      deposit.paygatePayment.coinType = coin;

      await deposit.save();

      console.log('[PayGate Webhook] Deposit updated');

      // Credit user wallet
      const user = await User.findById(deposit.userId);
      if (user) {
        user.wallet = user.wallet || { balance: 0, currency: 'USD' };
        user.wallet.balance += deposit.amount;
        await user.save();

        console.log('[PayGate Webhook] Wallet credited:', {
          userId: user._id,
          amount: deposit.amount,
          newBalance: user.wallet.balance
        });
      }

      console.log('[PayGate Webhook] Deposit completed successfully');

      return NextResponse.json({
        success: true,
        message: 'Deposit processed'
      });

    } else {
      // Handle subscription order
      const order = await Order.findOne({
        orderId: order_id,
      });

      if (!order) {
        console.error('[PayGate Webhook] Order not found:', order_id);
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      if (order.paymentStatus === 'completed') {
        console.log('[PayGate Webhook] Order already processed');
        return NextResponse.json({
          success: true,
          message: 'Already processed'
        });
      }

      // Update order
      order.paymentStatus = 'completed';
      order.status = 'completed';
      order.paidAt = new Date();
      
      if (order.paygatePayment) {
        order.paygatePayment.status = 'completed';
        order.paygatePayment.transactionHash = txid_out;
        order.paygatePayment.providerTransactionHash = txid_in;
        order.paygatePayment.payoutAmount = Number(value_coin);
        order.paygatePayment.coinType = coin;
      }

      await order.save();

      console.log('[PayGate Webhook] Order completed successfully');

      // TODO: Activate subscription
      // TODO: Create IPTV credentials
      // TODO: Send confirmation email

      return NextResponse.json({
        success: true,
        message: 'Order processed'
      });
    }

  } catch (error) {
    console.error('[PayGate Webhook] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    error: 'PayGate webhooks use GET method, not POST'
  }, { status: 405 });
}
