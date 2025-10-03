"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const TermsOfUseBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Terms of Use",
    paragraph:
      "Welcome to our IPTV platform. By accessing, purchasing from, or using our website and services, you agree to comply with and be bound by the following Terms of Use. Please read them carefully before proceeding.",
  };

  const [heading, setHeading] = useState(ORIGINAL_TEXTS.heading);
  const [paragraph, setParagraph] = useState(ORIGINAL_TEXTS.paragraph);

  // Store original content from backend
  const [originalContent, setOriginalContent] = useState(null);

  useEffect(() => {
    // Fetch banner content from settings
    const fetchBannerContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.banners?.terms) {
          const termsBanner = data.data.banners.terms;
          const content = {
            heading:
              `${termsBanner.heading1} ${termsBanner.heading2}`.trim() ||
              ORIGINAL_TEXTS.heading,
            paragraph: termsBanner.paragraph || ORIGINAL_TEXTS.paragraph,
          };
          setOriginalContent(content);
        } else {
          // Set default content if no backend data
          setOriginalContent(ORIGINAL_TEXTS);
        }
      } catch (error) {
        console.error("Failed to fetch banner content:", error);
        // Set default content on error
        setOriginalContent(ORIGINAL_TEXTS);
      }
    };

    fetchBannerContent();
  }, []);

  // Translate content when language changes
  useEffect(() => {
    if (!originalContent || !isLanguageLoaded || language?.code === "en") {
      if (originalContent) {
        setHeading(originalContent.heading);
        setParagraph(originalContent.paragraph);
      }
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const textsToTranslate = [
          originalContent.heading,
          originalContent.paragraph,
        ];

        const translated = await translate(textsToTranslate);
        if (!isMounted) return;

        const [tHeading, tParagraph] = translated;

        setHeading(tHeading);
        setParagraph(tParagraph);
      } catch (error) {
        console.error("Translation error:", error);
        // Fallback to original content on translation error
        setHeading(originalContent.heading);
        setParagraph(originalContent.paragraph);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [originalContent, language?.code, translate, isLanguageLoaded]);

  return (
    <Polygon
      imageBg="/background/affiliate_bg.webp"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading">{heading}</h1>

          <p className="polygon_paragraph">{paragraph}</p>
        </div>
      </div>
    </Polygon>
  );
};

export default TermsOfUseBanner;
