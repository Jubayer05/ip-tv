import { connectToDatabase } from "@/lib/db";
import Blog from "@/models/Blog";
import { NextResponse } from "next/server";

// GET /api/blogs/[id] - Get specific blog
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id] - Update blog
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { title, image, details, authorName, tags, isPublished } =
      await request.json();

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Update fields
    if (title !== undefined) {
      blog.title = title;
      // Regenerate slug if title changes
      blog.slug = blog.generateSlug();
    }
    if (image !== undefined) blog.image = image;
    if (details !== undefined) blog.details = details;
    if (authorName !== undefined) blog.authorName = authorName;
    if (tags !== undefined) blog.tags = tags;

    // Handle publish status
    if (isPublished !== undefined) {
      blog.isPublished = isPublished;
      if (isPublished && !blog.publishedAt) {
        blog.publishedAt = new Date();
      } else if (!isPublished) {
        blog.publishedAt = null;
      }
    }

    await blog.save();

    return NextResponse.json({
      success: true,
      data: blog,
      message: "Blog updated successfully",
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete blog
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
