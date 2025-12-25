"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

export default function RankSystem() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [rankSystems, setRankSystems] = useState([]);
  const [loading, setLoading] = useState(true);

  const ORIGINAL_HEADING = "RANK SYSTEM GET MORE AS YOU SPEND";
  const ORIGINAL_SUBTITLE =
    "Your total spending and referrals unlock rank-based discounts and benefits.";
  const ORIGINAL_FOOTER =
    "*Ranks update automatically based on total spending and referral performance.";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [subtitle, setSubtitle] = useState(ORIGINAL_SUBTITLE);
  const [footer, setFooter] = useState(ORIGINAL_FOOTER);

  useEffect(() => {
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [ORIGINAL_HEADING, ORIGINAL_SUBTITLE, ORIGINAL_FOOTER];
      const translated = await translate(items);
      if (!isMounted) return;

      const [tHeading, tSubtitle, tFooter] = translated;

      setHeading(tHeading);
      setSubtitle(tSubtitle);
      setFooter(tFooter);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  useEffect(() => {
    fetchRankSystems();
  }, []);

  const fetchRankSystems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/rank-system");
      const data = await response.json();

      if (data.success) {
        setRankSystems(data.data);
      }
    } catch (error) {
      console.error("Error fetching rank systems:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatSpending = (spending) => {
    if (spending.max === 0 || spending.max === null) {
      return `$${spending.min}+`;
    }
    return `$${spending.min} - $${spending.max}`;
  };

  if (loading) {
    return (
      <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 md:p-8 rounded-lg w-full lg:max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading rank system...</p>
        </div>
      </div>
    );
  }

  if (rankSystems.length === 0) {
    return (
      <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 md:p-8 rounded-lg w-full lg:max-w-4xl mx-auto">
        <div className="text-center py-8">
          <p className="text-gray-400">
            No rank systems available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 md:p-8 rounded-lg w-full lg:max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 tracking-wide">
          {heading}
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm">{subtitle}</p>
      </div>

      {/* Rank Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {rankSystems.map((rank) => (
          <div
            key={rank._id}
            className="bg-[#0E0E11] border border-white/15 rounded-lg p-4 sm:p-6 hover:border-white/40 transition-colors duration-200"
          >
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {rank.name}
              </h3>
              <span className="text-white font-semibold text-right text-xs sm:text-sm">
                {formatSpending(rank.spending)}
              </span>
            </div>
            <p className="text-[#afafaf] text-xs sm:text-sm leading-relaxed">
              {rank.benefits}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <p className="text-white text-xs">{footer}</p>
    </div>
  );
}
