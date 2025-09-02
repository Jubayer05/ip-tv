import { connectToDatabase } from "@/lib/db";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const skip = (page - 1) * limit;
    const now = new Date();

    // Show active notifications that are targeted to this user
    const baseMatch = {
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gt: now },
      sentTo: {
        $elemMatch: {
          user: userId,
        },
      },
    };

    const query = { ...baseMatch };

    // When unreadOnly, ensure this user hasn't read it yet
    if (unreadOnly) {
      query["sentTo"] = {
        $elemMatch: {
          user: userId,
          isRead: false,
        },
      };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count unread notifications for this user
    const unreadCount = await Notification.countDocuments({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gt: now },
      sentTo: {
        $elemMatch: {
          user: userId,
          isRead: false,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { page, limit, total: notifications.length },
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { notificationId, userId } = await request.json();
    if (!notificationId || !userId) {
      return NextResponse.json(
        { error: "Notification ID and User ID are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Mark notification as read by updating isRead in sentTo array
    const result = await Notification.findByIdAndUpdate(
      notificationId,
      {
        $set: { "sentTo.$[elem].isRead": true },
      },
      {
        arrayFilters: [{ "elem.user": userId }],
        new: true,
      }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
