import { connectToDatabase } from "@/lib/db";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsServiceV2";
import { calculateServiceFee, formatFeeInfo } from "@/lib/paymentUtils";
import PaymentSettings from "@/models/PaymentSettings";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import CryptoPayment from "@/models/CryptoPayment";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      amount,
      currency = "USD",
      userId,
      customerEmail,
    } = await request.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Validate minimum amount ($1 for NOWPayments - actual minimum depends on coin)
    if (Number(amount) < 1) {
      return NextResponse.json(
        { 
          error: "Minimum deposit amount is $1",
          details: "NOWPayments requires a minimum of $1 USD equivalent. The actual minimum may vary slightly based on the cryptocurrency you choose."
        }, 
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get NOWPayments payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "nowpayment",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "NOWPayments payment method is not configured or active" },
        { status: 400 }
      );
    }

    // Calculate service fee
    const feeCalculation = calculateServiceFee(
      amount,
      paymentSettings.feeSettings
    );
    const finalAmount = feeCalculation.totalAmount;

    // Initialize NOWPayments service with fresh credentials from database
    await nowpaymentsService.initialize(paymentSettings);

    // Check if sandbox mode is enabled
    const isSandboxMode = paymentSettings.sandboxMode === true;

    const origin = new URL(request.url).origin;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate deposit ID
    const depositId = `deposit-nowpay-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Prepare metadata for NOWPayments
    const nowpaymentsMetadata = {
      user_id: userId,
      purpose: "deposit",
      deposit_id: depositId,
    };

    let result;

    if (isSandboxMode) {
      // SANDBOX MODE: Generate mock payment response
      const mockPaymentId = `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockPaymentUrl = `${origin}/sandbox-payment?depositId=${depositId}&amount=${finalAmount}&currency=${currency}`;
      
      result = {
        success: true,
        data: {
          payment_id: mockPaymentId,
          payment_status: "waiting",
          invoice_url: mockPaymentUrl,
          payment_url: mockPaymentUrl,
          price_amount: finalAmount,
          price_currency: currency.toLowerCase(),
          pay_currency: "btc",
          pay_amount: finalAmount,
          actually_paid: 0,
          order_id: depositId,
          order_description: `Wallet Deposit - $${amount}${feeCalculation.feeAmount > 0 ? ` (Fee: $${feeCalculation.feeAmount})` : ''}`,
          ipn_callback_url: `${origin}/api/payments/nowpayments/webhook`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sandbox_mode: true,
        },
      };
    } else {
      // PRODUCTION MODE: Create real invoice via NOWPayments API
      result = await nowpaymentsService.createInvoice({
        price_amount: Number(finalAmount),
        price_currency: currency.toLowerCase(),
        order_id: depositId,
        order_description: `Wallet Deposit - $${amount}${feeCalculation.feeAmount > 0 ? ` (Fee: $${feeCalculation.feeAmount})` : ''}`,
        ipn_callback_url: `${origin}/api/payments/nowpayments/webhook`,
        success_url: `${origin}/payment-success?order_id=${depositId}`,
        cancel_url: `${origin}/payment-cancel?order_id=${depositId}`,
        customer_email: customerEmail || user.email,
      });
    }

    if (!result.success) {
      throw new Error(result.error || "Failed to create payment in NOWPayments");
    }

    const payment = result.data;

    // Get payment URL from response (invoice URL for V2 service)
    const paymentUrl = payment.invoiceUrl || payment.invoice_url || 
                       payment.paymentUrl || payment.payment_url || "";

    if (!paymentUrl) {
      console.error("No payment URL in response:", payment);
      throw new Error("NOWPayments did not return a payment URL");
    }

    // CREATE CRYPTOPAYMENT RECORD (Required for webhook to work!)
    const cryptoPayment = new CryptoPayment({
      userId,
      userEmail: customerEmail || user.email,
      invoiceId: payment.invoiceId || payment.invoice_id || payment.purchaseId || payment.purchase_id,
      paymentId: payment.paymentId || payment.payment_id,
      orderId: depositId,
      paymentStatus: payment.paymentStatus || payment.payment_status || "waiting",
      internalStatus: "pending",
      priceAmount: Number(finalAmount),
      priceCurrency: currency.toUpperCase(),
      payCurrency: payment.payCurrency || payment.pay_currency || "btc",
      payAmount: Number(payment.payAmount || payment.pay_amount || 0),
      actuallyPaid: 0,
      payAddress: payment.payAddress || payment.pay_address || "",
      purchaseId: payment.purchaseId || payment.purchase_id,
      invoiceUrl: paymentUrl,
      orderDescription: `Wallet Deposit - $${amount}`,
      ipnCallbackUrl: `${origin}/api/payments/nowpayments/webhook`,
      successUrl: `${origin}/payment-success?order_id=${depositId}`,
      cancelUrl: `${origin}/payment-cancel?order_id=${depositId}`,
      metadata: {
        user_id: userId,
        purpose: "wallet-deposit",
        deposit_id: depositId,
        original_amount: Number(amount),
        service_fee: Number(feeCalculation.feeAmount),
        final_amount: Number(finalAmount),
        sandbox_mode: isSandboxMode,
      },
    });

    await cryptoPayment.save();

    // Create wallet deposit record (for tracking purposes)
    const deposit = new WalletDeposit({
      userId,
      amount: Number(amount), // Original amount user wants to deposit
      originalAmount: Number(amount), // Store original amount
      finalAmount: Number(finalAmount), // Final amount including fees
      serviceFee: Number(feeCalculation.feeAmount), // Service fee amount
      currency: currency.toUpperCase(),
      paymentMethod: "Cryptocurrency",
      paymentGateway: "NOWPayments",
      status: "pending",
      nowpaymentsPayment: {
        paymentId: payment.paymentId || payment.payment_id,
        orderId: depositId,
        status: payment.paymentStatus || payment.payment_status || "waiting",
        priceAmount: Number(finalAmount), // Store final amount
        priceCurrency: currency.toLowerCase(),
        payAmount: Number(payment.payAmount || payment.pay_amount || 0),
        payCurrency: payment.payCurrency || payment.pay_currency || "btc",
        actuallyPaid: 0, // Will be updated by webhook
        paymentUrl: paymentUrl,
        customerEmail: customerEmail || user.email,
        orderDescription: `Wallet Deposit - $${amount}`,
        callbackReceived: false,
        lastStatusUpdate: new Date(),
        metadata: {
          ...nowpaymentsMetadata,
          sandbox_mode: isSandboxMode, // Track if this is a sandbox payment
        },
      },
    });

    await deposit.save();

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      paymentId: payment.paymentId || payment.payment_id,
      checkoutUrl: paymentUrl,
      amount: finalAmount, // Return final amount
      originalAmount: amount, // Return original amount
      currency: currency.toUpperCase(),
      status: payment.paymentStatus || payment.payment_status || "waiting",
      // Include fee information in response
      feeInfo: {
        originalAmount: feeCalculation.originalAmount,
        serviceFee: feeCalculation.feeAmount,
        totalAmount: feeCalculation.totalAmount,
        feeType: feeCalculation.feeType,
        feePercentage: feeCalculation.feePercentage,
        feeDescription: formatFeeInfo(feeCalculation),
      },
    });
  } catch (error) {
    console.error("NOWPayments deposit error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || "Failed to create NOWPayments deposit" 
      },
      { status: 500 }
    );
  }
}
