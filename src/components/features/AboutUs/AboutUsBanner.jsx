"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const AboutUsBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const ORIGINAL_HEADING =
    "Streaming Shouldn't Break the Bank. We Make Sure It Doesn't.";
  const ORIGINAL_PARAGRAPH =
    "At Cheap Stream, we believe everyone deserves access to top-quality entertainment—without expensive cable bills, long-term contracts, or complicated setups. We're a passionate team of streamers, techies, and movie lovers who were tired of overpriced services and limited content. So, we created a better way.";

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
      imageBg="/background/about_us_bg.webp"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center mx-auto">
          {/* Main heading */}
          <h1 className="text-white text-4xl md:text-[40px] font-bold mb-3 leading-tight">
            {heading}
          </h1>

          <p className="text-white text-sm font-medium mb-6 leading-tight font-secondary">
            {paragraph}
          </p>
        </div>
      </div>
    </Polygon>
  );
};

export default AboutUsBanner;
