import { connectToDatabase } from "@/lib/db";
import { getTemplateIdByAdultChannels } from "@/lib/iptvUtils";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import User from "@/models/User";
import { NextResponse } from "next/server";

// helpers
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function generateKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = (len) =>
    Array.from(
      { length: len },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  return `CS-${segment(4)}-${segment(4)}-${segment(4)}`;
}

export async function GET() {
  try {
    // Can be filled later for admin/user listings
    return NextResponse.json({ success: true, orders: [] });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      userId,
      guestEmail,
      contactInfo: contactInfoInput,
      productId,
      variantId,
      quantity,
      devicesAllowed,
      adultChannels = false,
      couponCode = "",
      paymentMethod = "Manual",
      paymentGateway = "None",
      paymentStatus: incomingPaymentStatus,
      totalAmount: incomingTotalAmount,

      // IPTV Configuration
      lineType = 0,
      // Remove templateId from input, we'll auto-assign it
      macAddresses = [],
      adultChannelsConfig = [],

      // Generated credentials from frontend
      generatedCredentials = [],
    } = body || {};

    if (!productId || !variantId || !quantity || !devicesAllowed) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate IPTV configuration
    if (![0, 1, 2].includes(lineType)) {
      return NextResponse.json(
        { error: "Invalid lineType. Must be 0 (M3U), 1 (MAG), or 2 (Enigma2)" },
        { status: 400 }
      );
    }

    // Auto-assign templateId based on adult channels for multiple accounts
    let templateId;

    // Check if we have account configurations from the new multi-account system
    if (body.accountConfigurations && body.accountConfigurations.length > 0) {
      // Use the new account configurations to determine template
      const hasAnyAdultChannels = body.accountConfigurations.some(
        (config) => config.adultChannels
      );
      templateId = getTemplateIdByAdultChannels(hasAnyAdultChannels);
    } else {
      // Fallback to old logic for backward compatibility
      if (lineType === 0) {
        // M3U
        templateId = getTemplateIdByAdultChannels(adultChannels);
      } else {
        // MAG/Enigma2 - check if any device has adult channels
        const hasAnyAdultChannels = adultChannelsConfig.some(
          (enabled) => enabled
        );
        templateId = getTemplateIdByAdultChannels(hasAnyAdultChannels);
      }
    }

    // Validate MAC addresses for MAG/Enigma2
    if (lineType > 0) {
      if (macAddresses.length !== quantity) {
        return NextResponse.json(
          { error: "MAC addresses required for all MAG/Enigma2 devices" },
          { status: 400 }
        );
      }

      for (let i = 0; i < quantity; i++) {
        if (!macAddresses[i] || macAddresses[i].trim() === "") {
          return NextResponse.json(
            { error: `MAC address required for device #${i + 1}` },
            { status: 400 }
          );
        }
      }
    }

    // Update the validation for credentials match quantity to handle multiple accounts
    if (generatedCredentials.length > 0) {
      // For both M3U and MAG/Enigma2, we now support multiple accounts
      // Each account should have its own credentials
      if (generatedCredentials.length !== quantity) {
        return NextResponse.json(
          {
            error: `Expected ${quantity} credentials for ${quantity} accounts, but received ${generatedCredentials.length}`,
            details: `Each IPTV account requires its own username and password credentials.`,
          },
          { status: 400 }
        );
      }
    }

    // Fetch product and find variant
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const variant = product.variants.find(
      (v) => v._id.toString() === variantId
    );
    if (!variant) {
      return NextResponse.json(
        {
          error: "Variant not found",
          details: `Variant ID ${variantId} not found in product. Available variants: ${product.variants
            .map((v) => v.name)
            .join(", ")}`,
        },
        { status: 404 }
      );
    }

    // Build contact info
    let contactInfo = contactInfoInput;
    let resolvedGuestEmail = guestEmail || contactInfoInput?.email || null;

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        contactInfo = {
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
    }

    if (!contactInfo?.fullName || !contactInfo?.email) {
      return NextResponse.json(
        { error: "Contact full name and email are required" },
        { status: 400 }
      );
    }

    // Calculate pricing
    let finalTotal;
    let discountAmount = 0;

    if (incomingTotalAmount && incomingTotalAmount > 0) {
      finalTotal = Number(incomingTotalAmount);
      // Calculate discount amount for record keeping
      const deviceRule = (product.devicePricing || []).find(
        (d) => d.deviceCount === Number(devicesAllowed)
      );
      const deviceMultiplier = deviceRule ? deviceRule.multiplier : 1;
      const basePrice = Number(variant.price || 0);
      const pricePerDevice = basePrice * deviceMultiplier;
      const qty = Number(quantity);
      let subtotal = pricePerDevice * qty;

      const bulkDiscounts = product.bulkDiscounts || [];
      const applicableDiscount = bulkDiscounts
        .filter((d) => qty >= d.minQuantity)
        .sort((a, b) => b.minQuantity - a.minQuantity)[0];

      const discountPercentage = applicableDiscount
        ? applicableDiscount.discountPercentage
        : 0;
      const bulkDiscountAmount =
        Math.round(((subtotal * discountPercentage) / 100) * 100) / 100;

      let discountedTotal = subtotal - bulkDiscountAmount;
      const adultFeePct = product.adultChannelsFeePercentage || 0;

      // Calculate adult fee based on line type
      let adultFee = 0;
      if (lineType === 0) {
        // M3U
        if (adultChannels) {
          adultFee = (discountedTotal * adultFeePct) / 100;
        }
      } else {
        // MAG/Enigma2
        const adultEnabledCount = adultChannelsConfig.filter(
          (enabled) => enabled
        ).length;
        if (adultEnabledCount > 0) {
          const pricePerLine = discountedTotal / qty;
          adultFee = (pricePerLine * adultEnabledCount * adultFeePct) / 100;
        }
      }

      const calculatedTotal =
        Math.round((discountedTotal + adultFee) * 100) / 100;
      discountAmount = Math.max(0, calculatedTotal - finalTotal);
    } else {
      // Original calculation logic when no totalAmount is provided
      const deviceRule = (product.devicePricing || []).find(
        (d) => d.deviceCount === Number(devicesAllowed)
      );
      const deviceMultiplier = deviceRule ? deviceRule.multiplier : 1;

      const basePrice = Number(variant.price || 0);
      const pricePerDevice = basePrice * deviceMultiplier;
      const qty = Number(quantity);

      let subtotal = pricePerDevice * qty;

      const bulkDiscounts = product.bulkDiscounts || [];
      const applicableDiscount = bulkDiscounts
        .filter((d) => qty >= d.minQuantity)
        .sort((a, b) => b.minQuantity - a.minQuantity)[0];

      const discountPercentage = applicableDiscount
        ? applicableDiscount.discountPercentage
        : 0;
      discountAmount =
        Math.round(((subtotal * discountPercentage) / 100) * 100) / 100;

      let discountedTotal = subtotal - discountAmount;
      const adultFeePct = product.adultChannelsFeePercentage || 0;

      // Calculate adult fee based on line type
      let adultFee = 0;
      if (lineType === 0) {
        // M3U
        if (adultChannels) {
          adultFee = (discountedTotal * adultFeePct) / 100;
        }
      } else {
        // MAG/Enigma2
        const adultEnabledCount = adultChannelsConfig.filter(
          (enabled) => enabled
        ).length;
        if (adultEnabledCount > 0) {
          const pricePerLine = discountedTotal / qty;
          adultFee = (pricePerLine * adultEnabledCount * adultFeePct) / 100;
        }
      }

      finalTotal = Math.round((discountedTotal + adultFee) * 100) / 100;
    }

    // Update the orderProducts to handle multiple account configurations
    const orderProducts = [
      {
        productId: product._id,
        variantId: variant._id,
        quantity: Number(quantity),
        price: Number(variant.price || 0),
        duration: Number(variant.durationMonths || 0),
        devicesAllowed: Number(devicesAllowed),
        adultChannels: lineType === 0 ? Boolean(adultChannels) : false,

        // IPTV Configuration
        lineType: Number(lineType),
        templateId: Number(templateId), // Use auto-assigned templateId
        macAddresses: lineType > 0 ? macAddresses : [],
        adultChannelsConfig: lineType > 0 ? adultChannelsConfig : [],

        // Generated credentials for multiple accounts
        generatedCredentials:
          generatedCredentials.length > 0 ? generatedCredentials : [],

        // Store account configurations for reference
        accountConfigurations: body.accountConfigurations || [],
      },
    ];

    const keys = [];
    const expiry = addMonths(new Date(), Number(variant.durationMonths || 0));
    for (let i = 0; i < Number(quantity); i++) {
      keys.push({
        key: generateKey(),
        productId: product._id,
        expiresAt: expiry,
        isActive: true,
      });
    }

    // First order + referral detection
    let referredBy = null;
    let isFirstOrder = false;

    if (userId) {
      const existingOrders = await Order.countDocuments({ userId });
      isFirstOrder = existingOrders === 0;

      if (isFirstOrder) {
        const user = await User.findById(userId);
        if (user?.referral?.referredBy) {
          referredBy = user.referral.referredBy;
        }
      }
    }

    const orderDoc = new Order({
      userId: userId || null,
      guestEmail: resolvedGuestEmail,
      products: orderProducts,
      totalAmount: finalTotal,
      discountAmount,
      couponCode,
      paymentMethod,
      paymentGateway,
      paymentStatus: incomingPaymentStatus || "pending",
      keys,
      contactInfo,
      status: "completed",
      referredBy,
      isFirstOrder,
    });

    await orderDoc.save();

    // Update user's current plan if order is completed and user exists
    if (userId && orderDoc.paymentStatus === "completed") {
      try {
        const user = await User.findById(userId);
        if (user) {
          const product = orderDoc.products[0];
          const productDoc = await Product.findById(product.productId);
          const variant = productDoc?.variants?.find(
            (v) => v._id.toString() === product.variantId.toString()
          );

          if (variant) {
            await user.updateCurrentPlan({
              orderId: orderDoc._id,
              planName: variant.name,
              price: product.price,
              duration: product.duration || variant.durationMonths || 1,
              devicesAllowed: product.devicesAllowed,
              adultChannels: product.adultChannels,
            });
          }
        }
      } catch (planUpdateError) {
        console.error("Error updating user plan:", planUpdateError);
      }
    }

    // Process referral commission if this is a first order and payment is completed
    if (isFirstOrder && referredBy && orderDoc.paymentStatus === "completed") {
      try {
        const settings = await Settings.getSettings();
        const commissionPct = Number(settings.affiliateCommissionPct || 10);

        const commission =
          Math.round(((Number(finalTotal) * commissionPct) / 100) * 100) / 100;

        if (commission > 0) {
          const referrer = await User.findById(referredBy);
          if (referrer) {
            const currentEarnings = Number(referrer.referral?.earnings || 0);
            referrer.referral.earnings = currentEarnings + commission;
            await referrer.save();
          }
        }
      } catch (commissionError) {
        console.error("Error processing referral commission:", commissionError);
      }
    }

    return NextResponse.json({
      success: true,
      order: orderDoc,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
