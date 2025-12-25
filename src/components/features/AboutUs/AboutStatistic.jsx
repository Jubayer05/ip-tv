"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Dynamically import CountUp to avoid SSR issues
const CountUp = dynamic(
  () => import("react-countup").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <span>0</span>,
  }
);

const AboutStatistics = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const sectionRef = useRef(null);
  const countUpRefs = useRef([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const ORIGINAL_STATS = [
    {
      number: 27000,
      suffix: "+",
      description: "Premium Live TV Channels Worldwide",
    },
    {
      number: 130000,
      suffix: "+",
      description: "HD Movies & Latest Blockbusters",
    },
    {
      number: 52000,
      suffix: "+",
      description: "Exclusive TV Series & Popular Shows",
    },
    {
      number: "24/7",
      isText: true,
      description: "Support with 98% Satisfaction Rating",
    },
  ];

  const [stats, setStats] = useState(ORIGINAL_STATS);

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Intersection Observer to trigger animation
  useEffect(() => {
    if (!isMounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isMounted]);

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

  if (!isMounted) {
    return (
      <div className="bg-black text-white py-12 px-8">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="md:mb-3">
                  <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white">
                    {stat.isText ? stat.number : "0"}
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
  }

  return (
    <div ref={sectionRef} className="bg-black text-white py-12 px-8">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="md:mb-3">
                <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white">
                  {stat.isText ? (
                    stat.number
                  ) : (
                    <span
                      ref={(el) => {
                        countUpRefs.current[index] = el;
                      }}
                    >
                      {isVisible ? (
                        <CountUp
                          start={0}
                          end={stat.number}
                          duration={4.5}
                          separator=","
                          suffix={stat.suffix || ""}
                          delay={0.2 * index}
                        />
                      ) : (
                        "0"
                      )}
                    </span>
                  )}
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
