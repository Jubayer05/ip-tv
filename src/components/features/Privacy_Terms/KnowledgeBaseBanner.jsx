"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const KnowledgeBaseBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const [heading1, setHeading1] = useState("Everything You Need to Know—");
  const [heading2, setHeading2] = useState("All in One Place");
  const [paragraph, setParagraph] = useState(
    "Welcome to the Knowledge Base, your go-to resource hub for all things IPTV. Whether you're a first-time user, reseller, or long-time subscriber, this section is packed with helpful guides, FAQs, tutorials, and troubleshooting tips to make your experience smooth and seamless."
  );

  useEffect(() => {
    // Fetch banner content from settings
    const fetchBannerContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.banners?.knowledge) {
          const knowledgeBanner = data.data.banners.knowledge;
          setHeading1(knowledgeBanner.heading1 || heading1);
          setHeading2(knowledgeBanner.heading2 || heading2);
          setParagraph(knowledgeBanner.paragraph || paragraph);
        }
      } catch (error) {
        console.error("Failed to fetch banner content:", error);
      }
    };

    fetchBannerContent();
  }, []);

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
