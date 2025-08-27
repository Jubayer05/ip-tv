"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function ReferralLink() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Prefer referral code if present; fallback to username
  const referralCode = user?.referral?.code || "";
  const username = user?.profile?.username || "";
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const referralLink = useMemo(() => {
    const id = referralCode || username;
    if (!id) return "";
    return `${baseUrl}/register?ref=${encodeURIComponent(id)}`;
  }, [baseUrl, referralCode, username]);

  const ORIGINAL_HEADING = "YOUR UNIQUE REFERRAL LINK";
  const ORIGINAL_SUBTITLE =
    "Share this with your friends and earn rewards when they subscribe.";
  const ORIGINAL_BENEFIT_1 = "Earn commissions on every referred order.";
  const ORIGINAL_BENEFIT_2 =
    "Get exclusive coupons & discounts as your referrals grow.";
  const ORIGINAL_BENEFIT_3 = "Track your performance in real-time below.";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [subtitle, setSubtitle] = useState(ORIGINAL_SUBTITLE);
  const [benefit1, setBenefit1] = useState(ORIGINAL_BENEFIT_1);
  const [benefit2, setBenefit2] = useState(ORIGINAL_BENEFIT_2);
  const [benefit3, setBenefit3] = useState(ORIGINAL_BENEFIT_3);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_HEADING,
        ORIGINAL_SUBTITLE,
        ORIGINAL_BENEFIT_1,
        ORIGINAL_BENEFIT_2,
        ORIGINAL_BENEFIT_3,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [tHeading, tSubtitle, tBenefit1, tBenefit2, tBenefit3] = translated;

      setHeading(tHeading);
      setSubtitle(tSubtitle);
      setBenefit1(tBenefit1);
      setBenefit2(tBenefit2);
      setBenefit3(tBenefit3);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const handleCopy = async () => {
    try {
      if (!referralLink) return;
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const openLink = () => {
    if (!referralLink) return;
    window.open(referralLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-black w-full border border-[#212121] text-white p-4 sm:p-6 md:p-8 rounded-lg mx-auto mt-10 md:mt-0">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-2 tracking-wide">
          {heading}
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm">{subtitle}</p>
      </div>

      {/* User/Code Summary */}
      <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Username:</span>
          <span className="text-white font-medium">{username || "-"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Referral Code:</span>
          <span className="text-white font-medium">
            {referralCode || username || "-"}
          </span>
        </div>
      </div>

      {/* Referral Link Input */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center bg-[#0c171c] rounded-lg border border-white/15">
          <input
            type="text"
            value={referralLink}
            readOnly
            placeholder="Your referral link will appear here"
            className="flex-1 bg-transparent text-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none"
          />
          <button
            onClick={openLink}
            className="p-2 sm:p-3 hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
            aria-label="Open referral link"
          >
            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 sm:p-3 hover:bg-gray-700 rounded-r-lg transition-colors duration-200 cursor-pointer"
            aria-label="Copy referral link"
          >
            {copied ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Benefits List */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5" />
          <p className="text-gray-300 text-xs sm:text-sm">{benefit1}</p>
        </div>

        <div className="flex items-start gap-2 sm:gap-3">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5" />
          <p className="text-gray-300 text-xs sm:text-sm">{benefit2}</p>
        </div>

        <div className="flex items-start gap-2 sm:gap-3">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5" />
          <p className="text-gray-300 text-xs sm:text-sm">{benefit3}</p>
        </div>
      </div>
    </div>
  );
}
