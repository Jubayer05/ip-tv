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
    <div className="bg-black w-full border border-[#212121] text-white p-8 rounded-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 tracking-wide">
          YOUR UNIQUE REFERRAL LINK
        </h2>
        <p className="text-gray-300 text-sm">
          Share this with your friends and earn rewards when they subscribe.
        </p>
      </div>

      {/* Referral Link Input */}
      <div className="mb-8">
        <div className="flex items-center bg-[#0c171c] rounded-lg border border-white/15">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-transparent text-gray-300 px-4 py-3 text-sm focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="p-3 hover:bg-gray-700 rounded-r-lg transition-colors duration-200 cursor-pointer"
            aria-label="Copy referral link"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Benefits List */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-400" />
          <p className="text-gray-300 text-sm">
            Earn commissions on every referred order.
          </p>
        </div>

        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-400" />
          <p className="text-gray-300 text-sm">
            Get exclusive coupons & discounts as your referrals grow.
          </p>
        </div>

        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-400" />
          <p className="text-gray-300 text-sm">
            Track your performance in real-time below.
          </p>
        </div>
      </div>
    </div>
  );
}
