"use client";
import Button from "@/components/ui/button";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const PricingBanner = () => {
  const { translate, isLanguageLoaded } = useLanguage();

  const [heading1, setHeading1] = useState("Find Your Perfect Plan –");
  const [heading2, setHeading2] = useState("No Contracts, No Catch");
  const [paragraph, setParagraph] = useState(
    "Whether you watch a little or a lot, we have something that fits. Pick a plan, try it out, and switch anytime. It's that simple."
  );
  const [buttonText, setButtonText] = useState("Try It Free for 24 Hours");
  const [trialNote, setTrialNote] = useState(
    "*No credit card needed. Just pick a plan and start watching."
  );

  // Store original content for translation
  const [originalContent, setOriginalContent] = useState(null);

  // Fetch banner content from settings
  useEffect(() => {
    const fetchBannerContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.banners?.pricing) {
          const pricingBanner = data.data.banners.pricing;
          const content = {
            heading1: pricingBanner.heading1 || "Find Your Perfect Plan –",
            heading2: pricingBanner.heading2 || "No Contracts, No Catch",
            paragraph:
              pricingBanner.paragraph ||
              "Whether you watch a little or a lot, we have something that fits. Pick a plan, try it out, and switch anytime. It's that simple.",
            buttonText: pricingBanner.buttonText || "Try It Free for 24 Hours",
            trialNote:
              pricingBanner.trialNote ||
              "*No credit card needed. Just pick a plan and start watching.",
          };
          setOriginalContent(content);
        } else {
          // Use default content if no backend content
          const defaultContent = {
            heading1: "Find Your Perfect Plan –",
            heading2: "No Contracts, No Catch",
            paragraph:
              "Whether you watch a little or a lot, we have something that fits. Pick a plan, try it out, and switch anytime. It's that simple.",
            buttonText: "Try It Free for 24 Hours",
            trialNote:
              "*No credit card needed. Just pick a plan and start watching.",
          };
          setOriginalContent(defaultContent);
        }
      } catch (error) {
        console.error("Failed to fetch banner content:", error);
        // Use default content on error
        const defaultContent = {
          heading1: "Find Your Perfect Plan –",
          heading2: "No Contracts, No Catch",
          paragraph:
            "Whether you watch a little or a lot, we have something that fits. Pick a plan, try it out, and switch anytime. It's that simple.",
          buttonText: "Try It Free for 24 Hours",
          trialNote:
            "*No credit card needed. Just pick a plan and start watching.",
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
          originalContent.heading1,
          originalContent.heading2,
          originalContent.paragraph,
          originalContent.buttonText,
          originalContent.trialNote,
        ];

        const translated = await translate(textsToTranslate);
        if (!isMounted) return;

        setHeading1(translated[0]);
        setHeading2(translated[1]);
        setParagraph(translated[2]);
        setButtonText(translated[3]);
        setTrialNote(translated[4]);
      } catch (error) {
        console.error("Error translating pricing banner content:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [translate, originalContent, isLanguageLoaded]);

  return (
    <Polygon
      imageBg="/background/pricing_bg.jpg"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-4 md:px-6 h-polygon">
        <div className="text-center max-w-[1000px] mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading uppercase">
            {heading1} <span className="text-primary">{heading2}</span>
          </h1>

          <p className="polygon_paragraph">{paragraph}</p>

          {/* Email input and button */}
          <Button size="md" className="font-secondary mt-4">
            {buttonText}
          </Button>
          <p className="mt-4 polygon_paragraph">{trialNote}</p>
        </div>
      </div>
    </Polygon>
  );
};

export default PricingBanner;
