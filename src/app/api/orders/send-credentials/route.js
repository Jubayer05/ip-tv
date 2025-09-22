import { connectToDatabase } from "@/lib/db";
import { sendIPTVCredentialsEmail } from "@/lib/email";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { orderNumber } = body;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order has IPTV credentials
    if (!order.iptvCredentials || order.iptvCredentials.length === 0) {
      return NextResponse.json(
        { error: "No IPTV credentials found for this order" },
        { status: 400 }
      );
    }

    // Send email with credentials
    const emailSent = await sendIPTVCredentialsEmail({
      toEmail: order.contactInfo.email,
      fullName: order.contactInfo.fullName,
      order,
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send credentials email" },
        { status: 500 }
      );
    }

    // Update order to mark email as sent
    order.credentialsEmailSent = true;
    await order.save();

    return NextResponse.json({
      success: true,
      message: "IPTV credentials email sent successfully",
    });
  } catch (error) {
    console.error("Send credentials email error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
