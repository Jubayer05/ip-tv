import { connectToDatabase } from "@/lib/db";
import Contact from "@/models/Contact";
import { NextResponse } from "next/server";

// GET - Fetch single contact
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contact" },
      { status: 500 }
    );
  }
}

// PATCH - Update contact (close/reopen, add notes, change priority)
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const { action, adminNotes, priority, adminEmail } = body;

    const contact = await Contact.findById(id);

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "close":
        await contact.closeContact(adminEmail);
        break;
      case "reopen":
        await contact.reopenContact();
        break;
      case "update":
        if (adminNotes !== undefined) {
          contact.adminNotes = adminNotes;
        }
        if (priority) {
          contact.priority = priority;
        }
        await contact.save();
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: contact,
      message: `Contact ${action}ed successfully`,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
