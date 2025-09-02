import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Review from "@/models/Review";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET /api/reviews/user-orders - Get user's completed orders available for review
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // First, get the user to check if they exist and get their email
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Let's check ALL orders for this user first (without paymentStatus filter)
    const allOrders = await Order.find({
      $or: [
        { userId: userId },
        { "contactInfo.email": user.email.toLowerCase() },
      ],
    }).select(
      "_id orderNumber totalAmount createdAt userId guestEmail contactInfo paymentStatus"
    );

    // Now let's check specifically for completed orders
    // Change the query to include pending orders for testing
    const orderQuery = {
      $or: [
        { userId: userId },
        { "contactInfo.email": user.email.toLowerCase() },
      ],
      // Remove the paymentStatus filter temporarily for testing
      // paymentStatus: "completed",
    };

    const completedOrders = await Order.find(orderQuery)
      .select(
        "_id orderNumber totalAmount createdAt userId guestEmail contactInfo paymentStatus"
      )
      .sort({ createdAt: -1 });

    // Get existing reviews for these orders
    const orderIds = completedOrders.map((order) => order._id);

    const existingReviews = await Review.find({
      orderId: { $in: orderIds },
      userId: userId,
    }).select("orderId");

    const reviewedOrderIds = existingReviews.map((review) =>
      review.orderId.toString()
    );

    // Filter out already reviewed orders
    const availableOrders = completedOrders.filter(
      (order) => !reviewedOrderIds.includes(order._id.toString())
    );

    return NextResponse.json({
      success: true,
      data: availableOrders,
    });
  } catch (error) {
    console.error("=== ERROR in user-orders API ===");
    console.error("Error details:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user orders" },
      { status: 500 }
    );
  }
}
