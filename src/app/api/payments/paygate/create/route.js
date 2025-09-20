import { connectToDatabase } from "@/lib/db";
import paygateService from "@/lib/paymentServices/paygateService";
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
      provider = "moonpay",
      meta = {},
      userRegion, // Add this
      preferredProvider = "moonpay",
    } = await request.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    await connectToDatabase();

    // Get PayGate payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "paygate",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "PayGate payment method is not configured or active" },
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
    const merchantAddress =
      paymentSettings.merchantAddress || process.env.PAYGATE_MERCHANT_ADDRESS;

    if (!merchantAddress) {
      return NextResponse.json(
        {
          error: "PayGate merchant address not configured",
          details:
            "Please configure PAYGATE_MERCHANT_ADDRESS in environment variables or payment settings",
        },
        { status: 400 }
      );
    }

    paygateService.setMerchantAddress(merchantAddress);

    const origin = new URL(request.url).origin;

    // Prepare metadata for PayGate
    const paygateMetadata = {
      order_number: providedOrderNumber || "",
      user_id: userId || "",
      purpose: meta?.purpose || "order",
    };

    let payment;
    let paygatePaymentData = {
      status: "pending",
      amount: Number(finalAmount), // Use final amount including fees
      currency: currency.toUpperCase(),
      customerEmail: customerEmail || "",
      description: `${orderName}${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ''}`,
      callbackReceived: false,
      lastStatusUpdate: new Date(),
      metadata: paygateMetadata,
      provider: provider,
    };

    try {
      // Create PayGate payment with final amount
      const result = await paygateService.createPayment({
        amount: finalAmount, // Use final amount including fees
        currency,
        customerEmail,
        description: `${orderName}${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ''}`,
        callbackUrl: `${origin}/api/payments/paygate/webhook`,
        successUrl: `${origin}/payment-status/paygate-${Date.now()}`,
        provider: preferredProvider,
        userRegion, // Pass the region
        metadata: paygateMetadata,
      });

      payment = result.data;

      // Update PayGate payment data with API response
      paygatePaymentData = {
        ...paygatePaymentData,
        paymentId: payment.id,
        paymentUrl: payment.payment_url,
        walletData: payment.wallet_data,
      };
    } catch (apiError) {
      console.error("PayGate API Error:", apiError);

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
    let order = await Order.findOne({ orderNumber });

    if (!order) {
      // If not a deposit, validate product info
      const isDeposit = (meta?.purpose || "order") === "deposit";
      let orderProducts = [];

      if (!isDeposit) {
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
        const product = await Product.findById(productId);
        if (!product)
          return NextResponse.json(
            { error: "Product not found" },
            { status: 404 }
          );
        const variant = product.variants.find(
          (v) => v._id.toString() === variantId
        );
        if (!variant)
          return NextResponse.json(
            { error: "Variant not found" },
            { status: 404 }
          );

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
      order.paymentMethod = "Crypto";
      order.paymentGateway = "PayGate";
      order.paymentStatus =
        paygatePaymentData.status === "failed" ? "failed" : "pending";
      order.totalAmount = Number(finalAmount); // Update with final amount
      order.originalAmount = Number(amount); // Store original amount
      order.serviceFee = Number(feeCalculation.feeAmount); // Store service fee
    }

    order.paygatePayment = paygatePaymentData;

    await order.save();

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
    console.error("PayGate create error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create PayGate payment" },
      { status: 500 }
    );
  }
}
