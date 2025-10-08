import { connectToDatabase } from "@/lib/db";
import changenowService from "@/lib/paymentServices/changenowService";
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
      meta = {},
    } = await request.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    await connectToDatabase();

    // Get ChangeNOW payment settings from database
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "changenow",
      isActive: true,
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "ChangeNOW payment method is not configured or active" },
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
    changenowService.apiKey = paymentSettings.apiKey;
    if (paymentSettings.apiSecret) {
      changenowService.apiSecret = paymentSettings.apiSecret;
    }

    // Generate order ID
    const orderId =
      providedOrderNumber ||
      `changenow-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    // Prepare metadata for ChangeNOW
    const changenowMetadata = {
      order_number: providedOrderNumber || "",
      user_id: userId || "",
      purpose: meta?.purpose || "order",
      product_id: meta?.productId || "",
      variant_id: meta?.variantId || "",
      quantity: String(meta?.quantity ?? quantity),
      devices_allowed: String(meta?.devices ?? devicesAllowed),
      adult_channels: String(meta?.adultChannels ?? adultChannels),
    };

    // Try to get estimated exchange amount, but don't fail if it doesn't work
    let estimatedAmount = 0;
    try {
      const estimateResult = await changenowService.getEstimatedExchangeAmount(
        finalAmount, // Use final amount including fees
        currency.toLowerCase(),
        "usdt" // Default to usdt
      );
      estimatedAmount = estimateResult.data.estimatedAmount;
    } catch (estimateError) {
      console.warn(
        "Failed to get estimated amount, using fallback:",
        estimateError.message
      );
      // Use a rough estimate: 1 USD ≈ 0.00002 BTC (this is just a fallback)
      estimatedAmount = Number(finalAmount) * 0.00002;
    }

    // Use wallet address from database or fallback
    const walletAddress = paymentSettings?.merchantId;

    // Prefer dedicated fiat key; fallback to the standard key if not set
    const fiatApiKey = paymentSettings?.fiatApiKey || paymentSettings?.apiKey;
    if (!fiatApiKey) {
      return NextResponse.json(
        { error: "ChangeNOW API key missing." },
        { status: 500 }
      );
    }

    // Create fiat transaction (card → crypto) with final amount
    const result = await changenowService.createFiatTransaction({
      fromAmount: finalAmount, // Use final amount including fees
      fromCurrency: currency.toLowerCase(),
      toCurrency: "usdt",
      payoutAddress: walletAddress,
      depositType: "VISA_MC1",
      payoutType: "CRYPTO_THROUGH_CN",
      externalPartnerLinkId: paymentSettings?.externalPartnerLinkId || "",
      customerEmail: customerEmail || "",
      customerPhone: contactInfo?.phone || "",
      apiKey: fiatApiKey, // pass fiat key here
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to create ChangeNOW transaction" },
        { status: 400 }
      );
    }

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
        orderNumber: orderId,
        userId: userId || null,
        guestEmail: resolvedGuestEmail,
        products: orderProducts,
        totalAmount: Number(finalAmount), // Store final amount including fees
        originalAmount: Number(amount), // Store original amount
        serviceFee: Number(feeCalculation.feeAmount), // Store service fee
        discountAmount: 0,
        couponCode: couponCode,
        paymentMethod: "Cryptocurrency",
        paymentGateway: "ChangeNOW",
        paymentStatus: "pending",
        contactInfo: resolvedContactInfo,
        status: "new",
      });
    } else {
      order.paymentMethod = "Cryptocurrency";
      order.paymentGateway = "ChangeNOW";
      order.paymentStatus = "pending";
      order.totalAmount = Number(finalAmount); // Update with final amount
      order.originalAmount = Number(amount); // Store original amount
      order.serviceFee = Number(feeCalculation.feeAmount); // Store service fee
    }

    order.changenowPayment = {
      transactionId: result.transactionId,
      payinAddress: result.payinAddress,
      payoutAddress: result.payoutAddress,
      fromCurrency: result.fromCurrency,
      toCurrency: result.toCurrency,
      fromAmount: result.fromAmount,
      toAmount: result.toAmount,
      status: result.status || "new",
      payinExtraId: result.payinExtraId || "",
      refundAddress: result.refundAddress || "",
      refundExtraId: result.refundExtraId || "",
      userId: userId || "",
      contactEmail: customerEmail || "",
      flow: "standard",
      callbackReceived: false,
      lastStatusUpdate: new Date(),
      metadata: changenowMetadata,
    };

    await order.save();

    // Return response in the format expected by frontend
    return NextResponse.json({
      success: true,
      paymentId: result.transactionId,
      checkoutUrl: result.checkoutUrl,
      orderId: order._id,
      amount: finalAmount, // Return final amount
      currency: currency,
      instructions: `Complete payment with your card. ${finalAmount} ${currency} will be converted to ${result.toCurrency} and sent to your wallet.${feeCalculation.feeAmount > 0 ? ` (${formatFeeInfo(feeCalculation)})` : ''}`,
      payinAddress: result.payoutAddress, // This will be the card payment URL
      payinExtraId: result.payoutExtraId,
      fromAmount: result.fromAmount,
      toAmount: result.toAmount,
      fromCurrency: result.fromCurrency,
      toCurrency: result.toCurrency,
      expiresAt: result.expiresAt,
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
    console.error("ChangeNOW create error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create ChangeNOW transaction" },
      { status: 500 }
    );
  }
}
