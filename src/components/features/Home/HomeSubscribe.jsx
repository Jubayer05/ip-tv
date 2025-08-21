"use client";
import Button from "@/components/ui/button";
import Polygon from "@/components/ui/polygon";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { useEffect, useState } from "react";

const HomeSubscribe = () => {
  const { language, translate } = useLanguage();

  const ORIGINAL_HEADING_1 = "Start Streaming for Less –";
  const ORIGINAL_HEADING_2 = "Sign Up Today!";
  const ORIGINAL_PARAGRAPH =
    "Ready to ditch overpriced streaming services? Join Cheap Stream now and start watching your favorite movies instantly.";
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
  }, [language.code]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mt-8 md:mt-20">
      <Polygon>
        <div className="container mx-auto flex items-center flex-col md:flex-row justify-between h-[400px] md:h-[560px] relative">
          {/* Left Content */}
          <div className="flex-1 max-w-2xl md:pl-14 mt-8 md:mt-0 px-4 md:px-0">
            {/* Main heading */}
            <h1 className="text-white text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-6 leading-tight text-center md:text-left">
              {heading1}
              <br />
              <span className="text-primary">{heading2}</span>
            </h1>

            <p className="text-center md:text-left text-white text-xs sm:text-sm md:text-base lg:text-[16px] font-medium mb-4 md:mb-8 leading-relaxed font-secondary max-w-xl">
              {paragraph}
            </p>

            {/* Email input and button */}
            <div className="flex flex-col font-secondary sm:flex-row items-center md:items-start gap-3 md:gap-4 max-w-md mx-auto md:mx-0 relative">
              <div className="relative w-full sm:flex-1">
                <input
                  type="email"
                  placeholder={placeholder}
                  className="w-full px-4 md:px-6 pr-24 md:pr-32 py-3 md:py-4 bg-[rgba(128,128,128,0.7)] border border-gray-600 rounded-full text-white placeholder-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 text-sm md:text-base"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <Button size="sm" className="md:hidden">
                    {buttonText}
                  </Button>
                  <Button size="md" className="hidden md:block">
                    {buttonText}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image with Custom Gradient Overlay */}
          <div className="relative flex-shrink-0 mt-6 md:mt-0 w-full md:w-auto">
            <Image
              src="/background/subscribe.jpg"
              alt="subscribe"
              width={400}
              height={560}
              className="w-full h-[200px] sm:h-[250px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[560px] object-cover rounded-lg"
            />

            {/* Custom Gradient Overlay */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background:
                  "linear-gradient(270deg, rgba(0, 0, 0, 0) 60.85%, #000000 88.64%)",
              }}
            ></div>
          </div>
        </div>
      </Polygon>
    </div>
  );
};

export default HomeSubscribe;
