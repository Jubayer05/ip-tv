import { connectToDatabase } from "@/lib/db";
import voletService from "@/lib/paymentServices/voletService";
import { calculateServiceFee, formatFeeInfo } from "@/lib/paymentUtils";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextResponse } from "next/server";

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

    if (!amount || amount <= 0) {
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

    // Update the service with database credentials
    voletService.setCredentials(
      paymentSettings.apiKey,
      paymentSettings.apiSecret
    );

    const origin = new URL(request.url).origin;
    const orderNumber =
      providedOrderNumber || `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Create Volet payment with final amount (including fees)
    const result = await voletService.createPayment({
      orderName,
      orderNumber,
      sourceCurrency: currency,
      sourceAmount: finalAmount, // Use final amount including fees
      currency: "BTC",
      email: customerEmail || "",
      callbackUrl: `${origin}/api/payments/volet/webhook`,
      description: `IPTV Subscription - Order ${orderNumber}${
        feeCalculation.feeAmount > 0
          ? ` (${formatFeeInfo(feeCalculation)})`
          : ""
      }`,
      plugin: "IPTV_PLATFORM",
      version: "1.0",
    });

    // Check if Volet API call was successful
    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: "Failed to create Volet payment" },
        { status: 500 }
      );
    }

    const payment = result.data;

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
        orderNumber: payment.id,
        userId: userId || null,
        guestEmail: resolvedGuestEmail,
        products: orderProducts,
        totalAmount: finalAmount, // Store final amount including fees
        originalAmount: amount, // Store original amount before fees
        serviceFee: feeCalculation.feeAmount, // Store service fee amount
        discountAmount: 0,
        couponCode: couponCode,
        paymentMethod: "Cryptocurrency",
        paymentGateway: "Volet",
        paymentStatus: payment.status,
        contactInfo: resolvedContactInfo,
        status: "completed", // Order is ready, waiting for payment
      });
    } else {
      // Update existing order with new payment details
      order.paymentMethod = "Cryptocurrency";
      order.paymentGateway = "Volet";
      order.paymentStatus = payment.status;
      order.totalAmount = finalAmount; // Update with final amount
      order.originalAmount = amount; // Store original amount
      order.serviceFee = feeCalculation.feeAmount; // Store service fee
    }

    // Update order with Volet payment details
    order.voletPayment = {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      sourceAmount: payment.source_amount,
      sourceCurrency: payment.source_currency,
      walletAddress: payment.wallet_address || "",
      confirmations: payment.confirmations || 0,
      actualSum: payment.actual_sum || "0.00000000",
      expiresAt: payment.expires_at
        ? new Date(payment.expires_at * 1000)
        : null,
      callbackReceived: false,
      lastStatusUpdate: new Date(),
    };

    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentId: payment.id,
      checkoutUrl: payment.payment_url,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      walletAddress: payment.wallet_address,
      expiresAt: payment.expires_at
        ? new Date(payment.expires_at * 1000).toISOString()
        : null,
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
    console.error("Volet create error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Volet payment" },
      { status: 500 }
    );
  }
}
