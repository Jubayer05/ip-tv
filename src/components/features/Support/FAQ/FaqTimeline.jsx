"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const FaqTimeline = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original text constants
  const ORIGINAL_TEXTS = {
    header: {
      title: "STREAMING MADE SIMPLE WITH CHEAP STREAM",
      subtitle:
        "We've made watching your favorite movies and live channels easier than ever. No cables, no contracts—just non-stop entertainment at a price you'll love.",
    },
    steps: [
      {
        number: "1",
        title: "Choose Your Plan",
        description:
          "Pick a monthly plan that fits your needs. Whether you want basic access or the full premium experience, we've got you covered.",
      },
      {
        number: "2",
        title: "Get Instant Access",
        description:
          "After signup, you'll receive your login credentials via email within minutes. You'll also get step-by-step setup instructions for your device.",
      },
      {
        number: "3",
        title: "Start Streaming",
        description:
          "Login and start watching! Enjoy 1,000s of movies, TV shows, and live channels from around the world in HD or 4K—on any device.",
      },
    ],
  };

  // State for translated content
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        // Collect all translatable text
        const allTexts = [
          ORIGINAL_TEXTS.header.title,
          ORIGINAL_TEXTS.header.subtitle,
          ...ORIGINAL_TEXTS.steps.flatMap((step) => [
            step.title,
            step.description,
          ]),
        ];

        const translated = await translate(allTexts);
        if (!isMounted) return;

        const [tTitle, tSubtitle, ...tStepTexts] = translated;

        // Update steps with translated content
        const updatedSteps = ORIGINAL_TEXTS.steps.map((step, index) => ({
          ...step,
          title: tStepTexts[index * 2],
          description: tStepTexts[index * 2 + 1],
        }));

        setTexts({
          header: {
            title: tTitle,
            subtitle: tSubtitle,
          },
          steps: updatedSteps,
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  return (
    <div className="text-white py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 font-secondary">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 tracking-wide text-center">
            {texts.header.title}
          </h2>
          <p className="text-gray-300 text-xs sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed text-center px-2">
            {texts.header.subtitle}
          </p>
        </div>

        {/* Steps - Mobile: Vertical with connecting lines, Desktop: Horizontal grid */}
        <div className="relative">
          {/* Mobile Layout (Vertical) */}
          <div className="block md:hidden">
            {texts.steps.map((step, index) => (
              <div
                key={index}
                className="relative flex items-start mb-8 last:mb-0"
              >
                {/* Vertical connecting line */}
                {index < texts.steps.length - 1 && (
                  <div className="absolute left-6 sm:left-8 top-12 sm:top-16 w-0.5 h-20 sm:h-12 dotted-line-vertical"></div>
                )}

                {/* Step Number Circle */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                  <span className="text-black text-lg sm:text-xl font-bold">
                    {step.number}
                  </span>
                </div>

                {/* Step Content */}
                <div className="ml-6 flex-1">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Layout (Horizontal Grid) */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-8 lg:gap-12 relative">
              {/* Connection Lines */}
              <div className="absolute top-8 left-0 right-0 h-0.5">
                <div className="flex h-full">
                  <div className="flex-[0.74] h-0.5 dotted-line"></div>
                </div>
              </div>

              {texts.steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step Number Circle */}
                  <div className="w-16 h-16 bg-cyan-400 rounded-full flex items-center justify-center mb-6 relative z-10 mx-auto md:mx-0">
                    <span className="text-black text-xl font-bold">
                      {step.number}
                    </span>
                  </div>

                  {/* Step Content */}
                  <div className="space-y-4 text-center md:text-left">
                    <h3 className="text-xl lg:text-2xl font-bold">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dotted-line {
          border: 2px dashed #ffffff33;
        }
        .dotted-line-vertical {
          background: repeating-linear-gradient(
            to bottom,
            #ffffff33 0px,
            #ffffff33 4px,
            transparent 4px,
            transparent 8px
          );
        }
      `}</style>
    </div>
  );
};

export default FaqTimeline;
