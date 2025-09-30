import { connectToDatabase } from "@/lib/db";
import UniqueName from "@/models/UniqueName";
import { NextResponse } from "next/server";

// GET - Fetch all unique names with pagination and filtering
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const reviewUsed = searchParams.get("reviewUsed");
    const search = searchParams.get("search");

    // Build query
    let query = {};

    if (reviewUsed !== null && reviewUsed !== undefined) {
      query.reviewUsed = reviewUsed === "true";
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch data
    const [names, totalCount] = await Promise.all([
      UniqueName.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      UniqueName.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: names,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching unique names:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch unique names",
      },
      { status: 500 }
    );
  }
}

// POST - Create new unique names (bulk upload)
export async function POST(request) {
  try {
    await connectToDatabase();

    const { names } = await request.json();

    if (!names || !Array.isArray(names)) {
      return NextResponse.json(
        {
          success: false,
          error: "Names array is required",
        },
        { status: 400 }
      );
    }

    // Validate and clean names
    const cleanedNames = names
      .map((name) => name.trim())
      .filter((name) => name.length > 0 && name.length <= 100)
      .filter((name, index, array) => array.indexOf(name) === index); // Remove duplicates

    if (cleanedNames.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid names provided",
        },
        { status: 400 }
      );
    }

    // Check for existing names
    const existingNames = await UniqueName.find({
      name: { $in: cleanedNames },
    });

    const existingNameValues = existingNames.map((item) => item.name);
    const newNames = cleanedNames.filter(
      (name) => !existingNameValues.includes(name)
    );

    if (newNames.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "All names already exist",
          existingCount: existingNames.length,
        },
        { status: 400 }
      );
    }

    // Create new names
    const namesToCreate = newNames.map((name) => ({
      name,
      reviewUsed: false,
    }));

    const createdNames = await UniqueName.insertMany(namesToCreate);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdNames.length} unique names`,
      data: {
        created: createdNames.length,
        skipped: existingNames.length,
        total: cleanedNames.length,
      },
    });
  } catch (error) {
    console.error("Error creating unique names:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "Some names already exist",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create unique names",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete all unique names or by filter
export async function DELETE(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const reviewUsed = searchParams.get("reviewUsed");

    let query = {};
    if (reviewUsed !== null && reviewUsed !== undefined) {
      query.reviewUsed = reviewUsed === "true";
    }

    const result = await UniqueName.deleteMany(query);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} unique names`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting unique names:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete unique names",
      },
      { status: 500 }
    );
  }
}
