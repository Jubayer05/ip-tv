import { connectToDatabase } from "@/lib/db";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsService";
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
      meta = {},
    } = await request.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    await connectToDatabase();

    // Get NOWPayments payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "nowpayment",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "NOWPayments payment method is not configured or active" },
        { status: 400 }
      );
    }

    // Update the service with database credentials
    nowpaymentsService.apiKey = paymentSettings.apiKey;
    if (paymentSettings.apiSecret) {
      nowpaymentsService.apiSecret = paymentSettings.apiSecret;
    }

    const origin = new URL(request.url).origin;

    // Generate order ID
    const orderId =
      providedOrderNumber ||
      `nowpay-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Prepare metadata for our database (not sent to NOWPayments API)
    const nowpaymentsMetadata = {
      order_number: providedOrderNumber || "",
      user_id: userId || "",
      purpose: meta?.purpose || "order",
      product_id: meta?.productId || "",
      variant_id: meta?.variantId || "",
      quantity: String(meta?.quantity ?? quantity),
      devices_allowed: String(meta?.devices ?? devicesAllowed),
      adult_channels: String(meta?.adultChannels ?? adultChannels),
    };

    // Create NOWPayments payment (without metadata)
    const result = await nowpaymentsService.createPayment({
      priceAmount: amount,
      priceCurrency: currency,
      payCurrency: "btc", // Specify which crypto to pay with
      orderId,
      orderDescription: orderName,
      ipnCallbackUrl: `${origin}/api/payments/nowpayment/webhook`,
      successUrl: `${origin}/payment-status/${orderId}?status=success`,
      cancelUrl: `${origin}/payment-status/${orderId}?status=canceled`,
      customerEmail,
    });

    const payment = result.data;

    // Find existing order or create new one
    let order = await Order.findOne({ orderNumber: orderId });

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

      order = new Order({
        orderNumber: orderId,
        userId: userId || null,
        guestEmail: resolvedGuestEmail,
        products: orderProducts,
        totalAmount: Number(amount),
        discountAmount: 0,
        couponCode: couponCode,
        paymentMethod: "Cryptocurrency",
        paymentGateway: "NOWPayments",
        paymentStatus: "pending",
        contactInfo: resolvedContactInfo,
        status: "new",
      });
    } else {
      order.paymentMethod = "Cryptocurrency";
      order.paymentGateway = "NOWPayments";
      order.paymentStatus = "pending";
    }

    // Try to get payment URL from response first, then fallback to constructed URL
    const paymentUrl = nowpaymentsService.getPaymentUrlFromResponse(payment);

    order.nowpaymentsPayment = {
      paymentId: payment.payment_id,
      orderId: payment.order_id,
      status: payment.payment_status || "waiting",
      priceAmount: Number(amount),
      priceCurrency: currency.toLowerCase(),
      payAmount: payment.pay_amount || 0,
      payCurrency: payment.pay_currency || "",
      paymentUrl: paymentUrl,
      customerEmail: customerEmail || "",
      orderDescription: orderName,
      callbackReceived: false,
      lastStatusUpdate: new Date(),
      metadata: nowpaymentsMetadata,
    };

    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentId: payment.payment_id,
      checkoutUrl: paymentUrl,
      amount,
      currency,
      status: payment.payment_status || "waiting",
    });
  } catch (error) {
    console.error("NOWPayments create error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create NOWPayments payment" },
      { status: 500 }
    );
  }
}
