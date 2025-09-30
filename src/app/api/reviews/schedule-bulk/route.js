import { connectToDatabase } from "@/lib/db";
import Review from "@/models/Review";
import UniqueName from "@/models/UniqueName";
import { NextResponse } from "next/server";

// POST - Schedule bulk reviews for auto-posting
export async function POST(request) {
  try {
    await connectToDatabase();

    const { reviews, timerRange, ratingRange } = await request.json();

    if (!reviews || !Array.isArray(reviews)) {
      return NextResponse.json(
        {
          success: false,
          error: "Reviews array is required",
        },
        { status: 400 }
      );
    }

    if (reviews.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum 50 reviews allowed per upload",
        },
        { status: 400 }
      );
    }

    if (!timerRange || !timerRange.min || !timerRange.max) {
      return NextResponse.json(
        {
          success: false,
          error: "Timer range (min and max) is required",
        },
        { status: 400 }
      );
    }

    // Validate timer range (should be in seconds)
    const minSeconds = parseInt(timerRange.min);
    const maxSeconds = parseInt(timerRange.max);

    if (minSeconds < 1800 || maxSeconds > 7200 || minSeconds >= maxSeconds) {
      return NextResponse.json(
        {
          success: false,
          error: "Timer range must be between 30 minutes and 2 hours",
        },
        { status: 400 }
      );
    }

    // Validate rating range
    if (
      ratingRange &&
      (ratingRange.min < 1 ||
        ratingRange.max > 5 ||
        ratingRange.min > ratingRange.max)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Rating range must be between 1-5 stars and min cannot be greater than max",
        },
        { status: 400 }
      );
    }

    // Clean and validate reviews first
    const validReviews = reviews
      .map((review) => review.trim())
      .filter((review) => review.length > 0 && review.length <= 1000);

    if (validReviews.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid reviews provided",
        },
        { status: 400 }
      );
    }

    // Get available unique names
    const availableNames = await UniqueName.find({
      reviewUsed: false,
    }).sort({ createdAt: 1 });

    if (availableNames.length < validReviews.length) {
      return NextResponse.json(
        {
          success: false,
          error: `Not enough available names. Need ${validReviews.length}, but only ${availableNames.length} available.`,
        },
        { status: 400 }
      );
    }

    // Create scheduled reviews
    const scheduledReviews = [];
    let lastScheduledTime = new Date(); // Start with current time

    for (let i = 0; i < validReviews.length; i++) {
      const review = validReviews[i];
      const uniqueName = availableNames[i];

      // Generate random rating within the specified range (including fractional)
      const rating = parseFloat(
        (
          Math.random() * (ratingRange.max - ratingRange.min) +
          ratingRange.min
        ).toFixed(1)
      );

      // Calculate random delay within timer range (in seconds)
      const randomDelaySeconds = Math.floor(
        Math.random() * (maxSeconds - minSeconds + 1) + minSeconds
      );

      // Add delay to the last scheduled time
      lastScheduledTime = new Date(
        lastScheduledTime.getTime() + randomDelaySeconds * 1000
      );

      // Create review document
      const reviewData = {
        comment: review,
        rating: rating,
        uniqueNameId: uniqueName._id,
        uniqueName: uniqueName.name,
        scheduledFor: lastScheduledTime,
        isBulkGenerated: true,
        schedulingStatus: "pending",
      };

      scheduledReviews.push(reviewData);
    }

    // Insert all scheduled reviews
    const createdScheduledReviews = await Review.insertMany(scheduledReviews);

    return NextResponse.json({
      success: true,
      message: `Successfully scheduled ${createdScheduledReviews.length} reviews for auto-posting`,
      data: {
        scheduled: createdScheduledReviews.length,
        total: validReviews.length,
        timerRange: {
          min: minSeconds,
          max: maxSeconds,
        },
        nextPosting: createdScheduledReviews.sort(
          (a, b) => a.scheduledFor - b.scheduledFor
        )[0]?.scheduledFor,
      },
    });
  } catch (error) {
    console.error("Error scheduling bulk reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to schedule reviews",
      },
      { status: 500 }
    );
  }
}

// GET - Get scheduled reviews status
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    let query = { isBulkGenerated: true };

    const skip = (page - 1) * limit;

    const [scheduledReviews, totalCount] = await Promise.all([
      Review.find(query)
        .populate("uniqueNameId")
        .sort({ scheduledFor: 1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: scheduledReviews,
      pagination: {
        currentPage: page,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching scheduled reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch scheduled reviews",
      },
      { status: 500 }
    );
  }
}
