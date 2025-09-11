import { connectToDatabase } from "@/lib/db";
import changenowService from "@/lib/paymentServices/changenowService";
import PaymentSettings from "@/models/PaymentSettings";
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

    // Get ChangeNOW payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "changenow",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "ChangeNOW payment method is not configured or active" },
        { status: 400 }
      );
    }

    // Update the service with database credentials
    changenowService.apiKey = paymentSettings.apiKey;
    if (paymentSettings.apiSecret) {
      changenowService.apiSecret = paymentSettings.apiSecret;
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Step 1: Convert fiat to crypto with a realistic rate
    // 1 USD = 1 USDT (approximately, for simplicity)
    const cryptoAmount = Number(amount).toFixed(2); // Keep as USDT amount

    // Check if the amount meets ChangeNOW's minimum requirement
    const minAmount = paymentSettings.minAmount || 2.733971; // Use database min amount
    if (Number(cryptoAmount) < minAmount) {
      return NextResponse.json(
        {
          error: `Minimum deposit amount is $${minAmount} USDT. You tried to deposit $${cryptoAmount} USDT.`,
          minAmount: minAmount,
        },
        { status: 400 }
      );
    }

    // Step 2: Get estimated exchange from USDT to BTC (using the same method as create route)
    let estimatedAmount = 0;
    try {
      const estimateResult = await changenowService.getEstimatedExchangeAmount(
        cryptoAmount,
        "usdt", // From USDT
        "eth" // To BTC
      );
      console.log("Estimate result:", estimateResult); // Debug log
      estimatedAmount = estimateResult?.data?.estimatedAmount || 0;
    } catch (estimateError) {
      console.warn(
        "Failed to get estimated amount, using fallback:",
        estimateError.message
      );
      // Use a rough estimate: 1 USDT ≈ 0.00002 BTC (this is just a fallback)
      estimatedAmount = Number(cryptoAmount) * 0.00002;
    }

    // Ensure we have a valid estimated amount
    if (!estimatedAmount || estimatedAmount <= 0) {
      estimatedAmount = Number(cryptoAmount) * 0.00002; // Fallback calculation
    }

    // Step 3: Use wallet address from database or fallback
    const btcReceiveAddress = paymentSettings?.merchantId;

    // Step 4: Create the exchange transaction (using the same method as create route)
    const result = await changenowService.createTransaction({
      fromCurrency: "usdt",
      toCurrency: "eth",
      fromAmount: cryptoAmount,
      toAmount: estimatedAmount.toString(),
      address: btcReceiveAddress,
      extraId: "",
      refundAddress: "",
      refundExtraId: "",
      userId: userId || "",
      contactEmail: customerEmail || "",
      flow: "standard",
      type: "direct",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to create ChangeNOW transaction" },
        { status: 400 }
      );
    }

    // Step 5: Create wallet deposit record
    const deposit = new WalletDeposit({
      userId,
      amount: Number(amount),
      currency,
      status: "pending",
      gateway: "changenow",
      paymentGateway: "changenow", // Added missing required field
      paymentMethod: "Cryptocurrency", // Added missing required field
      changenowPayment: {
        transactionId: result.transactionId,
        fromCurrency: result.fromCurrency,
        toCurrency: result.toCurrency,
        fromAmount: result.fromAmount,
        toAmount: result.toAmount,
        payinAddress: result.payinAddress,
        payoutAddress: result.payoutAddress,
        status: result.status || "new",
        payinExtraId: result.payinExtraId || "",
        refundAddress: result.refundAddress || "",
        refundExtraId: result.refundExtraId || "",
        userId: userId || "",
        contactEmail: customerEmail || "",
        flow: "standard",
        callbackReceived: false,
        lastStatusUpdate: new Date(),
      },
      metadata: {
        originalAmount: amount,
        originalCurrency: currency,
        convertedAmount: cryptoAmount,
        convertedCurrency: "usdt",
        finalCurrency: "eth",
        finalAmount: estimatedAmount,
      },
    });

    await deposit.save();

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      paymentId: result.transactionId, // Frontend expects paymentId
      checkoutUrl: `https://changenow.io/exchange/txs/${result.transactionId}`, // Frontend expects checkoutUrl
      transactionId: result.transactionId,
      payinAddress: result.payinAddress,
      payoutAddress: result.payoutAddress,
      fromAmount: result.fromAmount,
      toAmount: result.toAmount,
      fromCurrency: result.fromCurrency,
      toCurrency: result.toCurrency,
      status: result.status || "new",
      amount: amount, // Frontend expects amount
      currency: currency, // Frontend expects currency
      instructions: `Send ${result.fromAmount} ${
        result.fromCurrency
      } to address: ${result.payinAddress}${
        result.payinExtraId ? ` with memo: ${result.payinExtraId}` : ""
      }`,
      message: "Deposit initiated. Please send USDT to the provided address.",
    });
  } catch (error) {
    console.error("ChangeNOW deposit error:", error);
    return NextResponse.json(
      { error: error.message || "Deposit failed" },
      { status: 500 }
    );
  }
}
