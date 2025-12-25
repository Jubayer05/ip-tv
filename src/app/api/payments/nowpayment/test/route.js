import { connectToDatabase } from "@/lib/db";
import PaymentSettings from "@/models/PaymentSettings";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🧪 Testing NOWPayments API connection...");

    await connectToDatabase();

    // Get settings from database
    const settings = await PaymentSettings.findOne({
      gateway: "nowpayment",
      isActive: true,
    });

    if (!settings) {
      return NextResponse.json({
        success: false,
        error: "NOWPayments not configured in database",
        suggestion: "Add NOWPayments in Admin → Payment Settings",
      }, { status: 500 });
    }

    console.log("📋 Current Settings:", {
      hasApiKey: !!settings.apiKey,
      apiKeyLength: settings.apiKey?.length,
      apiKeyPrefix: settings.apiKey?.substring(0, 8),
      hasIpnSecret: !!settings.ipnSecret,
      sandboxMode: settings.sandboxMode,
    });

    // Configure service
    nowpaymentsService.setApiKey(settings.apiKey);
    if (settings.ipnSecret) {
      nowpaymentsService.setIpnSecret(settings.ipnSecret);
    }
    if (settings.sandboxMode) {
      nowpaymentsService.setSandboxMode(true);
    }

    console.log("🔧 Service Configuration:", {
      baseUrl: nowpaymentsService.baseUrl,
      hasApiKey: !!nowpaymentsService.apiKey,
      hasIpnSecret: !!nowpaymentsService.ipnSecret,
      sandboxMode: nowpaymentsService.sandboxMode,
    });

    const tests = {};
    let allTestsPassed = true;

    // Test 1: Get Available Currencies
    console.log("📡 Test 1: Fetching available currencies...");
    try {
      const currenciesResult = await nowpaymentsService.getAvailableCurrencies();
      tests.currencies = {
        success: currenciesResult.success,
        count: currenciesResult.currencies?.length,
        sample: currenciesResult.currencies?.slice(0, 10),
      };
      console.log("✅ Currencies test passed:", tests.currencies.count, "currencies found");
    } catch (error) {
      tests.currencies = {
        success: false,
        error: error.message,
      };
      allTestsPassed = false;
      console.error("❌ Currencies test failed:", error.message);
    }

    // Test 2: Get Minimum Payment Amount
    console.log("📡 Test 2: Getting minimum payment amount for BTC...");
    try {
      const minResult = await nowpaymentsService.getMinimumPaymentAmount("btc");
      tests.minimumAmount = {
        success: true,
        minAmount: minResult.minAmount,
        currency: "BTC",
      };
      console.log("✅ Minimum amount test passed:", minResult.minAmount, "BTC");
    } catch (error) {
      tests.minimumAmount = {
        success: false,
        error: error.message,
      };
      allTestsPassed = false;
      console.error("❌ Minimum amount test failed:", error.message);
    }

    // Test 3: Get Estimated Price
    console.log("📡 Test 3: Getting estimated price for 100 USD → BTC...");
    try {
      const estimateResult = await nowpaymentsService.getEstimatedPrice(100, "usd", "btc");
      tests.estimate = {
        success: true,
        amount: estimateResult.data.amountFrom,
        currency: estimateResult.data.currencyFrom,
        estimatedAmount: estimateResult.data.estimatedAmount,
        estimatedCurrency: estimateResult.data.currencyTo,
      };
      console.log("✅ Estimate test passed:", estimateResult.data.estimatedAmount, "BTC");
    } catch (error) {
      tests.estimate = {
        success: false,
        error: error.message,
      };
      allTestsPassed = false;
      console.error("❌ Estimate test failed:", error.message);
    }

    // Test 4: Check Environment Variables
    console.log("📡 Test 4: Checking environment variables...");
    const envVars = {
      APP_BASE_URL: !!process.env.APP_BASE_URL,
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
      NOWPAYMENTS_SUCCESS_URL: !!process.env.NOWPAYMENTS_SUCCESS_URL,
      NOWPAYMENTS_CANCEL_URL: !!process.env.NOWPAYMENTS_CANCEL_URL,
      NOWPAYMENTS_IPN_URL: !!process.env.NOWPAYMENTS_IPN_URL,
    };
    tests.environment = {
      success: true,
      variables: envVars,
      urls: {
        base: process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL,
        success: process.env.NOWPAYMENTS_SUCCESS_URL,
        cancel: process.env.NOWPAYMENTS_CANCEL_URL,
        ipn: process.env.NOWPAYMENTS_IPN_URL,
      },
    };

    return NextResponse.json({
      success: allTestsPassed,
      message: allTestsPassed 
        ? "✅ All NOWPayments tests passed! Your integration is ready."
        : "⚠️ Some tests failed. Check the details below.",
      configuration: {
        sandboxMode: settings.sandboxMode,
        baseUrl: nowpaymentsService.baseUrl,
        hasApiKey: !!settings.apiKey,
        hasIpnSecret: !!settings.ipnSecret,
      },
      tests,
      summary: {
        currenciesAvailable: tests.currencies?.count || 0,
        minimumBtcAmount: tests.minimumAmount?.minAmount || "N/A",
        usd100ToBtc: tests.estimate?.estimatedAmount || "N/A",
      },
    });

  } catch (error) {
    console.error("❌ Test failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack,
    }, { status: 500 });
  }
}
