import { connectToDatabase } from "@/lib/db";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const notifications = await Notification.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gt: now },
      "sentTo.user": userId,
    })
      .sort({ createdAt: -1 })
      .limit(Math.max(1, Math.min(limit, 100)))
      .lean();

    const unreadCount = notifications.reduce((acc, n) => {
      const sent = (n.sentTo || []).find(
        (s) => String(s.user) === String(userId)
      );
      return acc + (sent && !sent.isRead ? 1 : 0);
    }, 0);

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (e) {
    console.error("Notifications GET error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const { notificationId, userId } = await request.json();

    if (!notificationId || !userId) {
      return NextResponse.json(
        { success: false, error: "notificationId and userId are required" },
        { status: 400 }
      );
    }

    const updated = await Notification.findByIdAndUpdate(
      notificationId,
      { $set: { "sentTo.$[elem].isRead": true } },
      { arrayFilters: [{ "elem.user": userId }], new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    console.error("Notifications POST error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
