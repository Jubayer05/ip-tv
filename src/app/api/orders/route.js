import { connectToDatabase } from "@/lib/db";
import { sendOrderKeysEmail } from "@/lib/email";
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

    console.log("=== ORDER CREATION START ===");
    console.log("Request body:", JSON.stringify(body, null, 2));

    // Expected minimal payload from client
    // {
    //   userId? : string,
    //   contactInfo?: { fullName, email, phone? }, // required if no userId
    //   guestEmail?: string, // optional but set if guest
    //   productId: string,
    //   variantId: string,
    //   quantity: number,
    //   devicesAllowed: number,
    //   adultChannels: boolean,
    //   couponCode?: string,
    //   paymentMethod?: string,
    //   paymentGateway?: string,
    //   paymentStatus?: "pending" | "completed" | "failed" | "refunded"
    // }

    const {
      userId,
      contactInfo: contactInfoInput,
      guestEmail,
      productId,
      variantId,
      quantity,
      devicesAllowed,
      adultChannels = false,
      couponCode = "",
      paymentMethod = "Manual",
      paymentGateway = "None",
      paymentStatus: incomingPaymentStatus, // NEW
    } = body || {};

    console.log("Extracted userId:", userId);
    console.log("Extracted paymentStatus:", incomingPaymentStatus);

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
      console.log(
        "Available variant IDs:",
        product.variants.map((v) => v._id.toString())
      );
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
        console.log("User found:", {
          id: user._id,
          email: user.email,
          referral: user.referral,
        });
      }
    }

    if (!contactInfo?.fullName || !contactInfo?.email) {
      return NextResponse.json(
        { error: "Contact full name and email are required" },
        { status: 400 }
      );
    }

    // Subtotal and fees
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
    const discountAmount =
      Math.round(((subtotal * discountPercentage) / 100) * 100) / 100;

    let discountedTotal = subtotal - discountAmount;
    const adultFeePct = product.adultChannelsFeePercentage || 0;
    const adultFee = adultChannels ? (discountedTotal * adultFeePct) / 100 : 0;

    const finalTotal = Math.round((discountedTotal + adultFee) * 100) / 100;

    const orderProducts = [
      {
        productId: product._id,
        variantId: variant._id,
        quantity: qty,
        price: pricePerDevice,
        duration: Number(variant.durationMonths || 0),
        devicesAllowed: Number(devicesAllowed),
        adultChannels: Boolean(adultChannels),
      },
    ];

    const keys = [];
    const expiry = addMonths(new Date(), Number(variant.durationMonths || 0));
    for (let i = 0; i < qty; i++) {
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
      console.log("=== CHECKING FIRST ORDER STATUS ===");
      const existingOrders = await Order.countDocuments({ userId });
      isFirstOrder = existingOrders === 0;
      console.log("Existing orders count:", existingOrders);
      console.log("Is first order:", isFirstOrder);

      if (isFirstOrder) {
        console.log("=== CHECKING REFERRAL STATUS ===");
        const user = await User.findById(userId);
        console.log("User referral data:", user?.referral);
        if (user?.referral?.referredBy) {
          referredBy = user.referral.referredBy;
          console.log("Referral found! referredBy:", referredBy);
        } else {
          console.log("No referral found for user");
        }
      }
    }

    console.log("=== ORDER DOCUMENT CREATION ===");
    console.log("Final order data:", {
      userId,
      paymentStatus: incomingPaymentStatus || "pending",
      referredBy,
      isFirstOrder,
      totalAmount: finalTotal,
    });

    const orderDoc = new Order({
      userId: userId || null,
      guestEmail: resolvedGuestEmail,
      products: orderProducts,
      totalAmount: finalTotal,
      discountAmount,
      couponCode,
      paymentMethod,
      paymentGateway,
      paymentStatus: incomingPaymentStatus || "pending", // NEW
      keys,
      contactInfo,
      status: "completed",
      referredBy,
      isFirstOrder,
    });

    console.log("Order document before save:", {
      referredBy: orderDoc.referredBy,
      isFirstOrder: orderDoc.isFirstOrder,
      paymentStatus: orderDoc.paymentStatus,
    });

    await orderDoc.save();
    console.log("Order saved with ID:", orderDoc._id);

    // Refresh the document to ensure all fields are loaded
    const savedOrder = await Order.findById(orderDoc._id);
    console.log("Order document after save and refresh:", {
      referredBy: savedOrder?.referredBy,
      isFirstOrder: savedOrder?.isFirstOrder,
      paymentStatus: savedOrder?.paymentStatus,
    });

    // If order is created as completed and qualifies, credit the referrer now
    console.log("=== CHECKING REFERRAL COMMISSION ELIGIBILITY ===");
    console.log("Payment status:", savedOrder?.paymentStatus);
    console.log("Is first order:", savedOrder?.isFirstOrder);
    console.log("Referred by:", savedOrder?.referredBy);

    if (
      savedOrder?.paymentStatus === "completed" &&
      savedOrder?.isFirstOrder &&
      savedOrder?.referredBy
    ) {
      console.log("=== PROCESSING REFERRAL COMMISSION ===");
      try {
        const settings = await Settings.getSettings();
        const commissionPct = Number(settings.affiliateCommissionPct || 10);
        const commission =
          Math.round(
            ((Number(savedOrder.totalAmount || 0) * commissionPct) / 100) * 100
          ) / 100;

        console.log("Commission calculation:", {
          totalAmount: savedOrder.totalAmount,
          percentage: commissionPct,
          commission: commission,
        });

        if (commission > 0) {
          // Update referrer earnings
          const referrer = await User.findById(savedOrder.referredBy);
          console.log("Referrer found:", referrer ? "yes" : "no");

          if (referrer) {
            console.log("Referrer current data:", {
              id: referrer._id,
              currentEarnings: referrer.referral?.earnings || 0,
              currentBalance: referrer.balance || 0,
            });

            referrer.referral.earnings =
              Number(referrer.referral.earnings || 0) + commission;
            await referrer.save();

            console.log(
              "Referrer earnings updated to:",
              referrer.referral.earnings
            );

            // Call balance API so it appears in your logs/flow
            const origin = new URL(request.url).origin;
            console.log(
              "Calling balance API:",
              `${origin}/api/users/${referrer._id}/balance`
            );

            const balanceResponse = await fetch(
              `${origin}/api/users/${referrer._id}/balance`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amountToAdd: commission }),
              }
            );

            console.log("Balance API response status:", balanceResponse.status);
            const balanceData = await balanceResponse.json();
            console.log("Balance API response:", balanceData);

            // Also update balance directly as backup
            referrer.balance = Number(referrer.balance || 0) + commission;
            await referrer.save();
            console.log("Referrer balance updated to:", referrer.balance);
          }
        }
      } catch (e) {
        console.error("Commission on create error:", e);
      }
    } else {
      console.log("Order does not qualify for referral commission");
    }

    await sendOrderKeysEmail({
      toEmail: contactInfo.email,
      fullName: contactInfo.fullName,
      order: orderDoc.toObject(),
    });

    console.log("=== ORDER CREATION COMPLETE ===");
    return NextResponse.json(
      { success: true, order: orderDoc },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order create error:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error?.message },
      { status: 500 }
    );
  }
}
