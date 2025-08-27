"use client";
import Button from "@/components/ui/button";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const FaqBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const [heading1, setHeading1] = useState("LEARN HOW CHEAP STREAM");
  const [heading2, setHeading2] = useState("WORKS");
  const [paragraph, setParagraph] = useState(
    "We've made watching your favorite movies and live channels easier than ever. No cables, no contracts—just non-stop entertainment at a price you'll love."
  );
  const [buttonText, setButtonText] = useState("View Pricing Plans");

  useEffect(() => {
    // Fetch banner content from settings
    const fetchBannerContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.banners?.faq) {
          const faqBanner = data.data.banners.faq;
          setHeading1(faqBanner.heading1 || heading1);
          setHeading2(faqBanner.heading2 || heading2);
          setParagraph(faqBanner.paragraph || paragraph);
          setButtonText(faqBanner.buttonText || buttonText);
        }
      } catch (error) {
        console.error("Failed to fetch banner content:", error);
      }
    };

    fetchBannerContent();
  }, []);

  return (
    <Polygon
      imageBg="/background/faq_bg.webp"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading">{heading1}</h1>
          <h2 className="polygon_heading">{heading2}</h2>

          <p className="polygon_paragraph">{paragraph}</p>
          <Button>{buttonText}</Button>
        </div>
      </div>
    </Polygon>
  );
};

export default FaqBanner;
