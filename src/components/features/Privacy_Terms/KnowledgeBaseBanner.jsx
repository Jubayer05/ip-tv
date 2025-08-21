"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const KnowledgeBaseBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original text constants
  const ORIGINAL_TEXTS = {
    heading: "Everything You Need to Know—All in One Place",
    paragraph:
      "Welcome to the Knowledge Base, your go-to resource hub for all things IPTV. Whether you're a first-time user, reseller, or long-time subscriber, this section is packed with helpful guides, FAQs, tutorials, and troubleshooting tips to make your experience smooth and seamless.",
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
      imageBg="/background/blog_bg.webp"
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

export default KnowledgeBaseBanner;
