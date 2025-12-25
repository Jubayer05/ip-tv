"use client";

const BlogPostingSchema = ({ post }) => {
  if (!post) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cheapstreamtv.com";

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.details?.substring(0, 160),
    image: post.image ? `${baseUrl}${post.image}` : `${baseUrl}/icons/live.png`,
    datePublished: post.publishedDate || post.createdAt,
    dateModified: post.updatedAt || post.publishedDate || post.createdAt,
    author: {
      "@type": "Person",
      name: post.authorName || "Cheap Stream Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Cheap Stream TV",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logos/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blogs/${post.slug}`,
    },
    keywords: post.tags?.join(", ") || "IPTV, streaming, entertainment",
    articleBody: post.details,
    wordCount: post.details?.split(/\s+/).length || 0,
    inLanguage: "en-US",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default BlogPostingSchema;
