"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const AboutUsBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const [heading1, setHeading1] = useState(
    "Good TV Shouldn't Cost a Fortune."
  );
  const [heading2, setHeading2] = useState("That's Why We Built This.");
  const [paragraph, setParagraph] = useState(
    "We got tired of paying $150 a month for cable and streaming services that charge you for every little thing. So a few of us—people who don't have cable, techies, and TV addicts—decided to take action. Streaming that works without long contracts or hidden fees."
  );

  useEffect(() => {
    // Fetch banner content from settings
    const fetchBannerContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.banners?.about) {
          const aboutBanner = data.data.banners.about;
          setHeading1(aboutBanner.heading1 || heading1);
          setHeading2(aboutBanner.heading2 || heading2);
          setParagraph(aboutBanner.paragraph || paragraph);
        }
      } catch (error) {
        console.error("Failed to fetch banner content:", error);
      }
    };

    fetchBannerContent();
  }, []);

  return (
    <Polygon
      imageBg="/background/about_us_bg.webp"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center mx-auto">
          {/* Main heading */}
          <h1 className="text-white text-4xl md:text-[40px] font-bold mb-3 leading-tight">
            {heading1} {heading2}
          </h1>

          <p className="text-white text-sm font-medium mb-6 leading-tight font-secondary">
            {paragraph}
          </p>
        </div>
      </div>
    </Polygon>
  );
};

export default AboutUsBanner;
