import { connectToDatabase } from "@/lib/db";
import { sendIPTVCredentialsEmail } from "@/lib/email";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { orderId, paymentMethod = "Balance" } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findById(orderId).populate(
      "userId",
      "email profile.firstName profile.lastName profile.username"
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Get user information
    const user = order.userId;
    const fullName =
      user?.profile?.firstName && user?.profile?.lastName
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user?.profile?.username || user?.email || "there";

    const email = user?.email || order.guestEmail;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "No email address found for this order" },
        { status: 400 }
      );
    }

    // Check if IPTV credentials exist
    if (!order.iptvCredentials || order.iptvCredentials.length === 0) {
      return NextResponse.json(
        { success: false, error: "IPTV credentials not found for this order" },
        { status: 400 }
      );
    }

    // Send IPTV credentials email
    const emailSent = await sendIPTVCredentialsEmail({
      toEmail: email,
      fullName: fullName,
      order: order,
    });

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: "Failed to send IPTV credentials email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "IPTV credentials email sent successfully",
    });
  } catch (error) {
    console.error("Error sending IPTV credentials email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send IPTV credentials email" },
      { status: 500 }
    );
  }
}
