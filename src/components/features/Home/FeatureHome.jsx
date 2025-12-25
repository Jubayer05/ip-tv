"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Film, Monitor, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const FeatureHome = ({ featureAbout = false }) => {
  const { language, translate } = useLanguage();

  const ORIGINAL_HEADING = "YOUR SHOWS, YOUR SCHEDULE";
  const ORIGINAL_PARAGRAPH =
    "We run servers across the globe so you get smooth playback wherever you are. Whether you're at home in the US, traveling through Europe, or relaxing in Asia, your favorite content follows you.";
  const ORIGINAL_FEATURE_1_TITLE = "Thousands of Movies";
  const ORIGINAL_FEATURE_1_DESC = "Old favorites and new releases alike";
  const ORIGINAL_FEATURE_2_TITLE = "Sharp HD & 4K Picture";
  const ORIGINAL_FEATURE_2_DESC = "See every detail, no blur";
  const ORIGINAL_FEATURE_3_TITLE = "Cancel When You Want";
  const ORIGINAL_FEATURE_3_DESC = "Month-to-month, no strings attached";
  const ORIGINAL_FEATURE_4_TITLE = "Any Screen Works";
  const ORIGINAL_FEATURE_4_DESC = "Phone, tablet, laptop, or big screen TV";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [paragraph, setParagraph] = useState(ORIGINAL_PARAGRAPH);
  const [feature1Title, setFeature1Title] = useState(ORIGINAL_FEATURE_1_TITLE);
  const [feature1Desc, setFeature1Desc] = useState(ORIGINAL_FEATURE_1_DESC);
  const [feature2Title, setFeature2Title] = useState(ORIGINAL_FEATURE_2_TITLE);
  const [feature2Desc, setFeature2Desc] = useState(ORIGINAL_FEATURE_2_DESC);
  const [feature3Title, setFeature3Title] = useState(ORIGINAL_FEATURE_3_TITLE);
  const [feature3Desc, setFeature3Desc] = useState(ORIGINAL_FEATURE_3_DESC);
  const [feature4Title, setFeature4Title] = useState(ORIGINAL_FEATURE_4_TITLE);
  const [feature4Desc, setFeature4Desc] = useState(ORIGINAL_FEATURE_4_DESC);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_HEADING,
        ORIGINAL_PARAGRAPH,
        ORIGINAL_FEATURE_1_TITLE,
        ORIGINAL_FEATURE_1_DESC,
        ORIGINAL_FEATURE_2_TITLE,
        ORIGINAL_FEATURE_2_DESC,
        ORIGINAL_FEATURE_3_TITLE,
        ORIGINAL_FEATURE_3_DESC,
        ORIGINAL_FEATURE_4_TITLE,
        ORIGINAL_FEATURE_4_DESC,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tHeading,
        tParagraph,
        tFeature1Title,
        tFeature1Desc,
        tFeature2Title,
        tFeature2Desc,
        tFeature3Title,
        tFeature3Desc,
        tFeature4Title,
        tFeature4Desc,
      ] = translated;

      setHeading(tHeading);
      setParagraph(tParagraph);
      setFeature1Title(tFeature1Title);
      setFeature1Desc(tFeature1Desc);
      setFeature2Title(tFeature2Title);
      setFeature2Desc(tFeature2Desc);
      setFeature3Title(tFeature3Title);
      setFeature3Desc(tFeature3Desc);
      setFeature4Title(tFeature4Title);
      setFeature4Desc(tFeature4Desc);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`min-h-screen ${
        featureAbout ? "mt-14 md:mt-0" : "bg-black pt-12 -mt-2"
      } text-white overflow-hidden`}
    >
      <div className="relative flex items-center justify-center min-h-screen px-4 md:px-8 lg:px-16">
        {/* Main content container */}
        <div className="relative z-10 max-w-7xl w-full grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Image with decorative elements */}
          <div className="relative flex justify-center lg:justify-start bg-primary rounded-4xl order-2 md:order-1">
            <Image
              src="/background/feature.png"
              width={400}
              height={500}
              alt="Cheap Stream TV streaming features"
              className="rounded-3xl w-full h-[300px] sm:h-[400px] md:h-[530px] object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              quality={70}
              loading="lazy"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-8 text-left lg:text-left order-1 md:order-2">
            {/* Main heading */}
            <div className="space-y-4">
              <h2
                className={`text-2xl md:text-4xl text-left md:text-center text-white font-bold leading-tight ${
                  featureAbout ? "" : "md:text-5xl"
                }`}
              >
                {heading}
              </h2>

              <p className="text-gray-300 font-secondary text-xs md:text-xl text-left md:text-center leading-relaxed max-w-2xl">
                {paragraph}
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-6">
              {/* Massive Movie Library */}
              <div className="flex items-center space-x-4 justify-start lg:justify-start">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                  <Film className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">
                    {feature1Title}
                  </p>
                  <p className="text-gray-400 text-xs md:text-base font-secondary">
                    {feature1Desc}
                  </p>
                </div>
              </div>

              {/* HD & 4K Streaming */}
              <div className="flex items-center space-x-4 justify-start lg:justify-start">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30">
                  <div className="text-yellow-400 font-bold text-sm">4K</div>
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">
                    {feature2Title}
                  </p>
                  <p className="text-gray-400 text-xs md:text-base font-secondary">
                    {feature2Desc}
                  </p>
                </div>
              </div>

              {/* No Contracts, No Hidden Fees */}
              <div className="flex items-center space-x-4 justify-start lg:justify-start">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">
                    {feature3Title}
                  </p>
                  <p className="text-gray-400 text-xs md:text-base font-secondary">
                    {feature3Desc}
                  </p>
                </div>
              </div>

              {/* Works on Any Device */}
              <div className="flex items-center space-x-4 justify-start lg:justify-start">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                  <Monitor className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">
                    {feature4Title}
                  </p>
                  <p className="text-gray-400 text-xs md:text-base font-secondary">
                    {feature4Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureHome;
