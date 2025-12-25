"use client";
import BlogPostingSchema from "@/components/common/BlogPostingSchema";
import BreadcrumbSchema from "@/components/common/BreadcrumbSchema";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const BlogDetailClient = ({ slug, initialBlog }) => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [blog, setBlog] = useState(initialBlog);
  const [loading, setLoading] = useState(!initialBlog);
  const [error, setError] = useState(null);

  // Original static texts
  const ORIGINAL_TEXTS = {
    blogNotFound: "Blog Not Found",
    blogNotFoundMessage: "The blog you're looking for doesn't exist.",
    backToBlogs: "Back to Blogs",
    by: "By",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);
  const [translatedBlog, setTranslatedBlog] = useState(null);

  useEffect(() => {
    if (!initialBlog) {
      fetchBlog();
    }
  }, [slug, initialBlog]);

  // Translate static texts
  useEffect(() => {
    if (!isLanguageLoaded || language?.code === "en") {
      setTexts(ORIGINAL_TEXTS);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const items = [
          ORIGINAL_TEXTS.blogNotFound,
          ORIGINAL_TEXTS.blogNotFoundMessage,
          ORIGINAL_TEXTS.backToBlogs,
          ORIGINAL_TEXTS.by,
        ];
        const translated = await translate(items);
        if (!isMounted) return;

        const [tBlogNotFound, tBlogNotFoundMessage, tBackToBlogs, tBy] =
          translated;
        setTexts({
          blogNotFound: tBlogNotFound,
          blogNotFoundMessage: tBlogNotFoundMessage,
          backToBlogs: tBackToBlogs,
          by: tBy,
        });
      } catch (error) {
        console.error("Translation error:", error);
        setTexts(ORIGINAL_TEXTS);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language?.code, translate, isLanguageLoaded]);

  // Translate blog content
  useEffect(() => {
    if (!blog || !isLanguageLoaded || language?.code === "en") {
      setTranslatedBlog(blog);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        // Collect all translatable content from blog
        const textsToTranslate = [
          blog.title,
          blog.details,
          ...(blog.tags || []),
        ];

        const translated = await translate(textsToTranslate);
        if (!isMounted) return;

        const [tTitle, tDetails, ...tTags] = translated;

        setTranslatedBlog({
          ...blog,
          title: tTitle,
          details: tDetails,
          tags: blog.tags ? tTags : undefined,
        });
      } catch (error) {
        console.error("Translation error:", error);
        setTranslatedBlog(blog);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [blog, language?.code, translate, isLanguageLoaded]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/slug/${slug}`);
      const data = await response.json();

      if (data.success) {
        setBlog(data.data);
      } else {
        setError(data.error || "Blog not found");
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      setError("Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-800 rounded mb-6"></div>
            <div className="h-6 bg-gray-800 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-black text-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">{texts.blogNotFound}</h1>
          <p className="text-gray-400 mb-6">
            {error || texts.blogNotFoundMessage}
          </p>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {texts.backToBlogs}
          </Link>
        </div>
      </div>
    );
  }

  const displayBlog = translatedBlog || blog;

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blogs" },
    { name: displayBlog.title },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      {/* Schema markup for SEO */}
      <BlogPostingSchema post={blog} />
      <BreadcrumbSchema customItems={breadcrumbItems} />

      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {texts.backToBlogs}
        </Link>

        {/* Blog Header */}
        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              {displayBlog.title}
            </h1>

            <div className="flex items-center gap-4 text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time
                  dateTime={displayBlog.publishedAt || displayBlog.createdAt}
                >
                  {new Date(
                    displayBlog.publishedAt || displayBlog.createdAt
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              <span>
                {texts.by} {displayBlog.authorName}
              </span>
            </div>

            {/* Tags */}
            {displayBlog.tags && displayBlog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {displayBlog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm rounded-full border border-cyan-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {displayBlog.image && (
            <figure className="mb-8">
              <img
                src={displayBlog.image}
                alt={displayBlog.title}
                className="w-full h-64 sm:h-96 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/800x400?text=No+Image";
                }}
              />
            </figure>
          )}

          {/* Blog Content */}
          <div className="prose prose-invert max-w-none">
            <div
              className="text-gray-300 leading-relaxed text-base sm:text-lg"
              dangerouslySetInnerHTML={{ __html: displayBlog.details }}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetailClient;
