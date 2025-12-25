import { connectToDatabase } from "@/lib/db";
import paygateService from "@/lib/paymentServices/paygateService";
import { calculateServiceFee, formatFeeInfo } from "@/lib/paymentUtils";
import PaymentSettings from "@/models/PaymentSettings";
import User from "@/models/User";
import WalletDeposit from "@/models/WalletDeposit";
import { NextResponse } from "next/server";

export async function POST(request) {
  const requestId = `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`[PayGate Deposit ${requestId}] Request started`);
    
    const {
      amount,
      currency = "USD",
      userId,
      customerEmail,
      provider, // REQUIRED: Payment provider code
      userRegion
    } = await request.json();

    console.log(`[PayGate Deposit ${requestId}] Request parameters:`, {
      amount,
      currency,
      userId,
      customerEmail: customerEmail ? '***@' + customerEmail.split('@')[1] : undefined,
      provider,
      userRegion
    });

    if (!amount || Number(amount) <= 0) {
      console.error(`[PayGate Deposit ${requestId}] Invalid amount:`, amount);
      return NextResponse.json({ 
        success: false,
        error: "Invalid amount" 
      }, { status: 400 });
    }

    if (!userId) {
      console.error(`[PayGate Deposit ${requestId}] Missing userId`);
      return NextResponse.json({
        success: false,
        error: "User ID is required"
      }, { status: 400 });
    }

    // Validate provider is specified
    if (!provider) {
      console.error(`[PayGate Deposit ${requestId}] Provider not specified`);
      return NextResponse.json({
        success: false,
        error: "Payment provider is required. Please select a payment method."
      }, { status: 400 });
    }

    // Validate provider is supported
    try {
      const providerConfig = paygateService.validateProvider(provider);
      console.log(`[PayGate Deposit ${requestId}] Provider validated:`, {
        code: provider,
        name: providerConfig.name,
        type: providerConfig.type,
        minAmount: providerConfig.minAmount,
        network: providerConfig.network || providerConfig.provider
      });

      // Check minimum amount
      if (amount < providerConfig.minAmount) {
        console.error(`[PayGate Deposit ${requestId}] Amount below minimum:`, {
          amount,
          minAmount: providerConfig.minAmount,
          provider: providerConfig.name
        });
        return NextResponse.json({
          success: false,
          error: `Minimum amount for ${providerConfig.name} is $${providerConfig.minAmount}`
        }, { status: 400 });
      }
    } catch (providerError) {
      console.error(`[PayGate Deposit ${requestId}] Invalid provider:`, {
        provider,
        error: providerError.message
      });
      return NextResponse.json({
        success: false,
        error: providerError.message
      }, { status: 400 });
    }

    console.log(`[PayGate Deposit ${requestId}] Connecting to database...`);
    await connectToDatabase();

    // Get PayGate payment settings from database
    console.log(`[PayGate Deposit ${requestId}] Fetching PayGate settings...`);
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "paygate",
      isActive: true,
    });

    if (!paymentSettings) {
      console.error(`[PayGate Deposit ${requestId}] PayGate settings not found or inactive`);
      return NextResponse.json(
        { error: "PayGate payment method is not configured or active" },
        { status: 400 }
      );
    }

    console.log(`[PayGate Deposit ${requestId}] PayGate settings found:`, {
      gateway: paymentSettings.gateway,
      isActive: paymentSettings.isActive,
      hasMerchantId: !!paymentSettings.merchantId,
      hasWebhookSecret: !!paymentSettings.webhookSecret,
      hasFeeSettings: !!paymentSettings.feeSettings
    });

    // Calculate service fee
    console.log(`[PayGate Deposit ${requestId}] Calculating service fee...`);
    const feeCalculation = calculateServiceFee(
      amount,
      paymentSettings.feeSettings
    );
    const finalAmount = feeCalculation.totalAmount;
    
    console.log(`[PayGate Deposit ${requestId}] Fee calculation:`, {
      originalAmount: feeCalculation.originalAmount,
      feeAmount: feeCalculation.feeAmount,
      feeType: feeCalculation.feeType,
      feePercentage: feeCalculation.feePercentage,
      totalAmount: feeCalculation.totalAmount
    });

    // Get the merchant address from the correct field
    const merchantAddress = paymentSettings.merchantId;

    if (!merchantAddress) {
      console.error(`[PayGate Deposit ${requestId}] Merchant address not configured`);
      return NextResponse.json(
        {
          error: "PayGate merchant address not configured",
          details:
            "Please configure the merchant address (merchantId) in PayGate payment settings",
        },
        { status: 400 }
      );
    }

    console.log(`[PayGate Deposit ${requestId}] Configuring PayGate service:`, {
      merchantAddress: merchantAddress.substring(0, 8) + '...',
      hasWebhookSecret: !!paymentSettings.webhookSecret
    });

    paygateService.setMerchantAddress(merchantAddress);
    
    // Set webhook secret if configured
    if (paymentSettings.webhookSecret) {
      paygateService.setWebhookSecret(paymentSettings.webhookSecret);
    }

    const origin = new URL(request.url).origin;

    // Verify user exists
    console.log(`[PayGate Deposit ${requestId}] Verifying user exists:`, userId);
    const user = await User.findById(userId);
    if (!user) {
      console.error(`[PayGate Deposit ${requestId}] User not found:`, userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log(`[PayGate Deposit ${requestId}] User verified:`, {
      email: user.email,
      hasWallet: !!user.wallet
    });

    // Prepare metadata for PayGate
    const depositId = `deposit-paygate-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const paygateMetadata = {
      user_id: userId,
      purpose: "deposit",
      deposit_id: depositId,
      provider: provider,
    };

    console.log(`[PayGate Deposit ${requestId}] PayGate metadata prepared:`, paygateMetadata);

    let payment;
    let paygatePaymentData = {
      status: "pending",
      amount: Number(finalAmount), // Use final amount including fees
      currency: currency.toUpperCase(),
      customerEmail: customerEmail || "",
      description: `Wallet Deposit${
        feeCalculation.feeAmount > 0
          ? ` (${formatFeeInfo(feeCalculation)})`
          : ""
      }`,
      callbackReceived: false,
      lastStatusUpdate: new Date(),
      metadata: paygateMetadata,
      provider: provider,
    };

    console.log(`[PayGate Deposit ${requestId}] Payment parameters:`, {
      amount: finalAmount,
      currency,
      customerEmail: customerEmail ? '***@' + customerEmail.split('@')[1] : undefined,
      description: paygatePaymentData.description,
      callbackUrl: `${origin}/api/payments/paygate/webhook`,
      successUrl: `${origin}/payment-success?order_id=${depositId}`,
      cancelUrl: `${origin}/payment-cancel?order_id=${depositId}`,
      provider,
      userRegion
    });

    try {
      // Create PayGate payment with final amount
      console.log(`[PayGate Deposit ${requestId}] Calling PayGate API...`);
      const result = await paygateService.createPayment({
        amount: finalAmount, // Use final amount including fees
        currency,
        customerEmail: customerEmail || user.email,
        description: `Wallet Deposit${
          feeCalculation.feeAmount > 0
            ? ` (${formatFeeInfo(feeCalculation)})`
            : ""
        }`,
        callbackUrl: `${origin}/api/payments/paygate/webhook`,
        successUrl: `${origin}/payment-success?order_id=${depositId}`,
        cancelUrl: `${origin}/payment-cancel?order_id=${depositId}`,
        provider, // Pass selected provider
        userRegion,
        metadata: paygateMetadata,
      });

      payment = result.data;
      
      console.log(`[PayGate Deposit ${requestId}] PayGate API response:`, {
        paymentId: payment?.id,
        status: payment?.status,
        hasPaymentUrl: !!payment?.payment_url,
        hasWalletData: !!payment?.wallet_data,
        provider: payment?.provider,
        providerType: payment?.metadata?.providerType,
        providerName: payment?.metadata?.providerName
      });

      // Update PayGate payment data with API response
      paygatePaymentData = {
        ...paygatePaymentData,
        paymentId: payment.id,
        paymentUrl: payment.payment_url,
        walletData: payment.wallet_data,
        providerType: payment.metadata?.providerType, // Store provider type
      };

      // 🆕 ADD: Store crypto-specific data for crypto providers
      if (payment.metadata?.providerType === 'crypto') {
        console.log(`[PayGate Deposit ${requestId}] 💰 Crypto payment detected - storing crypto details...`);
        
        const cryptoNetwork = payment.metadata?.network || providerConfig.network;
        const cryptoCurrency = payment.metadata?.providerName?.includes('USDT') ? 'USDT' : 
                               payment.metadata?.providerName?.includes('USDC') ? 'USDC' :
                               payment.metadata?.providerName?.includes('Bitcoin') ? 'BTC' :
                               payment.metadata?.providerName?.includes('Ethereum') ? 'ETH' : 
                               providerConfig.currency?.toUpperCase() || 'USDT';

        paygatePaymentData.cryptoDetails = {
          network: cryptoNetwork,
          coin: cryptoCurrency,
          walletAddress: payment.wallet_data.address_in,
          polygonAddress: payment.wallet_data.polygon_address_in,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours expiration
          instructions: {
            amount: finalAmount,
            currency: cryptoCurrency,
            network: cryptoNetwork,
            message: `Send exactly ${finalAmount} ${cryptoCurrency} to the address above on ${cryptoNetwork} network.`
          }
        };

        console.log(`[PayGate Deposit ${requestId}] Crypto details stored:`, {
          network: cryptoNetwork,
          coin: cryptoCurrency,
          walletAddress: payment.wallet_data.address_in?.substring(0, 15) + '...',
          expiresIn: '2 hours'
        });
      }

      console.log(`[PayGate Deposit ${requestId}] Updated payment data with API response`);
    } catch (apiError) {
      console.error(`[PayGate Deposit ${requestId}] PayGate API Error:`, {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status,
        stack: apiError.stack
      });
      return NextResponse.json(
        {
          success: false,
          error: "PayGate payment creation failed",
          details: apiError.message,
        },
        { status: 500 }
      );
    }

    // Create wallet deposit record
    console.log(`[PayGate Deposit ${requestId}] Creating wallet deposit record...`);
    const deposit = new WalletDeposit({
      userId,
      amount: Number(amount), // Original amount
      finalAmount: Number(finalAmount), // Final amount including fees
      serviceFee: Number(feeCalculation.feeAmount), // Service fee amount
      currency,
      paymentMethod: "Crypto",
      paymentGateway: "PayGate",
      paygatePayment: paygatePaymentData,
    });

    console.log(`[PayGate Deposit ${requestId}] Saving deposit to database...`);
    await deposit.save();
    console.log(`[PayGate Deposit ${requestId}] Deposit saved successfully:`, {
      depositId: deposit.depositId,
      paymentId: payment.id,
      amount: finalAmount,
      status: deposit.status
    });

    console.log(`[PayGate Deposit ${requestId}] Returning success response`);
    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      paymentId: payment.id,
      checkoutUrl: payment.payment_url,
      amount: finalAmount, // Return final amount
      currency,
      status: "pending",
      // Provider information
      provider: {
        code: payment.provider,
        name: payment.metadata?.providerName,
        type: payment.metadata?.providerType,
        network: payment.metadata?.network
      },
      walletAddress: payment.wallet_data?.polygon_address_in,
      // 🆕 Include wallet data for crypto payments
      walletData: payment.wallet_data,
      // 🆕 Include crypto details if crypto payment
      cryptoDetails: payment.metadata?.providerType === 'crypto' ? paygatePaymentData.cryptoDetails : undefined,
      // Include fee information in response
      feeInfo: {
        originalAmount: feeCalculation.originalAmount,
        serviceFee: feeCalculation.feeAmount,
        totalAmount: feeCalculation.totalAmount,
        feeType: feeCalculation.feeType,
        feePercentage: feeCalculation.feePercentage,
        feeDescription: formatFeeInfo(feeCalculation),
      },
      message: `Payment created via ${payment.metadata?.providerName || provider}`
    });
  } catch (error) {
    console.error(`[PayGate Deposit ${requestId}] Unexpected error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: error?.message || "Failed to create PayGate deposit" },
      { status: 500 }
    );
  }
}
