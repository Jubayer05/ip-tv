import { connectToDatabase } from "@/lib/db";
import { emitNewTicket, emitTicketListUpdate } from "@/lib/socket";
import { getSuperAdminEmails } from "@/lib/superAdmin";
import Notification from "@/models/Notification";
import SupportTicket from "@/models/SupportTicket";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET /api/support/tickets
// - admin list: no userId -> returns all
// - user list: provide ?userId=<id> -> returns user's tickets
// - guest list: provide ?guestEmail=<email> -> returns guest's tickets
export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const guestEmail = searchParams.get("guestEmail");
    const status = searchParams.get("status"); // optional filter "open|reply|close"
    const withUserData = searchParams.get("withUserData") === "true";

    const query = {};
    if (userId) {
      query.user = userId;
      query.isGuestTicket = false;
    } else if (guestEmail) {
      query.guestEmail = guestEmail;
      query.isGuestTicket = true;
    }
    if (status && ["open", "reply", "close"].includes(status)) {
      query.status = status;
    }

    let tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .select("-__v");

    // If admin wants user data, populate it (optimized with batch fetching)
    if (withUserData && !userId && !guestEmail) {
      // Collect all user IDs for batch lookup
      const userIds = tickets
        .filter((t) => !t.isGuestTicket && t.user)
        .map((t) => t.user);

      // Batch fetch all users at once (more efficient)
      const usersMap = new Map();
      if (userIds.length > 0) {
        try {
          const users = await User.find({
            _id: { $in: userIds },
          }).select("email profile.firstName profile.lastName");
          users.forEach((user) => {
            usersMap.set(user._id.toString(), user);
          });
        } catch (e) {
          console.error("Error fetching users:", e);
        }
      }

      // Map tickets with user data
      tickets = tickets.map((ticket) => {
        try {
          if (ticket.isGuestTicket) {
            return {
              ...ticket.toObject(),
              userDisplayName:
                ticket.guestName || ticket.guestEmail || "Guest User",
              userEmail: ticket.guestEmail || null,
              isGuest: true,
            };
          } else {
            const user = usersMap.get(ticket.user?.toString());
            return {
              ...ticket.toObject(),
              userDisplayName: user
                ? `${user.profile?.firstName || ""} ${
                    user.profile?.lastName || ""
                  }`.trim() || "Unknown User"
                : "Unknown User",
              userEmail: user?.email || null,
              isGuest: false,
            };
          }
        } catch (e) {
          return {
            ...ticket.toObject(),
            userDisplayName: ticket.isGuestTicket
              ? "Guest User"
              : "Unknown User",
            userEmail: ticket.isGuestTicket ? ticket.guestEmail : null,
            isGuest: ticket.isGuestTicket || false,
          };
        }
      });
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
// Body: { userId?, guestEmail?, guestName?, title, description, image? }
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { userId, guestEmail, guestName, title, description, image } =
      body || {};

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Validate that either userId or guestEmail is provided
    if (!userId && !guestEmail) {
      return NextResponse.json(
        { success: false, error: "Either userId or guestEmail is required" },
        { status: 400 }
      );
    }

    if (userId && guestEmail) {
      return NextResponse.json(
        { success: false, error: "Cannot provide both userId and guestEmail" },
        { status: 400 }
      );
    }

    const isGuestTicket = !!guestEmail;
    const ticketQuery = isGuestTicket
      ? { guestEmail, status: { $in: ["open", "reply"] } }
      : { user: userId, status: { $in: ["open", "reply"] } };

    // Enforce: not more than 3 open tickets (status 'open' or 'reply')
    const openCount = await SupportTicket.countDocuments(ticketQuery);
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

    const ticketData = {
      title: String(title).trim(),
      description: String(description).trim(),
      image: image || null,
      status: "open",
      messages: [
        {
          sender: isGuestTicket ? "guest" : "user",
          text: String(description).trim(),
          image: image || null,
        },
      ],
      lastUpdatedBy: isGuestTicket ? "guest" : "user",
      isGuestTicket,
    };

    if (isGuestTicket) {
      ticketData.guestEmail = guestEmail;
      ticketData.guestName = guestName || "";
    } else {
      ticketData.user = userId;
    }

    const ticket = new SupportTicket(ticketData);
    await ticket.save();

    // Emit Socket.io event for new ticket
    emitNewTicket(ticket._id.toString(), {
      _id: ticket._id,
      title: ticket.title,
      status: ticket.status,
      user: ticket.user || null,
      guestEmail: ticket.guestEmail || null,
      createdAt: ticket.createdAt,
    });
    emitTicketListUpdate(); // Notify admins

    // Notify admins/support staff about the new ticket
    try {
      const superAdminEmails = getSuperAdminEmails();

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
          message: `A new user ticket was created: "${ticket.title}"`,
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
        "Failed to create admin notification for ticket:",
        notifyErr
      );
    }

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
