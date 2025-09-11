import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
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
      paymentStatus: incomingPaymentStatus, // NEW
      totalAmount: incomingTotalAmount, // NEW: Accept totalAmount from frontend
    } = body || {};

    if (!productId || !variantId || !quantity || !devicesAllowed) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch product and find variant
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fix: Use find() instead of .id() for regular arrays
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

    // If totalAmount is provided from frontend (e.g., with coupon discounts), use it
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
      const adultFee = adultChannels
        ? (discountedTotal * adultFeePct) / 100
        : 0;

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
      const adultFee = adultChannels
        ? (discountedTotal * adultFeePct) / 100
        : 0;

      finalTotal = Math.round((discountedTotal + adultFee) * 100) / 100;
    }

    const orderProducts = [
      {
        productId: product._id,
        variantId: variant._id,
        quantity: Number(quantity),
        price: Number(variant.price || 0),
        duration: Number(variant.durationMonths || 0),
        devicesAllowed: Number(devicesAllowed),
        adultChannels: Boolean(adultChannels),
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
        } else {
        }
      }
    }

    const orderDoc = new Order({
      userId: userId || null,
      guestEmail: resolvedGuestEmail,
      products: orderProducts,
      totalAmount: finalTotal, // Use the final total (either from frontend or calculated)
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
