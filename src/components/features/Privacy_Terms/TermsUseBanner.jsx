"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const TermsOfUseBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original text constants
  const ORIGINAL_TEXTS = {
    heading: "Terms of Use",
    paragraph:
      "Welcome to our IPTV platform. By accessing, purchasing from, or using our website and services, you agree to comply with and be bound by the following Terms of Use. Please read them carefully before proceeding.",
  };

  // State for translated content
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        const items = [ORIGINAL_TEXTS.heading, ORIGINAL_TEXTS.paragraph];

        const translated = await translate(items);
        if (!isMounted) return;

        const [tHeading, tParagraph] = translated;

        setTexts({
          heading: tHeading,
          paragraph: tParagraph,
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  return (
    <Polygon
      imageBg="/background/affiliate_bg.webp"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading">{texts.heading}</h1>

          <p className="polygon_paragraph">{texts.paragraph}</p>
        </div>
      </div>
    </Polygon>
  );
};

export default TermsOfUseBanner;
