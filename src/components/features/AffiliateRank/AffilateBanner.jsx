"use client";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const AffiliateBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const ORIGINAL_HEADING = "Invite. Earn. Upgrade Your Rank.";
  const ORIGINAL_PARAGRAPH =
    "Become a part of our Affiliate & Referral Program and earn rewards every time someone joins through your link—or when you spend more yourself. Whether you're a casual user or a loyal pro, there's something here for you.";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [paragraph, setParagraph] = useState(ORIGINAL_PARAGRAPH);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [ORIGINAL_HEADING, ORIGINAL_PARAGRAPH];
      const translated = await translate(items);
      if (!isMounted) return;

      const [tHeading, tParagraph] = translated;

      setHeading(tHeading);
      setParagraph(tParagraph);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

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
