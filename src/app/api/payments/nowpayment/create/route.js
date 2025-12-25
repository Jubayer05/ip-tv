import { connectToDatabase } from "@/lib/db";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsServiceV2";
import { calculateServiceFee, formatFeeInfo } from "@/lib/paymentUtils";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import Product from "@/models/Product";
import User from "@/models/User";
import CryptoPayment from "@/models/CryptoPayment";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      amount,
      currency = "USD",
      payCurrency = "btc",
      customerEmail,
      orderName = "IPTV Subscription",
      orderNumber: providedOrderNumber,
      userId,
      quantity = 1,
      devicesAllowed = 1,
      adultChannels = false,
      couponCode = "",
      contactInfo,
      meta = {},
    } = await request.json();

    console.log("🔵 Using NOWPayments V2 Service for subscription payment");

    // Validate amount
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Must be greater than 0." },
        { status: 400 }
      );
    }

    // Validate minimum amount ($1 for NOWPayments)
    if (Number(amount) < 1) {
      return NextResponse.json(
        { 
          error: "Minimum payment amount is $1",
          details: "NOWPayments requires a minimum of $1 USD equivalent. The actual minimum may vary slightly based on the cryptocurrency you choose."
        },
        { status: 400 }
      );
    }

    // Validate currency
    if (!payCurrency) {
      return NextResponse.json(
        { error: "Payment currency (payCurrency) is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get NOWPayments settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "nowpayment",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        {
          error: "NOWPayments is not configured or inactive",
          suggestion: "Please enable NOWPayments in admin payment settings",
        },
        { status: 400 }
      );
    }

    // Validate API key exists
    if (!paymentSettings.apiKey) {
      return NextResponse.json(
        {
          error: "NOWPayments API key not configured",
          suggestion: "Please add NOWPayments API key in admin settings",
        },
        { status: 500 }
      );
    }

    // Calculate service fee
    const feeCalculation = calculateServiceFee(
      amount,
      paymentSettings.feeSettings
    );
    const finalAmount = feeCalculation.totalAmount;

    console.log("💰 Payment amount calculation:", {
      originalAmount: amount,
      serviceFee: feeCalculation.feeAmount,
      finalAmount: finalAmount,
      feeType: feeCalculation.feeType,
    });

    // 🔥 Initialize V2 service with fresh credentials
    await nowpaymentsService.initialize(paymentSettings);

    const baseUrl = process.env.APP_BASE_URL || 
                    process.env.NEXT_PUBLIC_APP_URL || 
                    new URL(request.url).origin;

    // Generate order ID
    const orderId =
      providedOrderNumber ||
      `nowpay-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // 🔥 Build callback URLs
    const ipnCallbackUrl = `${baseUrl}/api/payments/nowpayments/webhook`;
    const successUrl = `${baseUrl}/payment-success?order_id=${orderId}`;
    const cancelUrl = `${baseUrl}/payment-cancel?order_id=${orderId}`;

    console.log("🔗 Callback URLs configured:", {
      baseUrl,
      ipnCallbackUrl,
      successUrl,
      cancelUrl,
    });

    // Determine if this is a deposit or product purchase
    const isDeposit = meta?.purpose === "wallet-deposit" || 
                      meta?.productId === "deposit" ||
                      !meta?.productId;

    console.log("📋 Order type:", { isDeposit, purpose: meta?.purpose, productId: meta?.productId });

    // Find existing order or create new one
    let order = await Order.findOne({ orderNumber: orderId });

    if (!order) {
      let orderProducts = [];

      if (!isDeposit) {
        // Validate product for regular orders ONLY
        const productId = meta?.productId;
        const variantId = meta?.variantId;

        if (!productId || !variantId) {
          return NextResponse.json(
            {
              error: "productId and variantId are required for order creation",
              suggestion:
                "Provide productId and variantId in meta for non-deposit payments",
            },
            { status: 400 }
          );
        }

        // Lookup product in database
        const product = await Product.findById(productId);
        if (!product) {
          return NextResponse.json(
            { error: "Product not found" },
            { status: 404 }
          );
        }

        const variant = product.variants.find(
          (v) => v._id.toString() === variantId
        );
        if (!variant) {
          return NextResponse.json(
            { error: "Product variant not found" },
            { status: 404 }
          );
        }

        orderProducts = [
          {
            productId: product._id,
            variantId: variant._id,
            quantity: Number(meta?.quantity ?? quantity),
            price: variant.price,
            duration: variant.durationMonths || 0,
            devicesAllowed: Number(meta?.devices ?? devicesAllowed),
            adultChannels: Boolean(meta?.adultChannels ?? adultChannels),
          },
        ];
      } else {
        // Deposit/top-up order - NO product lookup required
        console.log("💰 Creating deposit order");
        orderProducts = [
          {
            productId: null,
            variantId: null,
            quantity: 1,
            price: Number(amount),
            duration: 0,
            devicesAllowed: 0,
            adultChannels: false,
          },
        ];
      }

      // Build contact info
      let resolvedContactInfo = contactInfo;
      let resolvedGuestEmail = customerEmail || null;

      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          resolvedContactInfo = {
            fullName:
              `${user?.profile?.firstName || ""} ${
                user?.profile?.lastName || ""
              }`.trim() ||
              user?.profile?.username ||
              user?.email,
            email: user.email,
            phone: user?.profile?.phone || "",
          };
          resolvedGuestEmail = null;
        }
      } else if (!resolvedContactInfo) {
        resolvedContactInfo = {
          fullName: customerEmail || "Guest",
          email: customerEmail || "",
          phone: "",
        };
      }

      // Create new order
      order = new Order({
        orderNumber: orderId,
        userId: userId || null,
        guestEmail: resolvedGuestEmail,
        products: orderProducts,
        totalAmount: Number(finalAmount),
        originalAmount: Number(amount),
        serviceFee: Number(feeCalculation.feeAmount),
        discountAmount: 0,
        couponCode: couponCode,
        paymentMethod: "Cryptocurrency",
        paymentGateway: "NOWPayments",
        paymentStatus: "pending",
        contactInfo: resolvedContactInfo,
        status: "new",
      });
    } else {
      // Update existing order
      order.paymentMethod = "Cryptocurrency";
      order.paymentGateway = "NOWPayments";
      order.paymentStatus = "pending";
      order.totalAmount = Number(finalAmount);
      order.originalAmount = Number(amount);
      order.serviceFee = Number(feeCalculation.feeAmount);
    }

    // 🔥 Create invoice using V2 service (NO purchase_id!)
    let result;
    try {
      console.log("📤 Creating NOWPayments invoice with V2 service...");
      
      const invoicePayload = {
        price_amount: Number(finalAmount),
        price_currency: currency.toLowerCase(),
        order_id: orderId,
        order_description: `${orderName}${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ''}`,
        ipn_callback_url: ipnCallbackUrl,
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: customerEmail || order.contactInfo?.email,
        // 🔥 NO purchase_id - V2 doesn't need it!
      };

      console.log("🧾 V2 Invoice Payload:", {
        price_amount: invoicePayload.price_amount,
        price_currency: invoicePayload.price_currency,
        order_id: invoicePayload.order_id,
        has_urls: !!(invoicePayload.success_url && invoicePayload.cancel_url),
      });

      result = await nowpaymentsService.createInvoice(invoicePayload);

      console.log("✅ NOWPayments V2 invoice created:", {
        success: result.success,
        invoiceId: result.data?.invoiceId,
        invoiceUrl: result.data?.invoiceUrl,
      });

    } catch (apiError) {
      console.error("❌ NOWPayments V2 invoice creation failed:", {
        message: apiError.message,
        stack: apiError.stack,
      });

      return NextResponse.json(
        {
          error: "Failed to create payment invoice",
          details: apiError.message,
          suggestion: "Please check your NOWPayments API credentials",
        },
        { status: 500 }
      );
    }

    if (!result.success) {
      console.error("❌ Invoice creation unsuccessful:", result);
      return NextResponse.json(
        {
          error: result.error || "Payment creation failed",
          details: result.message || "NOWPayments returned unsuccessful response",
        },
        { status: 500 }
      );
    }

    const invoiceData = result.data;

    // 🔥 Validate invoice URL exists
    if (!invoiceData.invoiceUrl) {
      console.error("❌ No invoice URL in response:", invoiceData);
      return NextResponse.json(
        {
          error: "Failed to generate payment URL",
          details: "NOWPayments did not return a valid invoice URL",
        },
        { status: 500 }
      );
    }

    console.log("🔗 Payment URL generated:", invoiceData.invoiceUrl);

    // Save invoice details to order
    order.nowpaymentsPayment = {
      invoiceId: invoiceData.invoiceId,
      paymentUrl: invoiceData.invoiceUrl,
      priceCurrency: invoiceData.priceCurrency,
      priceAmount: invoiceData.priceAmount,
      orderId: invoiceData.orderId,
      purchaseId: invoiceData.purchaseId,
      createdAt: invoiceData.createdAt,
      expirationEstimateDate: invoiceData.expirationEstimateDate,
      paymentStatus: "waiting",
      callbackReceived: false,
      lastStatusUpdate: new Date(),
      metadata: {
        order_number: providedOrderNumber || "",
        user_id: userId || "",
        purpose: meta?.purpose || "order",
        product_id: meta?.productId || "",
        variant_id: meta?.variantId || "",
      },
    };

    await order.save();

    // 🔥 CREATE CRYPTOPAYMENT RECORD (for webhook tracking)
    const cryptoPayment = new CryptoPayment({
      userId: userId || null,
      userEmail: customerEmail || order.contactInfo?.email,
      invoiceId: invoiceData.invoiceId,
      paymentId: null, // Will be updated by webhook
      orderId: orderId,
      paymentStatus: "waiting",
      internalStatus: "pending",
      priceAmount: Number(finalAmount),
      priceCurrency: currency.toUpperCase(),
      payCurrency: payCurrency.toLowerCase(),
      payAmount: 0,
      actuallyPaid: 0,
      payAddress: "",
      purchaseId: invoiceData.purchaseId,
      invoiceUrl: invoiceData.invoiceUrl,
      orderDescription: `${orderName}${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ''}`,
      ipnCallbackUrl: ipnCallbackUrl,
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      metadata: {
        user_id: userId || "",
        purpose: meta?.purpose || "subscription",
        product_id: meta?.productId || "",
        variant_id: meta?.variantId || "",
        original_amount: Number(amount),
        service_fee: Number(feeCalculation.feeAmount),
        final_amount: Number(finalAmount),
      },
    });

    await cryptoPayment.save();

    console.log("💾 Order and CryptoPayment saved successfully:", {
      orderId: order._id,
      cryptoPaymentId: cryptoPayment._id,
    });

    // Get estimates (optional - don't fail if this errors)
    let estimatedAmount = 0;
    let minAmount = 0;
    try {
      const estimateResult = await nowpaymentsService.getEstimatedPrice(
        finalAmount,
        currency.toLowerCase(),
        payCurrency.toLowerCase()
      );
      estimatedAmount = estimateResult.data.estimatedAmount;
      
      const minResult = await nowpaymentsService.getMinimumPaymentAmount(
        payCurrency,
        currency.toLowerCase()
      );
      minAmount = minResult.minAmount;
    } catch (estError) {
      console.warn("⚠️ Could not fetch estimates:", estError.message);
    }

    console.log("💾 Order saved successfully:", order._id);

    // Return payment details to frontend
    return NextResponse.json({
      success: true,
      paymentId: cryptoPayment._id.toString(),
      paymentUrl: invoiceData.invoiceUrl,
      checkoutUrl: invoiceData.invoiceUrl,
      orderId: order._id,
      orderNumber: orderId,
      invoiceId: invoiceData.invoiceId,
      amount: finalAmount,
      originalAmount: amount,
      currency: currency.toUpperCase(),
      payCurrency: payCurrency.toUpperCase(),
      estimatedAmount: estimatedAmount,
      minimumAmount: minAmount,
      expiresAt: invoiceData.expirationEstimateDate,
      status: "waiting",
      instructions: `Complete payment on NOWPayments checkout page. ${
        feeCalculation.feeAmount > 0
          ? `(${formatFeeInfo(feeCalculation)})`
          : ""
      }`,
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
    console.error("❌ NOWPayments V2 create route error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to create NOWPayments transaction",
        details: error?.stack,
      },
      { status: 500 }
    );
  }
}
