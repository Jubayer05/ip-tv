"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserSpending } from "@/contexts/UserSpendingContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TiPencil } from "react-icons/ti";

export default function AffiliateProfile() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user } = useAuth();
  const {
    currentRank,
    loading: spendingLoading,
    error: spendingError,
  } = useUserSpending();

  // Referral stats state
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalReferredSales: 0,
    loading: true,
    error: null,
  });

  const ORIGINAL_HEADING = "YOUR AFFILIATE PROFILE";
  const ORIGINAL_USERNAME = "VIP STORE";
  const ORIGINAL_HANDLE = "@vipstore101";
  const ORIGINAL_RANK = "Silver";
  const ORIGINAL_TOTAL_SALES = "Total Referred Sales:";
  const ORIGINAL_TOTAL_REFERRALS = "Total Referrals:";
  const ORIGINAL_CURRENT_RANK = "Current Rank:";
  const ORIGINAL_PERSONALIZE = "Personalize your profile";
  const ORIGINAL_LOADING = "Loading profile...";
  const ORIGINAL_ERROR = "Failed to load profile";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [username, setUsername] = useState(ORIGINAL_USERNAME);
  const [handle, setHandle] = useState(ORIGINAL_HANDLE);
  const [rank, setRank] = useState(ORIGINAL_RANK);
  const [totalSales, setTotalSales] = useState(ORIGINAL_TOTAL_SALES);
  const [totalReferrals, setTotalReferrals] = useState(
    ORIGINAL_TOTAL_REFERRALS
  );
  const [currentRankText, setCurrentRankText] = useState(ORIGINAL_CURRENT_RANK);
  const [personalize, setPersonalize] = useState(ORIGINAL_PERSONALIZE);
  const [loading, setLoading] = useState(ORIGINAL_LOADING);
  const [error, setError] = useState(ORIGINAL_ERROR);

  // Fetch referral stats
  useEffect(() => {
    if (!user?._id) return;

    const fetchReferralStats = async () => {
      try {
        setReferralStats((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetch(`/api/users/${user._id}/referrals`);
        const data = await response.json();

        if (response.ok && data.success) {
          // Calculate total sales amount from all referred orders
          const totalSalesAmount = data.data.referrals.reduce(
            (sum, referral) => {
              // Sum up the actual order amounts, not just earnings
              return sum + (referral.orderTotal || 0);
            },
            0
          );

          setReferralStats({
            totalReferrals: data.data.totalReferrals || 0,
            totalReferredSales: totalSalesAmount, // Total sales amount, not commission
            loading: false,
            error: null,
          });
        } else {
          setReferralStats({
            totalReferrals: 0,
            totalReferredSales: 0,
            loading: false,
            error: data.error || "Failed to fetch referral stats",
          });
        }
      } catch (err) {
        setReferralStats({
          totalReferrals: 0,
          totalReferredSales: 0,
          loading: false,
          error: "Network error",
        });
      }
    };

    fetchReferralStats();
  }, [user?._id]);

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
        ORIGINAL_TOTAL_REFERRALS,
        ORIGINAL_CURRENT_RANK,
        ORIGINAL_PERSONALIZE,
        ORIGINAL_LOADING,
        ORIGINAL_ERROR,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tHeading,
        tUsername,
        tHandle,
        tRank,
        tTotalSales,
        tTotalReferrals,
        tCurrentRank,
        tPersonalize,
        tLoading,
        tError,
      ] = translated;

      setHeading(tHeading);
      setUsername(tUsername);
      setHandle(tHandle);
      setRank(tRank);
      setTotalSales(tTotalSales);
      setTotalReferrals(tTotalReferrals);
      setCurrentRankText(tCurrentRank);
      setPersonalize(tPersonalize);
      setLoading(tLoading);
      setError(tError);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  // Show loading state
  if (spendingLoading || referralStats.loading) {
    return (
      <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 rounded-lg w-full lg:max-w-md mx-auto">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <div className="text-gray-400 text-sm">{loading}</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (spendingError || referralStats.error) {
    return (
      <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 rounded-lg w-full lg:max-w-md mx-auto">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-red-400 text-sm mb-2">{error}</div>
            <div className="text-gray-500 text-xs">
              {spendingError || referralStats.error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get current rank name or default to "Bronze"
  const currentRankName = currentRank?.name || "Bronze";
  const currentRankColor =
    currentRank?.name === "Gold"
      ? "bg-yellow-500/15 border-yellow-500 text-yellow-400"
      : currentRank?.name === "Silver"
      ? "bg-gray-400/15 border-gray-400 text-gray-300"
      : "bg-primary/15 border-primary text-primary";

  // Use real user data
  const displayUsername =
    user?.profile?.username || user?.profile?.firstName || "User";
  const displayHandle = user?.profile?.username
    ? `@${user.profile.username}`
    : "@user";

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
                {displayUsername}
              </span>
              <Image
                src="/icons/verified.png"
                alt="Verified"
                width={16}
                height={16}
              />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">{displayHandle}</p>
          </div>
        </div>

        {/* Dynamic Rank Badge */}
        <div
          className={`px-2 sm:px-3 py-1 ${currentRankColor} rounded-full text-xs font-medium border`}
        >
          {currentRankName}
        </div>
      </div>

      <div className="h-[1px] bg-[#313131] mb-3 -mt-3" />

      {/* Stats Section */}
      <div className="space-y-2 mb-4 sm:mb-5">
        <div className="flex justify-between items-center">
          <span className="text-white/75 text-xs sm:text-sm">{totalSales}</span>
          <span className="text-white font-semibold text-sm sm:text-base">
            ${referralStats.totalReferredSales.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/75 text-xs sm:text-sm">
            {totalReferrals}
          </span>
          <span className="text-white font-semibold text-sm sm:text-base">
            {referralStats.totalReferrals}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/75 text-xs sm:text-sm">
            {currentRankText}
          </span>
          <span className="text-white font-semibold text-sm sm:text-base">
            {currentRankName}
          </span>
        </div>
      </div>

      {/* Personalize Button */}
      <Link href="/dashboard/settings">
        <button className="w-full py-2 sm:py-3 border-2 border-cyan-400 text-cyan-400 rounded-full text-xs sm:text-sm font-medium hover:bg-cyan-400 hover:text-gray-900 transition-colors duration-200">
          {personalize}
        </button>
      </Link>
    </div>
  );
}
