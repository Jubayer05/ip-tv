import { connectToDatabase } from "@/lib/db";
import Blog from "@/models/Blog";
import { NextResponse } from "next/server";

// GET /api/blogs/slug/[slug] - Get blog by slug
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { slug } = await params;

    const blog = await Blog.findOne({
      slug,
      isPublished: true,
      isActive: true,
      publishedAt: { $lte: new Date() },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
