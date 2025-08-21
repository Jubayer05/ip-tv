"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const AboutStatistics = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const ORIGINAL_STATS = [
    {
      number: "10,000+",
      description: "Active Subscribers Worldwide",
    },
    {
      number: "3,000+",
      description: "Live Channels & 2,000+ Movies",
    },
    {
      number: "24/7",
      description: "Support with 98% Satisfaction Rating",
    },
    {
      number: "5,000+",
      description: "Streamed Devices Daily",
    },
  ];

  const [stats, setStats] = useState(ORIGINAL_STATS);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const descriptions = ORIGINAL_STATS.map((stat) => stat.description);
      const translatedDescriptions = await translate(descriptions);
      if (!isMounted) return;

      const updatedStats = ORIGINAL_STATS.map((stat, index) => ({
        ...stat,
        description: translatedDescriptions[index],
      }));

      setStats(updatedStats);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  return (
    <div className="bg-black text-white py-12 px-8">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="md:mb-3">
                <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white">
                  {stat.number}
                </h3>
              </div>
              <p className="text-primary text-sm md:text-base font-medium leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutStatistics;
