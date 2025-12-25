import { connectToDatabase } from "@/lib/db";
import { sendGenericEmail } from "@/lib/email";
import GuestSupportTicket from "@/models/GuestSupportTicket";
import { NextResponse } from "next/server";
import {
  emitGuestTicketUpdate,
  emitGuestTicketListUpdate,
} from "@/lib/socket";

// GET /api/support/guest-tickets/[id]
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const ticket = await GuestSupportTicket.findById(id);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (e) {
    console.error("Guest ticket GET error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

// POST /api/support/guest-tickets/[id] - Add message to ticket
export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { text, sender } = body || {};

    if (!text || !sender) {
      return NextResponse.json(
        { success: false, error: "text and sender are required" },
        { status: 400 }
      );
    }

    const ticket = await GuestSupportTicket.findById(id);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Add message to ticket
    ticket.messages.push({
      sender,
      text: String(text).trim(),
    });

    // Update status and lastUpdatedBy
    if (sender === "guest") {
      ticket.status = "reply";
      ticket.lastUpdatedBy = "guest";
    } else if (sender === "admin") {
      ticket.status = "open";
      ticket.lastUpdatedBy = "admin";
    }

    await ticket.save();

    // Emit Socket.io event for guest ticket update
    const updatedTicket = await GuestSupportTicket.findById(id)
      .select("-__v")
      .lean();

    emitGuestTicketUpdate(id, {
      ticket: updatedTicket,
      message: { sender, text: String(text).trim() },
      status: ticket.status,
    });

    // Notify for list updates
    emitGuestTicketListUpdate(ticket.guestEmail);
    // Notify admins
    emitGuestTicketListUpdate();

    // If admin sent a message, send email notification to guest
    if (sender === "admin") {
      try {
        await sendGenericEmail({
          to: ticket.guestEmail,
          subject: `Reply to your support ticket: ${ticket.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #00b877 0%, #44dcf3 100%); padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px;">Cheap Stream Support</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">You have a new reply to your support ticket</p>
              </div>
              
              <div style="padding: 30px; background: #f8f9fa;">
                <h2 style="color: #333; margin-bottom: 20px;">Hi ${ticket.guestName}!</h2>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                  We have replied to your support ticket: <strong>"${ticket.title}"</strong>
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #00b877; margin: 20px 0;">
                  <h3 style="color: #333; margin: 0 0 10px 0;">Admin Reply:</h3>
                  <p style="color: #555; margin: 0; line-height: 1.6;">${text}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.cheapstreamtv.com/guest-login" 
                     style="background: linear-gradient(135deg, #00b877 0%, #44dcf3 100%); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 25px; 
                            display: inline-block; 
                            font-weight: bold;
                            font-size: 16px;">
                    View Your Tickets
                  </a>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                  <p style="color: #999; font-size: 14px; margin: 0;">
                    Best regards,<br>
                    The Cheap Stream Support Team
                  </p>
                </div>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the entire operation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: ticket,
      message: "Message added successfully",
    });
  } catch (e) {
    console.error("Guest ticket POST error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to add message" },
      { status: 500 }
    );
  }
}

// PATCH /api/support/guest-tickets/[id] - Update ticket status
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { status } = body || {};

    if (!status || !["open", "reply", "close"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Valid status is required" },
        { status: 400 }
      );
    }

    const ticket = await GuestSupportTicket.findById(id);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    ticket.status = status;
    ticket.lastUpdatedBy = "admin";
    await ticket.save();

    // Emit Socket.io event for status change
    const updatedTicket = await GuestSupportTicket.findById(id)
      .select("-__v")
      .lean();

    emitGuestTicketUpdate(id, {
      ticket: updatedTicket,
      status: ticket.status,
    });

    // Notify for list updates
    emitGuestTicketListUpdate(ticket.guestEmail);
    emitGuestTicketListUpdate(); // Notify admins

    return NextResponse.json({
      success: true,
      data: ticket,
      message: "Ticket status updated",
    });
  } catch (e) {
    console.error("Guest ticket PATCH error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to update ticket status" },
      { status: 500 }
    );
  }
}
