// src/app/api/users/[id]/referrals/route.js
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Settings from "@/models/Settings";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET /api/users/[id]/referrals - Get user's referral history
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // All completed first orders referred by this user
    const orders = await Order.find({
      referredBy: user._id,
      isFirstOrder: true,
      paymentStatus: "completed",
    })
      .select("totalAmount createdAt userId")
      .populate(
        "userId",
        "profile.firstName profile.lastName profile.username email"
      );

    const settings = await Settings.getSettings();
    const commissionPct = Number(settings.affiliateCommissionPct || 10);

    let totalEarnings = 0;
    const referrals = orders.map((order) => {
      const commission =
        Math.round(
          ((Number(order.totalAmount || 0) * commissionPct) / 100) * 100
        ) / 100;
      totalEarnings += commission;

      const u = order.userId;
      return {
        userId: u?._id,
        firstName: u?.profile?.firstName || "",
        lastName: u?.profile?.lastName || "",
        username: u?.profile?.username || "",
        email: u?.email || "",
        orderTotal: order.totalAmount,
        earnings: commission,
        orderDate: order.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user.referral?.code || null,
        totalEarnings,
        totalReferrals: referrals.length,
        referrals,
      },
    });
  } catch (error) {
    console.error("Referral history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral history" },
      { status: 500 }
    );
  }
}
