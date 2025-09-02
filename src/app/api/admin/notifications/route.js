import { connectToDatabase } from "@/lib/db";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

// GET - Fetch all notifications with pagination and filters
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (type) query.type = type;
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;
    if (status === "expired") query.validUntil = { $lt: new Date() };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Notification.countDocuments(query);

    // Get statistics
    const stats = await Notification.aggregate([
      { $match: {} },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isActive", true] },
                    { $gt: ["$validUntil", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          expired: {
            $sum: {
              $cond: [{ $lt: ["$validUntil", new Date()] }, 1, 0],
            },
          },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: stats[0] || {
        total: 0,
        active: 0,
        expired: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new notification
export async function POST(request) {
  try {
    const body = await request.json();

    const { title, message, type, validFrom, validUntil } = body;

    // Validate required fields with detailed logging
    const missingFields = [];

    if (!title || !title.trim()) {
      missingFields.push("title");
    }
    if (!message || !message.trim()) {
      missingFields.push("message");
    }

    if (!validUntil) {
      missingFields.push("validUntil");
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            missingFields,
            title:
              !title || !title.trim()
                ? "Title is required and cannot be empty"
                : null,
            message:
              !message || !message.trim()
                ? "Message is required and cannot be empty"
                : null,
            validUntil: !validUntil ? "Valid until date is required" : null,
          },
          debug: {
            receivedBody: body,
            fieldTypes: {
              title: typeof title,
              message: typeof message,
              type: typeof type,
              validFrom: typeof validFrom,
              validUntil: typeof validUntil,
            },
            fieldValues: {
              title,
              message,
              type,
              validFrom,
              validUntil,
            },
          },
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Create notification
    const notification = new Notification({
      title: title.trim(),
      message: message.trim(),
      type,
      validFrom: validFrom || new Date(),
      validUntil: new Date(validUntil),
    });

    await notification.save();

    // After saving the notification, send it to all active users
    try {
      const User = (await import("@/models/User")).default;
      const activeUsers = await User.find({ isActive: true }).select("_id");

      // Update the notification with sentTo array
      notification.sentTo = activeUsers.map((user) => ({
        user: user._id,
        isRead: false,
      }));

      await notification.save();

      // Verify the saved notification
      const savedNotification = await Notification.findById(notification._id);
    } catch (error) {
      console.error("❌ Error sending to users:", error);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    console.error("Error stack:", error.stack);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = {};
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      
      }
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
