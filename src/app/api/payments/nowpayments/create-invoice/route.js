import { connectToDatabase } from "@/lib/db";
import PaymentSettings from "@/models/PaymentSettings";
import CryptoPayment from "@/models/CryptoPayment";
import User from "@/models/User";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsServiceV2";
import { NextResponse } from "next/server";

/**
 * POST /api/payments/nowpayments/create-invoice
 * Create a new NOWPayments invoice for crypto deposit
 */
export async function POST(request) {
  const startTime = Date.now();
  
  try {
    console.log("📥 Received invoice creation request");

    // Parse request body
    const body = await request.json();
    const { amount, userId, userEmail } = body;

    // ===== VALIDATION =====
    
    // Validate amount
    if (!amount || typeof amount !== "number" || amount <= 0) {
      console.error("❌ Invalid amount:", amount);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid amount",
          message: "Amount must be a positive number greater than 0",
        },
        { status: 400 }
      );
    }

    // Validate user info
    if (!userId && !userEmail) {
      console.error("❌ Missing user identification");
      return NextResponse.json(
        {
          success: false,
          error: "Missing user information",
          message: "Either userId or userEmail is required",
        },
        { status: 400 }
      );
    }

    console.log("✅ Validation passed:", { amount, userId, userEmail });

    // ===== DATABASE CONNECTION =====
    await connectToDatabase();

    // ===== GET PAYMENT SETTINGS =====
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "nowpayment",
      isActive: true,
    });

    if (!paymentSettings) {
      console.error("❌ NOWPayments not configured or inactive");
      return NextResponse.json(
        {
          success: false,
          error: "Payment gateway not available",
          message: "NOWPayments is not configured. Please contact support.",
        },
        { status: 500 }
      );
    }

    if (!paymentSettings.apiKey) {
      console.error("❌ NOWPayments API key not set");
      return NextResponse.json(
        {
          success: false,
          error: "Payment gateway misconfigured",
          message: "NOWPayments API key is missing. Please contact support.",
        },
        { status: 500 }
      );
    }

    console.log("✅ Payment settings loaded:", {
      gateway: paymentSettings.gateway,
      hasApiKey: !!paymentSettings.apiKey,
      hasIpnSecret: !!paymentSettings.ipnSecret,
      sandboxMode: paymentSettings.sandboxMode,
    });

    // ===== INITIALIZE SERVICE =====
    await nowpaymentsService.initialize(paymentSettings);

    // ===== GET USER INFO =====
    let user = null;
    let finalEmail = userEmail;

    if (userId) {
      user = await User.findById(userId);
      if (user) {
        finalEmail = user.email;
      }
    }

    if (!finalEmail) {
      console.error("❌ Could not determine user email");
      return NextResponse.json(
        {
          success: false,
          error: "User email required",
          message: "Unable to process payment without user email",
        },
        { status: 400 }
      );
    }

    console.log("✅ User info resolved:", {
      userId: user?._id || null,
      email: finalEmail,
    });

    // ===== GENERATE ORDER ID =====
    const orderId = `crypto-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // ===== BUILD CALLBACK URLS =====
    const baseUrl =
      process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(request.url).origin;

    const successUrl =
      process.env.NOWPAYMENTS_SUCCESS_URL ||
      `${baseUrl}/payment/success?order_id=${orderId}`;

    const cancelUrl =
      process.env.NOWPAYMENTS_CANCEL_URL ||
      `${baseUrl}/payment/cancel?order_id=${orderId}`;

    const ipnCallbackUrl =
      process.env.NOWPAYMENTS_IPN_URL ||
      `${baseUrl}/api/payments/nowpayments/webhook`;

    console.log("🔗 Callback URLs:", {
      success: successUrl,
      cancel: cancelUrl,
      ipn: ipnCallbackUrl?.substring(0, 50) + "...",
    });

    // ===== CREATE INVOICE WITH NOWPAYMENTS =====
    console.log("📤 Calling NOWPayments API...");

    let invoiceResult;
    try {
      invoiceResult = await nowpaymentsService.createInvoice({
        price_amount: amount,
        price_currency: "usd",
        order_id: orderId,
        order_description: `Crypto Deposit - $${amount}`,
        ipn_callback_url: ipnCallbackUrl,
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: finalEmail,
      });
    } catch (apiError) {
      console.error("❌ NOWPayments API error:", {
        message: apiError.message,
        stack: apiError.stack,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Payment gateway error",
          message:
            apiError.message ||
            "Failed to create invoice. Please try again or contact support.",
        },
        { status: 500 }
      );
    }

    if (!invoiceResult.success) {
      console.error("❌ Invoice creation failed:", invoiceResult);
      return NextResponse.json(
        {
          success: false,
          error: "Invoice creation failed",
          message: "Unable to create payment invoice",
        },
        { status: 500 }
      );
    }

    const invoice = invoiceResult.data;

    console.log("✅ Invoice created successfully:", {
      invoiceId: invoice.invoiceId,
      invoiceUrl: invoice.invoiceUrl,
    });

    // ===== SAVE TO DATABASE =====
    const cryptoPayment = new CryptoPayment({
      userId: user?._id || null,
      userEmail: finalEmail,
      gateway: "nowpayments",
      invoiceId: invoice.invoiceId,
      purchaseId: invoice.purchaseId,
      orderId: invoice.orderId,
      priceAmount: invoice.priceAmount,
      priceCurrency: invoice.priceCurrency,
      paymentStatus: "waiting",
      internalStatus: "pending",
      invoiceUrl: invoice.invoiceUrl,
      orderDescription: `Crypto Deposit - $${amount}`,
      expirationEstimateDate: invoice.expirationEstimateDate,
      metadata: {
        createdVia: "api",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    await cryptoPayment.save();

    console.log("💾 Payment record saved:", cryptoPayment._id);

    // ===== RESPONSE =====
    const responseTime = Date.now() - startTime;
    console.log(`✅ Invoice created successfully in ${responseTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        invoiceId: invoice.invoiceId,
        invoiceUrl: invoice.invoiceUrl,
        orderId: invoice.orderId,
        amount: invoice.priceAmount,
        currency: invoice.priceCurrency,
        status: "waiting",
        expiresAt: invoice.expirationEstimateDate,
        paymentRecordId: cryptoPayment._id,
      },
      message: "Invoice created successfully. Redirect user to invoiceUrl.",
    });
  } catch (error) {
    console.error("❌ Unexpected error in create-invoice:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
