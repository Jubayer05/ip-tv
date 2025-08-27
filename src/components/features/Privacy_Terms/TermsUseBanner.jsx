"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const TermsOfUseBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const [heading, setHeading] = useState("Terms of Use");
  const [paragraph, setParagraph] = useState(
    "Welcome to our IPTV platform. By accessing, purchasing from, or using our website and services, you agree to comply with and be bound by the following Terms of Use. Please read them carefully before proceeding."
  );

  useEffect(() => {
    // Fetch banner content from settings
    const fetchBannerContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.banners?.terms) {
          const termsBanner = data.data.banners.terms;
          setHeading(
            `${termsBanner.heading1} ${termsBanner.heading2}`.trim() || heading
          );
          setParagraph(termsBanner.paragraph || paragraph);
        }
      } catch (error) {
        console.error("Failed to fetch banner content:", error);
      }
    };

    fetchBannerContent();
  }, []);

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
