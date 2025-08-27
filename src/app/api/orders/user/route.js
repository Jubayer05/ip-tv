import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import "@/models/Product";
import { NextResponse } from "next/server";

// GET /api/orders/user?email=user@example.com - Fetch orders for specific user or all orders for admin
export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const isAdmin = searchParams.get("isAdmin") === "true";

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    let orders;

    if (isAdmin) {
      // For admin users, fetch all orders
      orders = await Order.find({})
        .populate("products.productId", "name variants")
        .populate("userId", "profile.firstName profile.lastName email")
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // For regular users, fetch only their orders
      orders = await Order.find({
        $or: [
          { "contactInfo.email": email.toLowerCase() },
          { guestEmail: email.toLowerCase() },
        ],
      })
        .populate("products.productId", "name variants")
        .sort({ createdAt: -1 })
        .lean();
    }

    // Transform the data to include plan details
    const transformedOrders = orders.map((order) => {
      const product = order.products?.[0];
      if (product && product.productId) {
        // Find the variant details
        const variant = product.productId.variants?.find(
          (v) => v._id.toString() === product.variantId.toString()
        );
        if (variant) {
          product.planName = variant.name;
          product.durationMonths = variant.durationMonths;
        }
      }
      return order;
    });

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      count: transformedOrders.length,
      isAdmin: isAdmin,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch user orders", details: error?.message },
      { status: 500 }
    );
  }
}
