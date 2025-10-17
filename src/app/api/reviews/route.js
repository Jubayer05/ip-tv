import { connectToDatabase } from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET /api/reviews - Get all reviews (with filtering)
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const approved = searchParams.get("approved");
    const userId = searchParams.get("userId");

    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    if (approved !== null && approved !== undefined) {
      query.isApproved = approved === "true";
    }

    if (userId) {
      query.userId = userId;
    }

    const reviews = await Review.find(query)
      .populate("userId", "profile.firstName profile.lastName profile.avatar")
      .populate("approvedBy", "profile.firstName profile.lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create new review
export async function POST(request) {
  try {
    await connectToDatabase();

    const {
      userId,
      rating,
      comment,
      uniqueName,
      reviewerName,
      isApproved,
      createdAt,
    } = await request.json();

    // Validation
    if (!rating || !comment) {
      return NextResponse.json(
        { error: "Rating and comment are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if user exists (only if userId is provided)
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if user already reviewed
      const existingReview = await Review.findOne({
        userId,
      });

      if (existingReview) {
        return NextResponse.json(
          { error: "You have already submitted a review" },
          { status: 409 }
        );
      }
    }

    // Create review
    const review = new Review({
      userId: userId || null,
      rating,
      comment,
      uniqueName: uniqueName || null,
      isApproved: isApproved || false,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    });

    await review.save();

    // Populate the review before sending response
    await review.populate(
      "userId",
      "profile.firstName profile.lastName profile.avatar"
    );

    return NextResponse.json({
      success: true,
      data: review,
      message:
        "Review submitted successfully. It will be visible after admin approval.",
    });
  } catch (error) {
    console.error("Error creating review:", error);

    if (error.message.includes("completed order")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}
