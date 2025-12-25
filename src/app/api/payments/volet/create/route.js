import { connectToDatabase } from "@/lib/db";
import voletService from "@/lib/paymentServices/voletService";
import { calculateServiceFee, formatFeeInfo } from "@/lib/paymentUtils";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * POST /api/payments/volet/create
 * Create a Volet payment for subscriptions/orders
 */
export async function POST(request) {
  try {
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
      meta,
    } = await request.json();

    // Extract product data from meta object
    const productId = meta?.productId;
    const variantId = meta?.variantId;
    const devices = meta?.devices || devicesAllowed;
    const adultChannelsValue = meta?.adultChannels || adultChannels;
    const quantityValue = meta?.quantity || quantity;

    // Validate amount
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    await connectToDatabase();

    // Get Volet payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "volet",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "Volet payment method is not configured or active" },
        { status: 400 }
      );
    }

    // Calculate service fee
    const feeCalculation = calculateServiceFee(
      amount,
      paymentSettings.feeSettings
    );
    const finalAmount = feeCalculation.totalAmount;

    // Initialize Volet service with credentials from database
    voletService.initialize(paymentSettings);

    const origin = new URL(request.url).origin;
    
    // Generate order number
    const orderNumber = providedOrderNumber || `volet-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Create Volet payment
    const result = await voletService.createPayment({
      orderId: orderNumber,
      amount: finalAmount,
      currency: currency.toUpperCase(),
      description: `${orderName} - Order ${orderNumber}${
        feeCalculation.feeAmount > 0
          ? ` (${formatFeeInfo(feeCalculation)})`
          : ""
      }`,
      statusUrl: `${origin}/api/payments/volet/webhook`,
      successUrl: `${origin}/payment-success?order_id=${orderNumber}`,
      failUrl: `${origin}/payment-cancel?order_id=${orderNumber}`,
      customerEmail: customerEmail || "",
    });

    // Check if Volet payment creation was successful
    if (!result.success || !result.data) {
      console.error("[Volet Create] Failed to create payment:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to create Volet payment" },
        { status: 500 }
      );
    }

    const payment = result.data;

    // Validate checkout URL
    if (!payment.checkoutUrl) {
      console.error("[Volet Create] No checkout URL in response:", payment);
      return NextResponse.json(
        { error: "Volet did not return a checkout URL" },
        { status: 500 }
      );
    }

    // Find existing order or create new one
    let order = await Order.findOne({ orderNumber });

    if (!order) {
      // Only validate product fields if we're creating a new order
      if (!productId || !variantId) {
        return NextResponse.json(
          {
            error: "productId and variantId are required for order creation",
            suggestion:
              "Provide productId and variantId in meta object, or use an existing orderNumber",
          },
          { status: 400 }
        );
      }

      // Fetch product and variant
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
        return NextResponse.json(
          { error: "contactInfo is required when userId is not provided" },
          { status: 400 }
        );
      }

      // Create order products array
      const orderProducts = [
        {
          productId: product._id,
          variantId: variant._id,
          quantity: quantityValue,
          price: variant.price,
          duration: variant.durationMonths || 0,
          devicesAllowed: devices,
          adultChannels: adultChannelsValue,
        },
      ];

      // Create new order
      order = new Order({
        orderNumber: orderNumber,
        userId: userId || null,
        guestEmail: resolvedGuestEmail,
        products: orderProducts,
        totalAmount: finalAmount,
        originalAmount: amount,
        serviceFee: feeCalculation.feeAmount,
        discountAmount: 0,
        couponCode: couponCode,
        paymentMethod: "Volet",
        paymentGateway: "Volet",
        paymentStatus: "pending",
        contactInfo: resolvedContactInfo,
        status: "pending",
      });
    } else {
      // Update existing order with new payment details
      order.paymentMethod = "Volet";
      order.paymentGateway = "Volet";
      order.paymentStatus = "pending";
      order.totalAmount = finalAmount;
      order.originalAmount = amount;
      order.serviceFee = feeCalculation.feeAmount;
    }

    // Update order with Volet payment details
    order.voletPayment = {
      paymentId: orderNumber,
      status: "pending",
      priceAmount: finalAmount,
      priceCurrency: currency.toUpperCase(),
      paymentUrl: payment.checkoutUrl,
      customerEmail: customerEmail || order.contactInfo?.email || "",
      orderDescription: `${orderName} - Order ${orderNumber}`,
      sciName: paymentSettings.businessId,
      accountEmail: paymentSettings.merchantId,
      callbackReceived: false,
      lastStatusUpdate: new Date(),
      metadata: {
        original_amount: amount,
        service_fee: feeCalculation.feeAmount,
        final_amount: finalAmount,
      },
    };

    await order.save();

    console.log("[Volet Create] Order created/updated:", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      amount: finalAmount,
      checkoutUrl: payment.checkoutUrl.substring(0, 50) + "...",
    });

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentId: orderNumber,
      checkoutUrl: payment.checkoutUrl,
      amount: finalAmount,
      originalAmount: amount,
      currency: currency.toUpperCase(),
      status: "pending",
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
    console.error("[Volet Create] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Volet payment" },
      { status: 500 }
    );
  }
}
