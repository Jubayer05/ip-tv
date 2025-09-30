import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { businessId, apiKey } = await request.json();

    if (!businessId || !apiKey) {
      return NextResponse.json(
        { success: false, error: "Business ID and API key are required" },
        { status: 400 }
      );
    }

    // Fetch reviews from TrustPilot API
    const response = await fetch(
      `https://api.trustpilot.com/v1/private/business-units/${businessId}/reviews`,
      {
        headers: {
          apikey: apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`TrustPilot API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to match your component structure
    const reviews =
      data.reviews?.map((review) => ({
        id: review.id,
        text: review.text,
        stars: review.stars,
        createdAt: review.createdAt,
        consumer: {
          displayName: review.consumer?.displayName,
        },
      })) || [];

    return NextResponse.json({
      success: true,
      reviews,
      totalReviews: data.totalReviews,
      averageRating: data.averageRating,
    });
  } catch (error) {
    console.error("Error fetching TrustPilot reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
