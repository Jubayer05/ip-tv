"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const PrivacyBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const [heading, setHeading] = useState("Privacy Policy");
  const [paragraph, setParagraph] = useState(
    "Your privacy matters to us. This Privacy Policy explains how we collect, use, protect, and disclose your information when you visit or use our IPTV website and services."
  );

  useEffect(() => {
    // Fetch banner content from settings
    const fetchBannerContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.banners?.privacy) {
          const privacyBanner = data.data.banners.privacy;
          setHeading(
            `${privacyBanner.heading1} ${privacyBanner.heading2}`.trim() ||
              heading
          );
          setParagraph(privacyBanner.paragraph || paragraph);
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

export default PrivacyBanner;
