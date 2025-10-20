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

    const approvedParam = searchParams.get("approved"); // "true" | "false" | null
    const userId = searchParams.get("userId");
    const isBulkGeneratedParam = searchParams.get("isBulkGenerated"); // "true" | "false" | null
    const scheduledFor = searchParams.get("scheduledFor"); // "current" | "future" | null

    // Sort defaults: if scheduled filter present, default by scheduledFor asc; else createdAt desc
    let sortBy = searchParams.get("sortBy");
    let sortOrder = searchParams.get("sortOrder");
    if (!sortBy) sortBy = scheduledFor ? "scheduledFor" : "createdAt";
    if (!sortOrder) sortOrder = scheduledFor ? "asc" : "desc";

    const skip = (page - 1) * limit;
    const now = new Date();

    // Build query using AND conditions so combinations compose cleanly
    const andConditions = [{ isActive: true }];

    if (userId) {
      andConditions.push({ userId });
    }

    if (isBulkGeneratedParam !== null && isBulkGeneratedParam !== undefined) {
      andConditions.push({ isBulkGenerated: isBulkGeneratedParam === "true" });
    }

    // Scheduled filtering has priority and should NOT be mixed with the plain approved filter
    if (scheduledFor === "current") {
      // Approved and scheduled in the past
      andConditions.push({ isApproved: true });
      andConditions.push({ scheduledFor: { $lt: now } });
    } else if (scheduledFor === "future") {
      // Pending: either not approved OR scheduled for future (and has scheduledFor)
      andConditions.push({
        $or: [
          { isApproved: false },
          { scheduledFor: { $exists: true, $gt: now } },
        ],
      });
    } else {
      // No scheduled filter; allow plain approved filter
      if (approvedParam !== null && approvedParam !== undefined) {
        andConditions.push({ isApproved: approvedParam === "true" });
      }
    }

    const finalQuery = { $and: andConditions };

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const reviews = await Review.find(finalQuery)
      .populate("userId", "profile.firstName profile.lastName profile.avatar")
      .populate("approvedBy", "profile.firstName profile.lastName")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(finalQuery);

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
      isBulkGenerated: !userId, // Mark as bulk generated if no userId
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
