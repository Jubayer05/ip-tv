import { connectToDatabase } from "@/lib/db";
import SupportTicket from "@/models/SupportTicket";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET /api/support/tickets
// - admin list: no userId -> returns all
// - user list: provide ?userId=<id> -> returns user's tickets
export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status"); // optional filter "open|reply|close"
    const withUserData = searchParams.get("withUserData") === "true"; // new param

    const query = {};
    if (userId) query.user = userId;
    if (status && ["open", "reply", "close"].includes(status)) {
      query.status = status;
    }

    let tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .select("-__v");

    // If admin wants user data, populate it
    if (withUserData && !userId) {
      tickets = await Promise.all(
        tickets.map(async (ticket) => {
          try {
            const user = await User.findById(ticket.user).select(
              "firstName lastName"
            );
            return {
              ...ticket.toObject(),
              userDisplayName: user
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                  "Unknown User"
                : "Unknown User",
            };
          } catch (e) {
            return {
              ...ticket.toObject(),
              userDisplayName: "Unknown User",
            };
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      data: tickets,
    });
  } catch (e) {
    console.error("Tickets GET error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

// POST /api/support/tickets
// Body: { userId, title, description, image? }
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { userId, title, description, image } = body || {};

    if (!userId || !title || !description) {
      return NextResponse.json(
        { success: false, error: "userId, title and description are required" },
        { status: 400 }
      );
    }

    // Enforce: not more than 3 open tickets (status 'open' or 'reply')
    const openCount = await SupportTicket.countDocuments({
      user: userId,
      status: { $in: ["open", "reply"] },
    });
    if (openCount >= 3) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You already have 3 open tickets. Please close one to create a new ticket.",
        },
        { status: 400 }
      );
    }

    const ticket = new SupportTicket({
      user: userId,
      title: String(title).trim(),
      description: String(description).trim(),
      image: image || null,
      status: "open",
      messages: [
        {
          sender: "user",
          text: String(description).trim(),
          image: image || null,
        },
      ],
      lastUpdatedBy: "user",
    });

    await ticket.save();

    return NextResponse.json(
      { success: true, data: ticket, message: "Ticket created" },
      { status: 201 }
    );
  } catch (e) {
    console.error("Tickets POST error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
