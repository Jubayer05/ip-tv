import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET /api/users/current-plan?email=user@example.com - Get user's current plan
export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select("currentPlan");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If no current plan, try to get the latest completed order
    if (!user.currentPlan.isActive) {
      const latestOrder = await Order.findOne({
        $or: [
          { "contactInfo.email": email.toLowerCase() },
          { guestEmail: email.toLowerCase() },
        ],
        status: "completed",
      })
        .populate("products.productId", "name variants")
        .sort({ createdAt: -1 })
        .lean();

      if (latestOrder && latestOrder.products.length > 0) {
        const product = latestOrder.products[0];
        const variant = product.productId?.variants?.find(
          (v) => v._id.toString() === product.variantId.toString()
        );

        if (variant) {
          // Calculate if the order is still valid
          const orderDate = new Date(latestOrder.createdAt);
          const expireDate = new Date(
            orderDate.getTime() +
              (product.duration || variant.durationMonths || 1) *
                30 *
                24 *
                60 *
                60 *
                1000
          );
          const isStillValid = new Date() <= expireDate;

          if (isStillValid) {
            // Update user's current plan with this order
            await User.findByIdAndUpdate(user._id, {
              currentPlan: {
                isActive: true,
                orderId: latestOrder._id,
                planName: variant.name,
                price: product.price,
                duration: product.duration || variant.durationMonths || 1,
                devicesAllowed: product.devicesAllowed,
                adultChannels: product.adultChannels,
                startDate: orderDate,
                expireDate: expireDate,
                autoRenew: false,
              },
            });

            return NextResponse.json({
              success: true,
              plan: {
                isActive: true,
                planName: variant.name,
                price: product.price,
                duration: product.duration || variant.durationMonths || 1,
                devicesAllowed: product.devicesAllowed,
                adultChannels: product.adultChannels,
                startDate: orderDate,
                expireDate: expireDate,
                daysLeft: Math.ceil(
                  (expireDate - new Date()) / (1000 * 60 * 60 * 24)
                ),
              },
            });
          }
        }
      }
    }

    // Return current plan status
    const planStatus = user.getPlanStatus();

    return NextResponse.json({
      success: true,
      plan: {
        isActive: user.currentPlan.isActive,
        planName: user.currentPlan.planName,
        price: user.currentPlan.price,
        duration: user.currentPlan.duration,
        devicesAllowed: user.currentPlan.devicesAllowed,
        adultChannels: user.currentPlan.adultChannels,
        startDate: user.currentPlan.startDate,
        expireDate: user.currentPlan.expireDate,
        status: planStatus.status,
        message: planStatus.message,
        daysLeft: planStatus.daysLeft || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching current plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch current plan" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/current-plan?email=user@example.com - Cancel current plan
export async function DELETE(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cancel the current plan
    await user.cancelCurrentPlan();

    return NextResponse.json({
      success: true,
      message: "Plan cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling plan:", error);
    return NextResponse.json(
      { error: "Failed to cancel plan" },
      { status: 500 }
    );
  }
}
