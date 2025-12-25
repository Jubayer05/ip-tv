import { connectToDatabase } from "@/lib/db";
import UrlTracking from "@/models/UrlTracking";
import { NextResponse } from "next/server";

// Helper function to generate slug from URL
function generateSlugFromUrl(url) {
  try {
    const urlObj = new URL(url);
    // Extract domain name (e.g., "facebook" from "facebook.com")
    const hostname = urlObj.hostname.replace("www.", "");
    const parts = hostname.split(".");
    return parts[0].toLowerCase();
  } catch {
    // If URL parsing fails, generate from title or random
    return Math.random().toString(36).substring(2, 8).toLowerCase();
  }
}

// GET - Fetch all URL tracking entries
export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    let query = {};

    if (isActive !== null) query.isActive = isActive === "true";

    const urlTrackings = await UrlTracking.find(query)
      .populate("createdBy", "name email")
      .sort({ uniqueClickCount: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: urlTrackings,
    });
  } catch (error) {
    console.error("Error fetching URL tracking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch URL tracking" },
      { status: 500 }
    );
  }
}

// POST - Create new URL tracking entry
export async function POST(request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const { userId, pageType, ...restData } = data;

    // Validate required fields
    const requiredFields = ["title", "url"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // If pageType is "existing", validate that the slug matches an internal route
    if (pageType === "existing" && data.slug) {
      const normalizedSlug = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-");

      // List of valid internal routes (you can expand this list)
      const validInternalRoutes = [
        "about-us",
        "affiliate",
        "blogs",
        "explore",
        "guest-login",
        "knowledge-base",
        "notifications",
        "packages",
        "privacy-policy",
        "reviews",
        "terms-of-use",
        "cart",
        "deposit",
        "support",
        // Add more routes as needed
      ];

      // Check if slug matches any valid route or is a dynamic route pattern
      const isValidRoute =
        validInternalRoutes.includes(normalizedSlug) ||
        normalizedSlug.startsWith("blogs/") ||
        normalizedSlug.startsWith("notifications/") ||
        normalizedSlug.startsWith("payment-status/");

      if (!isValidRoute) {
        return NextResponse.json(
          {
            success: false,
            error:
              "The slug does not match any existing page in the application. Please select 'Non-existing page' or use a valid internal route.",
          },
          { status: 400 }
        );
      }
    }

    // Generate slug if not provided
    let slug = data.slug;
    if (!slug) {
      slug = generateSlugFromUrl(data.url);

      // Ensure uniqueness - if slug exists, append random string
      const existing = await UrlTracking.findOne({ slug });
      if (existing) {
        slug = `${slug}-${Math.random()
          .toString(36)
          .substring(2, 6)
          .toLowerCase()}`;
      }
    } else {
      // Normalize slug
      slug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-");

      // Check if slug already exists
      const existing = await UrlTracking.findOne({ slug });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    // Explicitly construct the object to ensure pageType is included
    const urlTracking = new UrlTracking({
      title: data.title,
      description: data.description || "",
      url: data.url,
      slug,
      isActive: data.isActive !== undefined ? data.isActive : true,
      pageType: pageType || "non-existing", // Explicitly set pageType
      createdBy: userId,
    });

    await urlTracking.save();
    await urlTracking.populate("createdBy", "name email");

    return NextResponse.json({
      success: true,
      data: urlTracking,
    });
  } catch (error) {
    console.error("Error creating URL tracking:", error);

    // Handle duplicate URL or slug error
    if (error.code === 11000) {
      const field = error.keyPattern?.url ? "URL" : "Slug";
      return NextResponse.json(
        { success: false, error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create URL tracking" },
      { status: 500 }
    );
  }
}
