import { connectToDatabase } from "@/lib/db";
import Blog from "@/models/Blog";
import Product from "@/models/Product";

export default async function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://cheapstreamtv.com";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/packages`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/affiliate`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/knowledge-base`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/support/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/support/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  // Dynamic pages from products
  let productPages = [];
  let blogPages = [];

  try {
    await connectToDatabase();

    // Fetch products
    const products = await Product.find({}).lean();
    products.forEach((product) => {
      product.variants.forEach((variant) => {
        if (variant.slug) {
          productPages.push({
            url: `${baseUrl}/packages/${variant.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
          });
        }
      });
    });

    // Fetch blogs
    const blogs = await Blog.find({ isActive: true }).lean();
    blogs.forEach((blog) => {
      if (blog.slug) {
        blogPages.push({
          url: `${baseUrl}/blogs/${blog.slug}`,
          lastModified: blog.updatedAt || blog.createdAt || new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    });
  } catch (error) {
    console.error("Error fetching data for sitemap:", error);
  }

  return [...staticPages, ...productPages, ...blogPages];
}
