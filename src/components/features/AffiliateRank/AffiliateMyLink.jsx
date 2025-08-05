"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function ReferralLink() {
  const [copied, setCopied] = useState(false);
  const referralLink = "cheapstream.com/username.com";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="bg-black w-full border border-[#212121] text-white p-4 sm:p-6 md:p-8 rounded-lg mx-auto mt-10 md:mt-0">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-2 tracking-wide">
          YOUR UNIQUE REFERRAL LINK
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm">
          Share this with your friends and earn rewards when they subscribe.
        </p>
      </div>

      {/* Referral Link Input */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center bg-[#0c171c] rounded-lg border border-white/15">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-transparent text-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none"
          />
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
          <p className="text-gray-300 text-xs sm:text-sm">
            Earn commissions on every referred order.
          </p>
        </div>

        <div className="flex items-start gap-2 sm:gap-3">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5" />
          <p className="text-gray-300 text-xs sm:text-sm">
            Get exclusive coupons & discounts as your referrals grow.
          </p>
        </div>

        <div className="flex items-start gap-2 sm:gap-3">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5" />
          <p className="text-gray-300 text-xs sm:text-sm">
            Track your performance in real-time below.
          </p>
        </div>
      </div>
    </div>
  );
}
