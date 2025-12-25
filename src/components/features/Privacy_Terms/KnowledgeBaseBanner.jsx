"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const KnowledgeBaseBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading1: "Everything You Need to Know",
    heading2: "All in One Place",
    paragraph:
      "Welcome to the Knowledge Base, your go-to resource hub for all things IPTV. Whether you're a first-time user, reseller, or long-time subscriber, this section is packed with helpful guides, FAQs, tutorials, and troubleshooting tips to make your experience smooth and seamless.",
  };

  const [heading1, setHeading1] = useState(ORIGINAL_TEXTS.heading1);
  const [heading2, setHeading2] = useState(ORIGINAL_TEXTS.heading2);
  const [paragraph, setParagraph] = useState(ORIGINAL_TEXTS.paragraph);

  // Store original content from backend
  const [originalContent, setOriginalContent] = useState(null);

  useEffect(() => {
    // Fetch banner content from settings
    const fetchBannerContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.banners?.knowledge) {
          const knowledgeBanner = data.data.banners.knowledge;
          const content = {
            heading1: knowledgeBanner.heading1 || ORIGINAL_TEXTS.heading1,
            heading2: knowledgeBanner.heading2 || ORIGINAL_TEXTS.heading2,
            paragraph: knowledgeBanner.paragraph || ORIGINAL_TEXTS.paragraph,
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
        setHeading1(originalContent.heading1);
        setHeading2(originalContent.heading2);
        setParagraph(originalContent.paragraph);
      }
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const textsToTranslate = [
          originalContent.heading1,
          originalContent.heading2,
          originalContent.paragraph,
        ];

        const translated = await translate(textsToTranslate);
        if (!isMounted) return;

        const [tHeading1, tHeading2, tParagraph] = translated;

        setHeading1(tHeading1);
        setHeading2(tHeading2);
        setParagraph(tParagraph);
      } catch (error) {
        console.error("Translation error:", error);
        // Fallback to original content on translation error
        setHeading1(originalContent.heading1);
        setHeading2(originalContent.heading2);
        setParagraph(originalContent.paragraph);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [originalContent, language?.code, translate, isLanguageLoaded]);

  return (
    <Polygon
      imageBg="/background/blog_bg.webp"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading">{heading1}</h1>
          <h2 className="polygon_heading">{heading2}</h2>

          <p className="polygon_paragraph">{paragraph}</p>
        </div>
      </div>
    </Polygon>
  );
};

export default KnowledgeBaseBanner;
