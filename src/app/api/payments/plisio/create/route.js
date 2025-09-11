import { connectToDatabase } from "@/lib/db";
import plisioService from "@/lib/paymentServices/plisioService";
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

    // Get Plisio payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "plisio",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "Plisio payment method is not configured or active" },
        { status: 400 }
      );
    }

    // Update the service with database credentials
    plisioService.apiKey = paymentSettings.apiKey;
    if (paymentSettings.apiSecret) {
      plisioService.apiSecret = paymentSettings.apiSecret;
    }

    const origin = new URL(request.url).origin;
    const orderNumber =
      providedOrderNumber || `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Create Plisio invoice first
    const result = await plisioService.createInvoice({
      orderName,
      orderNumber,
      sourceCurrency: currency,
      sourceAmount: amount,
      currency: "BTC",
      email: customerEmail || "",
      callbackUrl: `${origin}/api/payments/plisio/callback?json=true`,
      description: `IPTV Subscription - Order ${orderNumber}`,
      plugin: "IPTV_PLATFORM",
      version: "1.0",
    });

    const invoice = result.data;

    // Find existing order or create new one
    let order = await Order.findOne({ orderNumber });

    console.log("ORDER NOT FOUND:" + order);

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
        orderNumber: invoice.id,
        userId: userId || null,
        guestEmail: resolvedGuestEmail,
        products: orderProducts,
        totalAmount: amount,
        discountAmount: 0,
        couponCode: couponCode,
        paymentMethod: "Cryptocurrency",
        paymentGateway: "Plisio",
        paymentStatus: invoice.status,
        contactInfo: resolvedContactInfo,
        status: "completed", // Order is ready, waiting for payment
      });
    } else {
      // Update existing order with new payment details
      order.paymentMethod = "Cryptocurrency";
      order.paymentGateway = "Plisio";
      order.paymentStatus = invoice.status;
    }

    // Update order with Plisio payment details
    order.plisioPayment = {
      invoiceId: invoice.id,
      status: invoice.status,
      amount: invoice.amount,
      currency: invoice.currency,
      sourceAmount: invoice.params.source_amount,
      sourceCurrency: invoice.source_currency,
      walletAddress: invoice.wallet_hash,
      confirmations: invoice.confirmations || 0,
      actualSum: invoice.actual_sum || "0.00000000",
      expiresAt: new Date(invoice.expire_at_utc * 1000),
      callbackReceived: false,
      lastStatusUpdate: new Date(),
    };

    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentId: invoice.id,
      checkoutUrl: invoice.invoice_url,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      walletAddress: invoice.wallet_hash,
      expiresAt: new Date(invoice.expire_at_utc * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Plisio create error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Plisio invoice" },
      { status: 500 }
    );
  }
}
