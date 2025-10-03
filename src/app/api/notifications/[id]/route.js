import { connectToDatabase } from "@/lib/db";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const notification = await Notification.findOne({
      _id: id,
      "sentTo.user": userId,
    }).lean();

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    // Check if user has read this notification
    const userSentTo = notification.sentTo.find(
      (sent) => String(sent.user) === String(userId)
    );
    const isRead = userSentTo?.isRead || false;

    return NextResponse.json({
      success: true,
      data: {
        ...notification,
        isRead,
      },
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notification" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const updated = await Notification.findByIdAndUpdate(
      id,
      { $set: { "sentTo.$[elem].isRead": true } },
      { arrayFilters: [{ "elem.user": userId }], new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
