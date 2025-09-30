import { connectToDatabase } from "@/lib/db";
import plisioService from "@/lib/paymentServices/plisioService";
import Order from "@/models/Order";
import User from "@/models/User"; // Added import for User model
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { orderNumber } = params;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    console.log("Looking for order with orderNumber:", orderNumber); // Add this debug log

    await connectToDatabase();

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      console.log("Order not found in database. Available orders:"); // Add debug logging
      const allOrders = await Order.find({}).select("orderNumber").limit(10);
      console.log(
        "Sample orders:",
        allOrders.map((o) => o.orderNumber)
      );

      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("Order found:", {
      id: order._id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      paymentStatus: order.paymentStatus,
    }); // Add this debug log

    let plisioStatus = null;

    // If order has Plisio payment, get latest status
    if (order.plisioPayment?.invoiceId) {
      try {
        const result = await plisioService.getInvoiceDetails(
          order.plisioPayment.invoiceId
        );
        const invoice = result.data;

        plisioStatus = {
          invoiceId: invoice.id,
          status: invoice.status,
          confirmations: invoice.confirmations || 0,
          actualSum: invoice.actual_sum || "0.00000000",
          isExpired: Date.now() / 1000 > invoice.expire_at_utc,
          timeRemaining: Math.max(0, invoice.expire_at_utc - Date.now() / 1000),
          walletAddress: invoice.wallet_hash,
          amount: invoice.amount,
          currency: invoice.currency,
        };

        // Update order if status changed
        if (order.plisioPayment.status !== invoice.status) {
          order.plisioPayment.status = invoice.status;
          order.plisioPayment.confirmations = invoice.confirmations || 0;
          order.plisioPayment.actualSum = invoice.actual_sum || "0.00000000";
          order.plisioPayment.lastStatusUpdate = new Date();

          // Update payment status based on Plisio status
          if (invoice.status === "completed") {
            order.paymentStatus = "completed";
          } else if (
            ["error", "cancelled", "expired"].includes(invoice.status)
          ) {
            order.paymentStatus = "failed";
          }

          await order.save();
        }

        // If invoice status is "pending", upgrade free trial to official account
        if (invoice.status === "pending" && order.userId) {
          try {
            // Get user data to access free trial credentials
            const user = await User.findById(order.userId);
            if (
              user?.freeTrial?.trialData?.username &&
              user?.freeTrial?.trialData?.password
            ) {
              // Get duration from order product variant and map to zlive package ID
              const productVariant = order.products?.[0];
              const durationMonths = productVariant?.duration || 1; // Get duration in months
              const deviceCount = productVariant?.devicesAllowed || 1;

              // Map duration to zlive package ID
              let packageId;
              switch (durationMonths) {
                case 1:
                  packageId = 2; // 1 Month Subscription
                  break;
                case 3:
                  packageId = 3; // 3 Month Subscription
                  break;
                case 6:
                  packageId = 4; // 6 Month Subscription
                  break;
                case 12:
                  packageId = 5; // 12 Month Subscription
                  break;
                default:
                  packageId = 2; // Default to 1 month if duration doesn't match
                  console.warn(
                    `Unknown duration ${durationMonths} months, defaulting to package ID 2`
                  );
              }

              console.log("Free trial upgrade API called:", {
                key: process.env.ZLIVE_API_KEY || "your_api_key_here",
                username: user.freeTrial.trialData.username,
                password: user.freeTrial.trialData.password,
                action: "update",
                val: packageId,
                con: deviceCount,
              });

              // Call the free trial upgrade API
              const upgradeResponse = await fetch(
                "http://zlive.cc/api/free-trail-upgrade",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    key: process.env.ZLIVE_API_KEY || "your_api_key_here", // Replace with actual env variable
                    username: user.freeTrial.trialData.username,
                    password: user.freeTrial.trialData.password,
                    action: "update",
                    val: packageId,
                    con: deviceCount,
                  }),
                }
              );

              if (upgradeResponse.ok) {
                const upgradeData = await upgradeResponse.json();
                console.log("Free trial upgraded successfully:", upgradeData);

                // Optionally update order with upgrade information
                order.plisioPayment.upgradeAttempted = true;
                order.plisioPayment.upgradeResponse = upgradeData;
                await order.save();
              } else {
                console.error(
                  "Failed to upgrade free trial:",
                  await upgradeResponse.text()
                );
              }
            }
          } catch (upgradeError) {
            console.error("Error upgrading free trial:", upgradeError);
          }
        }
      } catch (error) {
        console.error("Error fetching Plisio status:", error);
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        paymentGateway: order.paymentGateway,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      plisioPayment: order.plisioPayment,
      plisioStatus,
    });
  } catch (error) {
    console.error("Order payment status error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get order payment status" },
      { status: 500 }
    );
  }
}
