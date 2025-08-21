"use client";
import Button from "@/components/ui/button";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const PricingBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original text constants
  const ORIGINAL_TEXTS = {
    heading: {
      main: "Watch More, Pay Less –",
      highlight: "Choose Your Streaming Plans",
    },
    paragraph:
      "At Cheap Stream, we believe in affordable entertainment without sacrificing quality. Whether you're a casual viewer or a full-on movie marathoner, we've got a plan that fits your lifestyle—and your budget.",
    button: "Start with a Free Trial!",
    trialNote: "*Try Cheap Stream free for 24 hours—no credit card required!",
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
          ORIGINAL_TEXTS.heading.main,
          ORIGINAL_TEXTS.heading.highlight,
          ORIGINAL_TEXTS.paragraph,
          ORIGINAL_TEXTS.button,
          ORIGINAL_TEXTS.trialNote,
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const [
          tHeadingMain,
          tHeadingHighlight,
          tParagraph,
          tButton,
          tTrialNote,
        ] = translated;

        setTexts({
          heading: {
            main: tHeadingMain,
            highlight: tHeadingHighlight,
          },
          paragraph: tParagraph,
          button: tButton,
          trialNote: tTrialNote,
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
      imageBg="/background/pricing_bg.jpg"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-4 md:px-6 h-polygon">
        <div className="text-center max-w-[1000px] mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading uppercase">
            {texts.heading.main}{" "}
            <span className="text-primary">{texts.heading.highlight}</span>
          </h1>

          <p className="polygon_paragraph">{texts.paragraph}</p>

          {/* Email input and button */}
          <Button size="md" className="font-secondary mt-4">
            {texts.button}
          </Button>
          <p className="mt-4 polygon_paragraph">{texts.trialNote}</p>
        </div>
      </div>
    </Polygon>
  );
};

export default PricingBanner;
