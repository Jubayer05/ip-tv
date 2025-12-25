"use client";
import Button from "@/components/ui/button";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { memo, useEffect, useState, useCallback } from "react";

const MainBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const [heading1, setHeading1] = useState("STREAM MORE,");
  const [heading2, setHeading2] = useState("PAY LESS");
  const [paragraph, setParagraph] = useState(
    "Are you sick of paying too much for cable? We get it. For a small fee, Cheap Stream lets you watch live TV, movies, and sports on any device. Just great entertainment whenever you want it, with no contracts or hassle."
  );
  const [placeholder, setPlaceholder] = useState("Enter your email");
  const [buttonText, setButtonText] = useState("Start Watching");

  // Store original content from API for translation
  const [originalContent, setOriginalContent] = useState({
    heading1: "STREAM MORE,",
    heading2: "PAY LESS",
    paragraph:
      "Are you sick of paying too much for cable? We get it. For a small fee, Cheap Stream lets you watch live TV, movies, and sports on any device. Just great entertainment whenever you want it, with no contracts or hassle.",
    placeholder: "Enter your email",
    buttonText: "Start Watching",
  });

  // Fetch banner content from settings - deferred to not block render
  useEffect(() => {
    const fetchBannerContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.banners?.home) {
          const homeBanner = data.data.banners.home;
          const newContent = {
            heading1: homeBanner.heading1 || originalContent.heading1,
            heading2: homeBanner.heading2 || originalContent.heading2,
            paragraph: homeBanner.paragraph || originalContent.paragraph,
            placeholder: homeBanner.placeholder || originalContent.placeholder,
            buttonText: homeBanner.buttonText || originalContent.buttonText,
          };

          setOriginalContent(newContent);
          setHeading1(newContent.heading1);
          setHeading2(newContent.heading2);
          setParagraph(newContent.paragraph);
          setPlaceholder(newContent.placeholder);
          setButtonText(newContent.buttonText);
        }
      } catch (error) {
        console.error("Failed to fetch banner content:", error);
      }
    };

    // Defer API call to after initial paint using requestIdleCallback
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => fetchBannerContent(), { timeout: 2000 });
      } else {
        setTimeout(fetchBannerContent, 1);
      }
    }
  }, []); // Only run once on mount

  // Translate banner content when language changes or content is loaded
  useEffect(() => {
    // Don't translate if language isn't loaded yet or it's English
    if (!isLanguageLoaded || language.code === "en") {
      // Reset to original content if switching to English
      if (language.code === "en") {
        setHeading1(originalContent.heading1);
        setHeading2(originalContent.heading2);
        setParagraph(originalContent.paragraph);
        setPlaceholder(originalContent.placeholder);
        setButtonText(originalContent.buttonText);
      }
      return;
    }

    let isMounted = true;

    const translateContent = async () => {
      try {
        const items = [
          originalContent.heading1,
          originalContent.heading2,
          originalContent.paragraph,
          originalContent.placeholder,
          originalContent.buttonText,
        ];

        const translated = await translate(items);

        if (!isMounted) return;

        const [tHeading1, tHeading2, tParagraph, tPlaceholder, tButtonText] =
          translated;

        // Apply translations if they exist
        if (tHeading1) setHeading1(tHeading1);
        if (tHeading2) setHeading2(tHeading2);
        if (tParagraph) setParagraph(tParagraph);
        if (tPlaceholder) setPlaceholder(tPlaceholder);
        if (tButtonText) setButtonText(tButtonText);
      } catch (error) {
        console.error("Translation error:", error);
        // Fallback to original content on error
        if (isMounted) {
          setHeading1(originalContent.heading1);
          setHeading2(originalContent.heading2);
          setParagraph(originalContent.paragraph);
          setPlaceholder(originalContent.placeholder);
          setButtonText(originalContent.buttonText);
        }
      }
    };

    translateContent();

    return () => {
      isMounted = false;
    };
  }, [
    language.code,
    isLanguageLoaded,
    translate,
    originalContent.heading1,
    originalContent.heading2,
    originalContent.paragraph,
    originalContent.placeholder,
    originalContent.buttonText,
  ]);

  return (
    <Polygon imageBg="/background/banner_bg.webp">
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading">
            {heading1}
            <br />
            <span className="text-primary">{heading2}</span>
          </h1>

          <p className="polygon_paragraph">{paragraph}</p>

          {/* Email input and button */}
          <div className="flex flex-col font-secondary sm:flex-row items-center justify-center gap-4 max-w-md mx-auto relative border-1 border-[#808080]/70 rounded-full">
            <div className="relative w-full sm:flex-1">
              <input
                type="email"
                placeholder={placeholder}
                className="w-full px-6 pr-32 py-4 bg-[rgba(128,128,128,0.7)] border border-gray-600 rounded-full text-white placeholder-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                <Button size="lg">{buttonText}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Polygon>
  );
};

export default memo(MainBanner);
