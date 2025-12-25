import { connectToDatabase } from "@/lib/db";
import Blog from "@/models/Blog";
import BlogDetailClient from "./BlogDetailClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    await connectToDatabase();
    const blog = await Blog.findOne({ slug, isActive: true }).lean();

    if (blog) {
      const excerpt =
        blog.details?.replace(/<[^>]*>/g, "").substring(0, 155) + "...";

      return {
        title: `${blog.title} - Cheap Stream Blog`,
        description: excerpt,
        keywords: blog.tags?.join(", ") || "IPTV, streaming, entertainment",
        openGraph: {
          title: blog.title,
          description: excerpt,
          type: "article",
          publishedTime: blog.publishedAt || blog.createdAt,
          authors: [blog.authorName || "Cheap Stream Team"],
          images: blog.image
            ? [
                {
                  url: blog.image,
                  width: 1200,
                  height: 630,
                  alt: blog.title,
                },
              ]
            : undefined,
        },
        twitter: {
          card: "summary_large_image",
          title: blog.title,
          description: excerpt,
          images: blog.image ? [blog.image] : undefined,
        },
        alternates: {
          canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blogs/${slug}`,
        },
      };
    }
  } catch (error) {
    console.error("Error generating blog metadata:", error);
  }

  return {
    title: "Blog Post - Cheap Stream",
    description: "Read the latest news and updates from Cheap Stream TV.",
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;

  // Fetch initial blog data for SSR
  let initialBlog = null;
  try {
    await connectToDatabase();
    const blog = await Blog.findOne({ slug, isActive: true }).lean();
    if (blog) {
      initialBlog = {
        ...blog,
        _id: blog._id.toString(),
        createdAt: blog.createdAt?.toISOString(),
        updatedAt: blog.updatedAt?.toISOString(),
        publishedAt: blog.publishedAt?.toISOString(),
      };
    }
  } catch (error) {
    console.error("Error fetching blog:", error);
  }

  return <BlogDetailClient slug={slug} initialBlog={initialBlog} />;
}
