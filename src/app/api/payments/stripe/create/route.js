import { connectToDatabase } from "@/lib/db";
import stripeService from "@/lib/paymentServices/stripeService";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      amount,
      currency = "usd",
      customerEmail,
      orderName = "IPTV Subscription",
      orderNumber: providedOrderNumber,
      userId,
      quantity = 1,
      devicesAllowed = 1,
      adultChannels = false,
      couponCode = "",
      contactInfo,
      meta = {}, // include: productId, variantId, purpose: "order" | "deposit"
    } = await request.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    await connectToDatabase();

    // Get Stripe payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "stripe",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "Stripe payment method is not configured or active" },
        { status: 400 }
      );
    }

    // Update the service with database credentials
    stripeService.apiKey = paymentSettings.apiKey;
    if (paymentSettings.apiSecret) {
      stripeService.apiSecret = paymentSettings.apiSecret;
    }

    const origin = new URL(request.url).origin;

    const session = await stripeService.createCheckoutSession({
      amount,
      currency,
      orderName,
      customerEmail,
      metadata: {
        // Persist helpful fields for the webhook
        providedOrderNumber: providedOrderNumber || "",
        userId: userId || "",
        purpose: meta?.purpose || "order", // "order" or "deposit"
        productId: meta?.productId || "",
        variantId: meta?.variantId || "",
        quantity: String(meta?.quantity ?? quantity),
        devicesAllowed: String(meta?.devices ?? devicesAllowed),
        adultChannels: String(meta?.adultChannels ?? adultChannels),
      },
      successUrl: `${origin}/payment-status/${encodeURIComponent(
        session?.id || "stripe"
      )}`,
      cancelUrl: `${origin}/`,
    });

    // Find existing order or create new one
    const orderNumber = providedOrderNumber || session.id;
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
        // Deposit top-up: represent as a single pseudo-product
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
        orderNumber,
        userId: userId || null,
        guestEmail: resolvedGuestEmail,
        products: orderProducts,
        totalAmount: Number(amount),
        discountAmount: 0,
        couponCode: couponCode,
        paymentMethod: "Card",
        paymentGateway: "Stripe",
        paymentStatus: "pending", // until webhook confirms
        contactInfo: resolvedContactInfo,
        status: "new",
      });
    } else {
      order.paymentMethod = "Card";
      order.paymentGateway = "Stripe";
      order.paymentStatus = "pending";
    }

    order.stripePayment = {
      sessionId: session.id,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      status: "new",
      amount: Math.round(Number(amount) * 100), // store cents if you prefer; align across codebase
      currency: currency.toLowerCase(),
      callbackReceived: false,
      lastStatusUpdate: new Date(),
    };

    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      sessionId: session.id,
      checkoutUrl: session.url,
      amount,
      currency,
      status: "new",
    });
  } catch (error) {
    console.error("Stripe create error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Stripe session" },
      { status: 500 }
    );
  }
}
