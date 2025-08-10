"use client";
import Button from "@/components/ui/button";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const MainBanner = () => {
  const { language, translate } = useLanguage();

  const ORIGINAL_HEADING_1 = "YOUR TICKET TO ENDLESS";
  const ORIGINAL_HEADING_2 = "ENTERTAINMENT";
  const ORIGINAL_PARAGRAPH =
    "Why pay more when you can stream smarter? Cheap Stream brings you thousands of movies at the best price. Whether you love action, drama, comedy, or horror, we have something for everyone—all in HD & 4K quality with zero buffering.";
  const ORIGINAL_PLACEHOLDER = "Email Address";
  const ORIGINAL_BUTTON = "Get Started";

  const [heading1, setHeading1] = useState(ORIGINAL_HEADING_1);
  const [heading2, setHeading2] = useState(ORIGINAL_HEADING_2);
  const [paragraph, setParagraph] = useState(ORIGINAL_PARAGRAPH);
  const [placeholder, setPlaceholder] = useState(ORIGINAL_PLACEHOLDER);
  const [buttonText, setButtonText] = useState(ORIGINAL_BUTTON);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_HEADING_1,
        ORIGINAL_HEADING_2,
        ORIGINAL_PARAGRAPH,
        ORIGINAL_PLACEHOLDER,
        ORIGINAL_BUTTON,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [tHeading1, tHeading2, tParagraph, tPlaceholder, tButtonText] =
        translated;

      setHeading1(tHeading1);
      setHeading2(tHeading2);
      setParagraph(tParagraph);
      setPlaceholder(tPlaceholder);
      setButtonText(tButtonText);
    })();

    return () => {
      isMounted = false;
    };
    // Update when language changes
  }, [language.code]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Polygon imageBg="/background/banner_bg.webp">
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading">
            {heading1}
            <br />
            <span className="text-primary">{heading2}</span>
          </h1>

          <p className="polygon_paragraph">{paragraph}</p>

          {/* Email input and button */}
          <div className="flex flex-col font-secondary sm:flex-row items-center justify-center gap-4 max-w-md mx-auto relative border-1 border-[#808080]/70 rounded-full">
            <div className="relative w-full sm:flex-1">
              <input
                type="email"
                placeholder={placeholder}
                className="w-full px-6 pr-32 py-4 bg-[rgba(128,128,128,0.7)] border border-gray-600 rounded-full text-white placeholder-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                <Button size="lg">{buttonText}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Polygon>
  );
};
export default MainBanner;
