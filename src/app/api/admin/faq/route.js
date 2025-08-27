import { connectToDatabase } from "@/lib/db";
import FAQ from "@/models/FAQ";
import { NextResponse } from "next/server";

// Simple auth check function
const checkAuth = async (request) => {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "No authorization token provided" };
    }

    const token = authHeader.split(" ")[1];

    // Verify the token with Firebase Admin (you'll need to implement this)
    // For now, we'll do a basic check
    if (!token) {
      return { success: false, error: "Invalid token" };
    }

    // TODO: Implement proper Firebase token verification
    // For now, we'll allow the request to proceed
    return { success: true };
  } catch (error) {
    return { success: false, error: "Authentication failed" };
  }
};

// GET - Fetch all FAQs with optional search and filtering
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    let query = {};

    // Add search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Add category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Add active status filter
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // Build aggregation pipeline for better search
    let pipeline = [];

    if (search) {
      // Use text search with regex fallback for better results
      pipeline.push({
        $match: {
          $or: [
            { question: { $regex: search, $options: "i" } },
            { answer: { $regex: search, $options: "i" } },
            { tags: { $in: [new RegExp(search, "i")] } },
          ],
        },
      });
    } else if (Object.keys(query).length > 0) {
      pipeline.push({ $match: query });
    }

    // Add sorting and projection
    pipeline.push(
      { $sort: { order: 1, createdAt: -1 } },
      {
        $project: {
          _id: 1,
          question: 1,
          answer: 1,
          category: 1,
          isActive: 1,
          order: 1,
          tags: 1,
          views: 1,
          helpful: 1,
          notHelpful: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      }
    );

    let faqs;
    if (pipeline.length > 0) {
      faqs = await FAQ.aggregate(pipeline);
    } else {
      faqs = await FAQ.find({}).sort({ order: 1, createdAt: -1 });
    }

    return NextResponse.json({
      success: true,
      faqs: faqs,
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch FAQs",
      },
      { status: 500 }
    );
  }
}

// POST - Create new FAQ
export async function POST(request) {
  try {
    // TODO: Implement proper authentication
    // For now, allowing all POST requests - implement proper auth middleware

    await connectToDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.question || !body.answer) {
      return NextResponse.json(
        { success: false, error: "Question and answer are required" },
        { status: 400 }
      );
    }

    // Create FAQ data
    const faqData = {
      question: body.question.trim(),
      answer: body.answer.trim(),
      category: body.category || "general",
      isActive: body.isActive !== undefined ? body.isActive : true,
      order: body.order || 0,
      tags: body.tags || [],
      // Remove createdBy and updatedBy for now
      // createdBy: "system", // TODO: Get from authenticated user
      // updatedBy: "system", // TODO: Get from authenticated user
    };

    const faq = new FAQ(faqData);
    await faq.save();

    return NextResponse.json(
      {
        success: true,
        faq: faq,
        message: "FAQ created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating FAQ:", error);

    // Handle validation errors
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
        error: "Failed to create FAQ",
      },
      { status: 500 }
    );
  }
}
