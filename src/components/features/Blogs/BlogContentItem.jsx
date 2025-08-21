"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

const ArticleCard = ({
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

  return (
    <div className="w-full card_bg_border overflow-hidden shadow-lg font-secondary">
      {/* Image Section */}
      <div className="relative h-32 sm:h-48 bg-gray-800">
        <img
          src={image}
          alt="Article thumbnail"
          className="w-full h-full object-cover"
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
        <h3 className="text-white text-xs sm:text-lg font-bold mb-2 sm:mb-3 leading-tight sm:leading-snug line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-6 line-clamp-3 sm:line-clamp-none">
          {description}
        </p>

        {/* Read More Link */}
        <button className="flex items-center gap-1 sm:gap-2 text-cyan-400 text-xs sm:text-sm font-medium hover:text-cyan-300 transition-colors duration-200 group">
          <span>{readMore}</span>
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;
