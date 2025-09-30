import { connectToDatabase } from "@/lib/db";
import FAQ from "@/models/FAQ";
import { NextResponse } from "next/server";

// GET - Fetch single FAQ by ID
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "FAQ ID is required" },
        { status: 400 }
      );
    }

    const faq = await FAQ.findById(id);

    if (!faq) {
      return NextResponse.json(
        { success: false, error: "FAQ not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      faq: faq,
    });
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch FAQ",
      },
      { status: 500 }
    );
  }
}

// PUT - Update FAQ
export async function PUT(request, { params }) {
  try {
    // TODO: Implement proper authentication
    // For now, allowing all PUT requests - implement proper auth middleware

    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "FAQ ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.question || !body.answer) {
      return NextResponse.json(
        { success: false, error: "Question and answer are required" },
        { status: 400 }
      );
    }

    // Find and update FAQ
    const faq = await FAQ.findById(id);

    if (!faq) {
      return NextResponse.json(
        { success: false, error: "FAQ not found" },
        { status: 404 }
      );
    }

    // Update fields
    faq.question = body.question.trim();
    faq.answer = body.answer.trim();
    faq.category = body.category || "general";
    faq.isActive = body.isActive !== undefined ? body.isActive : true;
    faq.order = body.order || 0;
    faq.tags = body.tags || [];
    // Remove updatedBy for now
    // faq.updatedBy = "system"; // TODO: Get from authenticated user

    await faq.save();

    return NextResponse.json({
      success: true,
      faq: faq,
      message: "FAQ updated successfully",
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update FAQ",
      },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (e.g., toggle active status)
export async function PATCH(request, { params }) {
  try {
    // TODO: Implement proper authentication
    // For now, allowing all PATCH requests - implement proper auth middleware

    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "FAQ ID is required" },
        { status: 400 }
      );
    }

    // Find and update FAQ
    const faq = await FAQ.findById(id);

    if (!faq) {
      return NextResponse.json(
        { success: false, error: "FAQ not found" },
        { status: 404 }
      );
    }

    // Update only provided fields
    if (body.isActive !== undefined) faq.isActive = body.isActive;
    if (body.order !== undefined) faq.order = body.order;
    if (body.category !== undefined) faq.category = body.category;
    if (body.tags !== undefined) faq.tags = body.tags;
    // Remove updatedBy for now
    // faq.updatedBy = "system"; // TODO: Get from authenticated user

    await faq.save();

    return NextResponse.json({
      success: true,
      faq: faq,
      message: "FAQ updated successfully",
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update FAQ",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete FAQ
export async function DELETE(request, { params }) {
  try {
    // TODO: Implement proper authentication
    // For now, allowing all DELETE requests - implement proper auth middleware

    await connectToDatabase();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "FAQ ID is required" },
        { status: 400 }
      );
    }

    // Find and delete FAQ
    const faq = await FAQ.findById(id);

    if (!faq) {
      return NextResponse.json(
        { success: false, error: "FAQ not found" },
        { status: 404 }
      );
    }

    await FAQ.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete FAQ",
      },
      { status: 500 }
    );
  }
}
