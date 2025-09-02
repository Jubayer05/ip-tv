import { connectToDatabase } from "@/lib/db";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

// GET /api/reviews/[id] - Get specific review
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const review = await Review.findById(id)
      .populate("userId", "profile.firstName profile.lastName profile.avatar")
      .populate("approvedBy", "profile.firstName profile.lastName");

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/[id] - Update review (admin only)
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { rating, comment, isApproved, isActive, adminId } =
      await request.json();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (isActive !== undefined) review.isActive = isActive;

    // Handle approval
    if (isApproved !== undefined) {
      review.isApproved = isApproved;
      if (isApproved && adminId) {
        review.approvedBy = adminId;
        review.approvedAt = new Date();
      } else if (!isApproved) {
        review.approvedBy = null;
        review.approvedAt = null;
      }
    }

    await review.save();

    // Populate the review (removed orderId population)
    await review.populate(
      "userId",
      "profile.firstName profile.lastName profile.avatar"
    );
    await review.populate("approvedBy", "profile.firstName profile.lastName");

    return NextResponse.json({
      success: true,
      data: review,
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete review (admin only)
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
