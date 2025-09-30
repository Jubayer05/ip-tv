import { connectToDatabase } from "@/lib/db";
import SupportTicket from "@/models/SupportTicket";
import { NextResponse } from "next/server";

// GET /api/support/tickets/[id]
export async function GET(_req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const ticket = await SupportTicket.findById(id).select("-__v");
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: ticket });
  } catch (e) {
    console.error("Ticket GET error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

// PATCH /api/support/tickets/[id]
// Body supports:
// - { status: "open|reply|close" } to change status
// - { message: { sender: "user|admin", text, image? } } to append conversation
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    const updates = {};

    if (body?.status && ["open", "reply", "close"].includes(body.status)) {
      updates.status = body.status;
    }

    if (
      body?.message?.sender &&
      ["user", "admin"].includes(body.message.sender)
    ) {
      const msg = {
        sender: body.message.sender,
        text: String(body.message.text || "").trim(),
        image: body.message.image || null,
      };
      ticket.messages.push(msg);

      // If admin responds, set status to "reply" unless it's closing
      if (
        !updates.status &&
        body.message.sender === "admin" &&
        ticket.status !== "close"
      ) {
        updates.status = "reply";
      }
      updates.lastUpdatedBy = body.message.sender;
    }

    if (Object.keys(updates).length) {
      Object.assign(ticket, updates);
    }

    await ticket.save();

    return NextResponse.json({
      success: true,
      data: ticket,
      message: "Ticket updated",
    });
  } catch (e) {
    console.error("Ticket PATCH error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
