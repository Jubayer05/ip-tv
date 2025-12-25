import { connectToDatabase } from "@/lib/db";
import hoodpayService from "@/lib/paymentServices/hoodpayService";
import { calculateServiceFee, formatFeeInfo } from "@/lib/paymentUtils";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log("START: HoodPay create payment");

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
      meta = {},
    } = await request.json();

    console.log("Request data:", {
      amount,
      currency,
      userId,
      customerEmail,
      meta,
    });

    // Validate amount
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    await connectToDatabase();

    // Get HoodPay payment settings
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "hoodpay",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "HoodPay payment method is not configured or active" },
        { status: 400 }
      );
    }

    console.log("HoodPay settings loaded:", {
      hasApiKey: !!paymentSettings.apiKey,
      hasBusinessId: !!paymentSettings.businessId,
      hasWebhookSecret: !!paymentSettings.webhookSecret,
    });

    // Calculate service fee
    const feeCalculation = calculateServiceFee(
      amount,
      paymentSettings.feeSettings
    );
    const finalAmount = feeCalculation.totalAmount;

    console.log("Fee calculation:", {
      originalAmount: amount,
      serviceFee: feeCalculation.feeAmount,
      finalAmount: finalAmount,
    });

    // Configure HoodPay service
    hoodpayService.setApiKey(paymentSettings.apiKey);
    
    const businessId = paymentSettings.businessId || paymentSettings.merchantId;
    if (!businessId) {
      return NextResponse.json(
        { error: "HoodPay Business ID is not configured. Please add it in payment settings." },
        { status: 400 }
      );
    }
    hoodpayService.setBusinessId(businessId);
    
    if (paymentSettings.webhookSecret) {
      hoodpayService.setWebhookSecret(paymentSettings.webhookSecret);
    }
    
    if (paymentSettings.allowedIps && paymentSettings.allowedIps.length > 0) {
      hoodpayService.setAllowedIps(paymentSettings.allowedIps);
    }

    console.log("HoodPay service configured");

    const origin = new URL(request.url).origin;

    // Determine if this is a deposit or subscription
    const isDeposit = meta?.purpose === "deposit";
    
    console.log("Order type:", {
      isDeposit,
      purpose: meta?.purpose,
      productId: meta?.productId,
      variantId: meta?.variantId,
    });

    // Validate product info for subscriptions
    let orderProducts = [];
    
    if (!isDeposit) {
      const productId = meta?.productId;
      const variantId = meta?.variantId;
      
      if (!productId || !variantId) {
        return NextResponse.json(
          {
            error: "productId and variantId are required for subscription orders",
            received: { productId, variantId },
          },
          { status: 400 }
        );
      }

      console.log("Looking up product:", { productId, variantId });

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
          { error: "Variant not found" },
          { status: 404 }
        );
      }

      console.log("Product found:", {
        productName: product.name,
        variantPrice: variant.price,
        variantDuration: variant.durationMonths,
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
      // Deposit order
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

    // Generate order number
    const orderNumber = providedOrderNumber || `hoodpay-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    console.log("Order number generated:", orderNumber);

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
        
        console.log("User found:", {
          userId: user._id,
          email: user.email,
        });
      }
    } else if (!resolvedContactInfo) {
      resolvedContactInfo = {
        fullName: customerEmail || "Guest",
        email: customerEmail || "",
        phone: "",
      };
    }

    // Prepare metadata for HoodPay
    const hoodpayMetadata = {
      order_number: orderNumber,
      user_id: userId || "",
      purpose: isDeposit ? "deposit" : "subscription",
      product_id: meta?.productId || "",
      variant_id: meta?.variantId || "",
    };

    console.log("Creating HoodPay payment with metadata:", hoodpayMetadata);

    let payment;
    let hoodpayPaymentData = {
      status: "pending", // Map 'created' to 'pending'
      sourceAmount: Number(amount), // Original amount before fees
      amount: Number(finalAmount), // Total amount with fees
      currency: currency.toUpperCase(),
      customerEmail: resolvedContactInfo.email || customerEmail || "",
      description: `${orderName}${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ''}`,
      callbackReceived: false,
      lastStatusUpdate: new Date(),
      metadata: hoodpayMetadata,
    };

    try {
      // Create HoodPay payment
      const result = await hoodpayService.createPayment({
        amount: finalAmount,
        currency,
        orderId: orderNumber,
        orderDescription: `${orderName}${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ''}`,
        customerEmail: resolvedContactInfo.email || customerEmail,
        metadata: hoodpayMetadata,
        notifyUrl: `${origin}/api/payments/hoodpay/webhook`,
        returnUrl: `${origin}/payment-success?orderNumber=${orderNumber}&amount=${finalAmount}&gateway=hoodpay&type=${isDeposit ? 'deposit' : 'order'}`,
        cancelUrl: `${origin}/payment-cancel?orderNumber=${orderNumber}&gateway=hoodpay&type=${isDeposit ? 'deposit' : 'order'}`,
      });

      payment = result.data;

      console.log("HoodPay payment created:", {
        paymentId: payment.paymentId,
        paymentUrl: payment.paymentUrl?.substring(0, 50) + "...",
        status: payment.status,
      });

      // Update payment data with API response
      hoodpayPaymentData = {
        ...hoodpayPaymentData,
        paymentId: payment.paymentId,
        paymentUrl: payment.paymentUrl,
        status: payment.status === 'created' ? 'pending' : payment.status, // Map HoodPay status to internal status
      };
    } catch (apiError) {
      console.error("HoodPay API Error:", apiError);
      return NextResponse.json(
        {
          success: false,
          error: "HoodPay payment creation failed",
          details: apiError.message,
        },
        { status: 500 }
      );
    }

    // Create order record
    const order = new Order({
      orderNumber,
      userId: userId || null,
      guestEmail: resolvedGuestEmail,
      products: orderProducts,
      totalAmount: Number(finalAmount),
      originalAmount: Number(amount),
      serviceFee: Number(feeCalculation.feeAmount),
      discountAmount: 0,
      couponCode: couponCode,
      paymentMethod: "Card",
      paymentGateway: "HoodPay",
      paymentStatus: "pending",
      contactInfo: resolvedContactInfo,
      status: "new",
      hoodpayPayment: hoodpayPaymentData,
    });

    await order.save();

    console.log("Order saved:", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
    });

    console.log("SUCCESS: HoodPay payment created");

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentId: payment.paymentId,
      checkoutUrl: payment.paymentUrl,
      amount: finalAmount,
      originalAmount: amount,
      currency,
      status: payment.status,
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
    console.error("HoodPay create error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create HoodPay payment" },
      { status: 500 }
    );
  }
}
