import { connectToDatabase } from "@/lib/db";
import Blog from "@/models/Blog";
import { NextResponse } from "next/server";

// GET /api/blogs - Get all blogs (with filtering)
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const published = searchParams.get("published");
    const userId = searchParams.get("userId");

    const skip = (page - 1) * limit;
    const query = { isActive: true };

    if (published === "true") {
      query.isPublished = true;
      query.publishedAt = { $lte: new Date() };
    } else if (published === "false") {
      query.isPublished = false;
    }

    if (userId) {
      query.userId = userId;
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .select(
          "title slug image details authorName tags isPublished publishedAt createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: blogs,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create new blog
export async function POST(request) {
  try {
    await connectToDatabase();

    const { title, image, details, authorName, tags, isPublished, slug } =
      await request.json();

    // Validation
    if (!title || !image || !details || !authorName || !slug) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if blog with same title already exists
    const existingBlog = await Blog.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });
    if (existingBlog) {
      return NextResponse.json(
        { success: false, error: "Blog with this title already exists" },
        { status: 400 }
      );
    }

    // Create new blog with proper typing
    const blogData = {
      title,
      slug,
      image,
      details,
      authorName,
      tags: tags || [],
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
    };

    const blog = new Blog(blogData);
    await blog.save();

    return NextResponse.json({
      success: true,
      data: blog,
      message: "Blog created successfully",
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
