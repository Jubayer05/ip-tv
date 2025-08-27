"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const AffiliateBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const [heading, setHeading] = useState("Invite. Earn. Upgrade Your Rank.");
  const [paragraph, setParagraph] = useState(
    "Become a part of our Affiliate & Referral Program and earn rewards every time someone joins through your link—or when you spend more yourself. Whether you're a casual user or a loyal pro, there's something here for you."
  );

  useEffect(() => {
    // Fetch banner content from settings
    const fetchBannerContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.banners?.affiliate) {
          const affiliateBanner = data.data.banners.affiliate;
          setHeading(
            `${affiliateBanner.heading1} ${affiliateBanner.heading2}`.trim() ||
              heading
          );
          setParagraph(affiliateBanner.paragraph || paragraph);
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
        <div className="text-center mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading uppercase">{heading}</h1>

          <p className="polygon_paragraph">{paragraph}</p>
        </div>
      </div>
    </Polygon>
  );
};

export default AffiliateBanner;
