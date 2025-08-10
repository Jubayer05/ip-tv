"use client";
import Image from "next/image";
import { TiPencil } from "react-icons/ti";

export default function AffiliateProfile() {
  return (
    <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 rounded-lg w-full lg:max-w-md mx-auto">
      {/* Header */}
      <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 tracking-wide">
        YOUR AFFILIATE PROFILE
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
                VIP STORE
              </span>
              <Image
                src="/icons/verified.png"
                alt="Verified"
                width={16}
                height={16}
              />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">@vipstore101</p>
          </div>
        </div>

        {/* Silver Badge */}
        <div className="px-2 sm:px-3 py-1 bg-primary/15 border-1 border-primary text-primary rounded-full text-xs font-medium">
          Silver
        </div>
      </div>

      <div className="h-[1px] bg-[#313131] mb-3 -mt-3" />

      {/* Stats Section */}
      <div className="space-y-2 mb-4 sm:mb-5">
        <div className="flex justify-between items-center">
          <span className="text-white/75 text-xs sm:text-sm">
            Total Referred Sales:
          </span>
          <span className="text-white font-semibold text-sm sm:text-base">
            $6628
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/75 text-xs sm:text-sm">
            Current Rank:
          </span>
          <span className="text-white font-semibold text-sm sm:text-base">
            Silver
          </span>
        </div>
      </div>

      {/* Personalize Button */}
      <button className="w-full py-2 sm:py-3 border-2 border-cyan-400 text-cyan-400 rounded-full text-xs sm:text-sm font-medium hover:bg-cyan-400 hover:text-gray-900 transition-colors duration-200">
        Personalize your profile
      </button>
    </div>
  );
}
