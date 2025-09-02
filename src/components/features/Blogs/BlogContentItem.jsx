"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const ArticleCard = ({
  id,
  slug,
  image = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  title = "LOREM IPSUM DOLOR SIT AMET CONSECTETUR SEM NEC...",
  description = "Lorem ipsum dolor sit amet consectetur. Dignissim consequat gravida turpis sed duis tellus ut quis id. Placerat in magna elit aliquet mauris. Donec aliquam porta varius sit. Tempor sit urna fringilla facilisi eget.",
  date = "20 September, 2025",
}) => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const ORIGINAL_READ_MORE = "Read more";

  const [readMore, setReadMore] = useState(ORIGINAL_READ_MORE);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [ORIGINAL_READ_MORE];
      const translated = await translate(items);
      if (!isMounted) return;

      const [tReadMore] = translated;

      setReadMore(tReadMore);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  // Create excerpt from HTML content
  const createExcerpt = (htmlContent) => {
    const plainText = htmlContent.replace(/<[^>]*>/g, "");
    return plainText.length > 150
      ? plainText.substring(0, 150) + "..."
      : plainText;
  };

  const excerpt = createExcerpt(description);

  return (
    <Link href={`/blogs/${slug}`} className="block">
      <div className="w-full card_bg_border overflow-hidden shadow-lg font-secondary hover:shadow-xl transition-all duration-300 group">
        {/* Image Section */}
        <div className="relative h-32 sm:h-48 bg-gray-800 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x300?text=No+Image";
            }}
          />
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-6">
          {/* Date */}
          <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-4">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
            <span className="text-cyan-400 text-xs sm:text-sm font-medium">
              {date}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-white text-xs sm:text-lg font-bold mb-2 sm:mb-3 leading-tight sm:leading-snug line-clamp-2 group-hover:text-cyan-400 transition-colors duration-200">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-6 line-clamp-3 sm:line-clamp-none">
            {excerpt}
          </p>

          {/* Read More Link */}
          <div className="flex items-center gap-1 sm:gap-2 text-cyan-400 text-xs sm:text-sm font-medium group-hover:text-cyan-300 transition-colors duration-200">
            <span>{readMore}</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
