"use client";
import Button from "@/components/ui/button";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const PricingBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const [heading1, setHeading1] = useState("Watch More, Pay Less –");
  const [heading2, setHeading2] = useState("Choose Your Streaming Plans");
  const [paragraph, setParagraph] = useState(
    "At Cheap Stream, we believe in affordable entertainment without sacrificing quality. Whether you're a casual viewer or a full-on movie marathoner, we've got a plan that fits your lifestyle—and your budget."
  );
  const [buttonText, setButtonText] = useState("Start with a Free Trial!");
  const [trialNote, setTrialNote] = useState(
    "*Try Cheap Stream free for 24 hours—no credit card required!"
  );

  useEffect(() => {
    // Fetch banner content from settings
    const fetchBannerContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.banners?.pricing) {
          const pricingBanner = data.data.banners.pricing;
          setHeading1(pricingBanner.heading1 || heading1);
          setHeading2(pricingBanner.heading2 || heading2);
          setParagraph(pricingBanner.paragraph || paragraph);
          setButtonText(pricingBanner.buttonText || buttonText);
          setTrialNote(pricingBanner.trialNote || trialNote);
        }
      } catch (error) {
        console.error("Failed to fetch banner content:", error);
      }
    };

    fetchBannerContent();
  }, []);

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
