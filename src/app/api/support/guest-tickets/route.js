import { connectToDatabase } from "@/lib/db";
import GuestSupportTicket from "@/models/GuestSupportTicket";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET /api/support/guest-tickets
// - admin list: no guestEmail -> returns all guest tickets
// - guest list: provide ?guestEmail=<email> -> returns guest's tickets
export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const guestEmail = searchParams.get("guestEmail");
    const status = searchParams.get("status"); // optional filter "open|reply|close"

    const query = {};
    if (guestEmail) {
      query.guestEmail = guestEmail;
    }
    if (status && ["open", "reply", "close"].includes(status)) {
      query.status = status;
    }

    const tickets = await GuestSupportTicket.find(query)
      .sort({ createdAt: -1 })
      .select("-__v");

    return NextResponse.json({
      success: true,
      data: tickets,
    });
  } catch (e) {
    console.error("Guest tickets GET error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch guest tickets" },
      { status: 500 }
    );
  }
}

// POST /api/support/guest-tickets
// Body: { guestEmail, guestName?, title, description, image? }
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { guestEmail, guestName, title, description, image } = body || {};

    if (!guestEmail || !title || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "guestEmail, title and description are required",
        },
        { status: 400 }
      );
    }

    // Enforce: not more than 3 open tickets (status 'open' or 'reply')
    const openCount = await GuestSupportTicket.countDocuments({
      guestEmail,
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

    const ticket = new GuestSupportTicket({
      guestEmail,
      guestName: guestName || "Guest User",
      title: String(title).trim(),
      description: String(description).trim(),
      image: image || null,
      status: "open",
      messages: [
        {
          sender: "guest",
          text: String(description).trim(),
          image: image || null,
        },
      ],
      lastUpdatedBy: "guest",
    });

    await ticket.save();

    // Notify admins/support staff about the new guest ticket
    try {
      const superAdminEmails = [
        "jubayer0504@gmail.com",
        "alan.sangasare10@gmail.com",
      ];

      const adminsAndSupport = await User.find({
        $or: [
          { role: { $in: ["admin", "support"] } },
          { email: { $in: superAdminEmails } },
        ],
        isActive: true,
      })
        .select("_id")
        .lean();

      if (adminsAndSupport.length > 0) {
        const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await Notification.create({
          title: "New Support Ticket",
          message: `A new guest ticket was created: "${ticket.title}" (${ticket.guestEmail})`,
          type: "notice",
          validUntil,
          isActive: true,
          sentTo: adminsAndSupport.map((u) => ({
            user: u._id,
            isRead: false,
          })),
        });
      }
    } catch (notifyErr) {
      console.error(
        "Failed to create admin notification for guest ticket:",
        notifyErr
      );
    }

    return NextResponse.json(
      { success: true, data: ticket, message: "Guest ticket created" },
      { status: 201 }
    );
  } catch (e) {
    console.error("Guest tickets POST error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to create guest ticket" },
      { status: 500 }
    );
  }
}
