"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const AffiliateBanner = () => {
  const { translate, isLanguageLoaded } = useLanguage();

  const [heading, setHeading] = useState("Invite. Earn. Upgrade Your Rank.");
  const [paragraph, setParagraph] = useState(
    "Become a part of our Affiliate & Referral Program and earn rewards every time someone joins through your link—or when you spend more yourself. Whether you're a casual user or a loyal pro, there's something here for you."
  );

  // Store original content for translation
  const [originalContent, setOriginalContent] = useState(null);

  // Fetch banner content from settings
  useEffect(() => {
    const fetchBannerContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.banners?.affiliate) {
          const affiliateBanner = data.data.banners.affiliate;
          const content = {
            heading:
              `${affiliateBanner.heading1} ${affiliateBanner.heading2}`.trim() ||
              "Invite. Earn. Upgrade Your Rank.",
            paragraph:
              affiliateBanner.paragraph ||
              "Become a part of our Affiliate & Referral Program and earn rewards every time someone joins through your link—or when you spend more yourself. Whether you're a casual user or a loyal pro, there's something here for you.",
          };
          setOriginalContent(content);
        } else {
          // Use default content if no backend content
          const defaultContent = {
            heading: "Invite. Earn. Upgrade Your Rank.",
            paragraph:
              "Become a part of our Affiliate & Referral Program and earn rewards every time someone joins through your link—or when you spend more yourself. Whether you're a casual user or a loyal pro, there's something here for you.",
          };
          setOriginalContent(defaultContent);
        }
      } catch (error) {
        console.error("Failed to fetch banner content:", error);
        // Use default content on error
        const defaultContent = {
          heading: "Invite. Earn. Upgrade Your Rank.",
          paragraph:
            "Become a part of our Affiliate & Referral Program and earn rewards every time someone joins through your link—or when you spend more yourself. Whether you're a casual user or a loyal pro, there's something here for you.",
        };
        setOriginalContent(defaultContent);
      }
    };

    fetchBannerContent();
  }, []);

  // Translate content when language changes
  useEffect(() => {
    if (!originalContent || !isLanguageLoaded) return;

    let isMounted = true;
    (async () => {
      try {
        const textsToTranslate = [
          originalContent.heading,
          originalContent.paragraph,
        ];

        const translated = await translate(textsToTranslate);
        if (!isMounted) return;

        setHeading(translated[0]);
        setParagraph(translated[1]);
      } catch (error) {
        console.error("Error translating affiliate banner content:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [translate, originalContent, isLanguageLoaded]);

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
