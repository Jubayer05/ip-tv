"use client";
import Button from "@/components/ui/button";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const FaqBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original text constants
  const ORIGINAL_TEXTS = {
    heading: "LEARN HOW CHEAP STREAM WORKS",
    paragraph:
      "We've made watching your favorite movies and live channels easier than ever. No cables, no contracts—just non-stop entertainment at a price you'll love.",
    button: "View Pricing Plans",
  };

  // State for translated content
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        const items = [
          ORIGINAL_TEXTS.heading,
          ORIGINAL_TEXTS.paragraph,
          ORIGINAL_TEXTS.button,
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const [tHeading, tParagraph, tButton] = translated;

        setTexts({
          heading: tHeading,
          paragraph: tParagraph,
          button: tButton,
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
      imageBg="/background/faq_bg.webp"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading">{texts.heading}</h1>

          <p className="polygon_paragraph">{texts.paragraph}</p>
          <Button>{texts.button}</Button>
        </div>
      </div>
    </Polygon>
  );
};

export default FaqBanner;
