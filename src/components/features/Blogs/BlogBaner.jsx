"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const BlogBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const ORIGINAL_HEADING = "IPTV Insights, Tips & Streaming News";
  const ORIGINAL_PARAGRAPH =
    "Stay updated with the latest in IPTV technology, streaming trends, and expert guides. Explore tips, tutorials, and industry news to make the most of your IPTV experience.";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [paragraph, setParagraph] = useState(ORIGINAL_PARAGRAPH);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [ORIGINAL_HEADING, ORIGINAL_PARAGRAPH];
      const translated = await translate(items);
      if (!isMounted) return;

      const [tHeading, tParagraph] = translated;

      setHeading(tHeading);
      setParagraph(tParagraph);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  return (
    <Polygon
      imageBg="/background/blog_bg.webp"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-white text-4xl md:text-[40px] font-bold mb-3 leading-tight">
            {heading}
          </h1>

          <p className="text-white text-[14px] font-medium mb-6 leading-tight font-secondary">
            {paragraph}
          </p>
        </div>
      </div>
    </Polygon>
  );
};

export default BlogBanner;
