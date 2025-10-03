"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const PrivacyBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Privacy Policy",
    paragraph:
      "Your privacy matters to us. This Privacy Policy explains how we collect, use, protect, and disclose your information when you visit or use our IPTV website and services.",
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
        if (data.success && data.data.banners?.privacy) {
          const privacyBanner = data.data.banners.privacy;
          const content = {
            heading:
              `${privacyBanner.heading1} ${privacyBanner.heading2}`.trim() ||
              ORIGINAL_TEXTS.heading,
            paragraph: privacyBanner.paragraph || ORIGINAL_TEXTS.paragraph,
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

export default PrivacyBanner;
