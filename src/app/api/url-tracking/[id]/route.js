import { connectToDatabase } from "@/lib/db";
import UrlTracking from "@/models/UrlTracking";
import { NextResponse } from "next/server";

// GET - Fetch single URL tracking entry
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const urlTracking = await UrlTracking.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!urlTracking) {
      return NextResponse.json(
        { success: false, error: "URL tracking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: urlTracking,
    });
  } catch (error) {
    console.error("Error fetching URL tracking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch URL tracking" },
      { status: 500 }
    );
  }
}

// PUT - Update URL tracking entry
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const data = await request.json();
    const { pageType, ...restData } = data;

    // If pageType is "existing", validate that the slug matches an internal route
    if (pageType === "existing" && data.slug) {
      const normalizedSlug = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-");

      // List of valid internal routes (you can expand this list)
      const validInternalRoutes = [
        // General public routes
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
        // Auth routes
        "login",
        "register",
        "forgot-password",
        "reset-password",
        "verify-email",
        // Other public routes
        "cart",
        "deposit",
        "deposit/crypto",
        "support",
        "support/contact",
        "support/faq",
        "payment-status",
        "payment-status/failed",
        "payment-status/success",
        "payment-success",
        "payment-cancel",
        "sandbox-payment",
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

    // If slug is being updated, normalize and check uniqueness
    let updateData = { ...restData };
    if (data.slug !== undefined) {
      // Normalize slug
      updateData.slug = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-");

      // Check if slug already exists (excluding current document)
      const existing = await UrlTracking.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      });

      if (existing) {
        return NextResponse.json(
          { success: false, error: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    // Explicitly include pageType in the update
    if (pageType !== undefined) {
      updateData.pageType = pageType;
    }

    const urlTracking = await UrlTracking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    if (!urlTracking) {
      return NextResponse.json(
        { success: false, error: "URL tracking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: urlTracking,
    });
  } catch (error) {
    console.error("Error updating URL tracking:", error);

    // Handle duplicate slug error
    if (error.code === 11000) {
      const field = error.keyPattern?.url ? "URL" : "Slug";
      return NextResponse.json(
        { success: false, error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update URL tracking" },
      { status: 500 }
    );
  }
}

// DELETE - Delete URL tracking entry
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const urlTracking = await UrlTracking.findByIdAndDelete(id);

    if (!urlTracking) {
      return NextResponse.json(
        { success: false, error: "URL tracking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "URL tracking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting URL tracking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete URL tracking" },
      { status: 500 }
    );
  }
}
