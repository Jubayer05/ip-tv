import { connectToDatabase } from "@/lib/db";
import paygateService from "@/lib/paymentServices/paygateService";
import { calculateServiceFee, formatFeeInfo } from "@/lib/paymentUtils";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  const requestId = `create-${Date.now()}`;
  console.log(`[PayGate Create ${requestId}] === Request Started ===`);
  
  try {
    const requestBody = await request.json();
    const {
      amount,
      currency = "USD",
      customerEmail,
      orderName = "IPTV Subscription",
      orderNumber: providedOrderNumber,
      userId,
      quantity = 1,
      devicesAllowed = 1,
      adultChannels = false,
      couponCode = "",
      contactInfo,
      provider = "moonpay",
      meta = {},
      userRegion,
      preferredProvider = "moonpay",
    } = requestBody;

    console.log(`[PayGate Create ${requestId}] Request payload:`, {
      amount,
      currency,
      customerEmail,
      orderName,
      providedOrderNumber,
      userId,
      provider,
      preferredProvider,
      userRegion,
      meta,
      hasContactInfo: !!contactInfo
    });

    if (!amount || Number(amount) <= 0) {
      console.warn(`[PayGate Create ${requestId}] Invalid amount:`, amount);
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    console.log(`[PayGate Create ${requestId}] Connecting to database...`);
    await connectToDatabase();

    // Get PayGate payment settings from database
    console.log(`[PayGate Create ${requestId}] Fetching PayGate settings...`);
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "paygate",
      isActive: true,
    });

    if (!paymentSettings) {
      console.error(`[PayGate Create ${requestId}] PayGate settings not found or inactive`);
      return NextResponse.json(
        { error: "PayGate payment method is not configured or active" },
        { status: 400 }
      );
    }

    console.log(`[PayGate Create ${requestId}] PayGate settings loaded:`, {
      hasMerchantId: !!paymentSettings.merchantId,
      hasWebhookSecret: !!paymentSettings.webhookSecret,
      hasApiKey: !!paymentSettings.apiKey,
      feeSettingsActive: paymentSettings.feeSettings?.isActive
    });

    // Calculate service fee
    const feeCalculation = calculateServiceFee(
      amount,
      paymentSettings.feeSettings
    );
    const finalAmount = feeCalculation.totalAmount;

    console.log(`[PayGate Create ${requestId}] Fee calculation:`, {
      originalAmount: amount,
      serviceFee: feeCalculation.feeAmount,
      finalAmount: finalAmount,
      feeType: feeCalculation.feeType,
      feePercentage: feeCalculation.feePercentage
    });

    // Get the merchant address from the correct field
    const merchantAddress = paymentSettings.merchantId;

    if (!merchantAddress) {
      console.error(`[PayGate Create ${requestId}] Merchant address not configured`);
      return NextResponse.json(
        {
          error: "PayGate merchant address not configured",
          details:
            "Please configure the merchant address (merchantId) in PayGate payment settings",
        },
        { status: 400 }
      );
    }

    console.log(`[PayGate Create ${requestId}] Configuring PayGate service:`, {
      merchantAddress: merchantAddress.substring(0, 10) + '...',
      hasWebhookSecret: !!paymentSettings.webhookSecret
    });

    paygateService.setMerchantAddress(merchantAddress);
    
    // Set webhook secret if configured
    if (paymentSettings.webhookSecret) {
      paygateService.setWebhookSecret(paymentSettings.webhookSecret);
    }

    const origin = new URL(request.url).origin;

    // Prepare metadata for PayGate
    const paygateMetadata = {
      order_number: providedOrderNumber || "",
      user_id: userId || "",
      purpose: meta?.purpose || "order",
    };

    console.log(`[PayGate Create ${requestId}] PayGate metadata:`, paygateMetadata);

    let payment;
    let paygatePaymentData = {
      status: "pending",
      amount: Number(finalAmount),
      currency: currency.toUpperCase(),
      customerEmail: customerEmail || "",
      description: `${orderName}${
        feeCalculation.feeAmount > 0
          ? ` (${formatFeeInfo(feeCalculation)})`
          : ""
      }`,
      callbackReceived: false,
      lastStatusUpdate: new Date(),
      metadata: paygateMetadata,
      provider: provider,
    };

    try {
      console.log(`[PayGate Create ${requestId}] Creating PayGate payment...`);
      console.log(`[PayGate Create ${requestId}] Payment parameters:`, {
        amount: finalAmount,
        currency,
        customerEmail,
        description: `${orderName}${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ""}`,
        callbackUrl: `${origin}/api/payments/paygate/webhook`,
        successUrl: `${origin}/payment-status/paygate-${Date.now()}`,
        provider: preferredProvider,
        userRegion,
        hasMetadata: !!paygateMetadata
      });

      // Create PayGate payment with final amount
      console.log(`[PayGate Create ${requestId}] Calling PayGate API...`);
      const result = await paygateService.createPayment({
        amount: finalAmount, // Use final amount including fees
        currency,
        customerEmail,
        description: `${orderName}${
          feeCalculation.feeAmount > 0
            ? ` (${formatFeeInfo(feeCalculation)})`
            : ""
        }`,
        callbackUrl: `${origin}/api/payments/paygate/webhook`,
        successUrl: `${origin}/payment-status/paygate-${Date.now()}`,
        provider: preferredProvider,
        userRegion, // Pass the region
        metadata: paygateMetadata,
      });

      payment = result.data;
      console.log(`[PayGate Create ${requestId}] PayGate API response:`, {
        paymentId: payment?.id,
        status: payment?.status,
        hasPaymentUrl: !!payment?.payment_url,
        hasWalletData: !!payment?.wallet_data,
        provider: payment?.provider
      });

      // Update PayGate payment data with API response
      paygatePaymentData = {
        ...paygatePaymentData,
        paymentId: payment.id,
        paymentUrl: payment.payment_url,
        walletData: payment.wallet_data,
      };
      console.log(`[PayGate Create ${requestId}] Updated PayGate payment data with API response`);
    } catch (apiError) {
      console.error(`[PayGate Create ${requestId}] PayGate API Error:`, {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status,
        stack: apiError.stack
      });

      // If PayGate API fails, we can still create the order but mark it as failed
      paygatePaymentData = {
        ...paygatePaymentData,
        status: "failed",
        paymentId: `failed-${Date.now()}`,
        paymentUrl: "",
      };

      return NextResponse.json(
        {
          success: false,
          error: "PayGate payment creation failed",
          details: apiError.message,
          orderCreated: false,
        },
        { status: 500 }
      );
    }

    // Find existing order or create new one
    const orderNumber =
      providedOrderNumber || payment?.id || `paygate-${Date.now()}`;
    console.log(`[PayGate Create ${requestId}] Searching for existing order:`, { orderNumber });
    let order = await Order.findOne({ orderNumber });
    console.log(`[PayGate Create ${requestId}] Existing order found:`, !!order);

    if (!order) {
      // If not a deposit, validate product info
      const isDeposit = (meta?.purpose || "order") === "deposit";
      console.log(`[PayGate Create ${requestId}] Creating new order - isDeposit:`, isDeposit);
      let orderProducts = [];

      if (!isDeposit) {
        const productId = meta?.productId;
        const variantId = meta?.variantId;
        console.log(`[PayGate Create ${requestId}] Validating product for order:`, { productId, variantId });
        if (!productId || !variantId) {
          console.error(`[PayGate Create ${requestId}] Missing product info for non-deposit order`);
          return NextResponse.json(
            {
              error: "productId and variantId are required for order creation",
              suggestion:
                "Provide productId and variantId in meta for non-deposit payments",
            },
            { status: 400 }
          );
        }
        const product = await Product.findById(productId);
        if (!product) {
          console.error(`[PayGate Create ${requestId}] Product not found:`, productId);
          return NextResponse.json(
            { error: "Product not found" },
            { status: 404 }
          );
        }
        const variant = product.variants.find(
          (v) => v._id.toString() === variantId
        );
        if (!variant) {
          console.error(`[PayGate Create ${requestId}] Variant not found:`, variantId);
          return NextResponse.json(
            { error: "Variant not found" },
            { status: 404 }
          );
        }

        console.log(`[PayGate Create ${requestId}] Product validated:`, {
          productName: product.name,
          variantPrice: variant.price,
          variantDuration: variant.durationMonths
        });

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
        // Deposit top-up
        console.log(`[PayGate Create ${requestId}] Creating deposit order product`);
        orderProducts = [
          {
            productId: null,
            variantId: null,
            quantity: 1,
            price: Number(amount), // Original amount for product price
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
        console.log(`[PayGate Create ${requestId}] Fetching user contact info for userId:`, userId);
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
          console.log(`[PayGate Create ${requestId}] Resolved user contact info:`, {
            fullName: resolvedContactInfo.fullName,
            email: resolvedContactInfo.email
          });
        }
      } else if (!resolvedContactInfo) {
        console.log(`[PayGate Create ${requestId}] Using guest contact info from customerEmail`);
        resolvedContactInfo = {
          fullName: customerEmail || "Guest",
          email: customerEmail || "",
          phone: "",
        };
      }

      console.log(`[PayGate Create ${requestId}] Creating new order:`, {
        orderNumber,
        userId: userId || null,
        totalAmount: finalAmount,
        originalAmount: amount,
        serviceFee: feeCalculation.feeAmount,
        paymentGateway: 'PayGate'
      });

      order = new Order({
        orderNumber,
        userId: userId || null,
        guestEmail: resolvedGuestEmail,
        products: orderProducts,
        totalAmount: Number(finalAmount), // Store final amount including fees
        originalAmount: Number(amount), // Store original amount
        serviceFee: Number(feeCalculation.feeAmount), // Store service fee
        discountAmount: 0,
        couponCode: couponCode,
        paymentMethod: "Crypto",
        paymentGateway: "PayGate",
        paymentStatus:
          paygatePaymentData.status === "failed" ? "failed" : "pending",
        contactInfo: resolvedContactInfo,
        status: paygatePaymentData.status === "failed" ? "cancelled" : "new",
      });
    } else {
      console.log(`[PayGate Create ${requestId}] Updating existing order:`, order._id);
      order.paymentMethod = "Crypto";
      order.paymentGateway = "PayGate";
      order.paymentStatus =
        paygatePaymentData.status === "failed" ? "failed" : "pending";
      order.totalAmount = Number(finalAmount); // Update with final amount
      order.originalAmount = Number(amount); // Store original amount
      order.serviceFee = Number(feeCalculation.feeAmount); // Store service fee
    }

    order.paygatePayment = paygatePaymentData;

    console.log(`[PayGate Create ${requestId}] Saving order to database...`);
    await order.save();
    console.log(`[PayGate Create ${requestId}] Order saved successfully:`, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus
    });

    console.log(`[PayGate Create ${requestId}] Returning success response`);
    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentId: payment?.id,
      checkoutUrl: payment?.payment_url || "",
      amount: finalAmount, // Return final amount
      currency,
      status: payment?.status || "pending",
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
    console.error(`[PayGate Create ${requestId}] Unexpected error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: error?.message || "Failed to create PayGate payment" },
      { status: 500 }
    );
  }
}
