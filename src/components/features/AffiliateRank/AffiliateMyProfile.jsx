"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { useEffect, useState } from "react";
import { TiPencil } from "react-icons/ti";

export default function AffiliateProfile() {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const ORIGINAL_HEADING = "YOUR AFFILIATE PROFILE";
  const ORIGINAL_USERNAME = "VIP STORE";
  const ORIGINAL_HANDLE = "@vipstore101";
  const ORIGINAL_RANK = "Silver";
  const ORIGINAL_TOTAL_SALES = "Total Referred Sales:";
  const ORIGINAL_CURRENT_RANK = "Current Rank:";
  const ORIGINAL_PERSONALIZE = "Personalize your profile";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [username, setUsername] = useState(ORIGINAL_USERNAME);
  const [handle, setHandle] = useState(ORIGINAL_HANDLE);
  const [rank, setRank] = useState(ORIGINAL_RANK);
  const [totalSales, setTotalSales] = useState(ORIGINAL_TOTAL_SALES);
  const [currentRank, setCurrentRank] = useState(ORIGINAL_CURRENT_RANK);
  const [personalize, setPersonalize] = useState(ORIGINAL_PERSONALIZE);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_HEADING,
        ORIGINAL_USERNAME,
        ORIGINAL_HANDLE,
        ORIGINAL_RANK,
        ORIGINAL_TOTAL_SALES,
        ORIGINAL_CURRENT_RANK,
        ORIGINAL_PERSONALIZE,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tHeading,
        tUsername,
        tHandle,
        tRank,
        tTotalSales,
        tCurrentRank,
        tPersonalize,
      ] = translated;

      setHeading(tHeading);
      setUsername(tUsername);
      setHandle(tHandle);
      setRank(tRank);
      setTotalSales(tTotalSales);
      setCurrentRank(tCurrentRank);
      setPersonalize(tPersonalize);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  return (
    <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 rounded-lg w-full lg:max-w-md mx-auto">
      {/* Header */}
      <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 tracking-wide">
        {heading}
      </h2>

      {/* Profile Section */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          {/* Avatar with verification badge */}
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
              <Image
                src="/icons/profile.png"
                alt="Avatar"
                width={48}
                height={48}
              />
            </div>
            {/* Verification badge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-white border border-white/25 rounded-full flex items-center justify-center">
              <TiPencil className="text-black text-xs sm:text-sm" />
            </div>
          </div>

          {/* Profile Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm sm:text-base">
                {username}
              </span>
              <Image
                src="/icons/verified.png"
                alt="Verified"
                width={16}
                height={16}
              />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">{handle}</p>
          </div>
        </div>

        {/* Silver Badge */}
        <div className="px-2 sm:px-3 py-1 bg-primary/15 border-1 border-primary text-primary rounded-full text-xs font-medium">
          {rank}
        </div>
      </div>

      <div className="h-[1px] bg-[#313131] mb-3 -mt-3" />

      {/* Stats Section */}
      <div className="space-y-2 mb-4 sm:mb-5">
        <div className="flex justify-between items-center">
          <span className="text-white/75 text-xs sm:text-sm">{totalSales}</span>
          <span className="text-white font-semibold text-sm sm:text-base">
            $6628
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/75 text-xs sm:text-sm">
            {currentRank}
          </span>
          <span className="text-white font-semibold text-sm sm:text-base">
            {rank}
          </span>
        </div>
      </div>

      {/* Personalize Button */}
      <button className="w-full py-2 sm:py-3 border-2 border-cyan-400 text-cyan-400 rounded-full text-xs sm:text-sm font-medium hover:bg-cyan-400 hover:text-gray-900 transition-colors duration-200">
        {personalize}
      </button>
    </div>
  );
}
