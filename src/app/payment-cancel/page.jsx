"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  const depositId = searchParams.get("depositId");
  const orderNumber = searchParams.get("orderNumber");
  const [countdown, setCountdown] = useState(10); // 10 seconds for cancel page

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          {/* Cancel Icon */}
          <div className="mx-auto w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            Payment Cancelled
          </h1>

          <p className="text-gray-400 mb-8 text-sm">
            Your payment was cancelled. No charges were made to your account.
          </p>

          {/* Countdown notice */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-400 text-center">
              Redirecting to home in <span className="font-bold text-xl">{countdown}</span> seconds...
            </p>
          </div>

          {(orderId || depositId || orderNumber) && (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-xl p-5 mb-8 backdrop-blur-sm">
              <p className="text-sm text-gray-400 mb-2">Order Number</p>
              <p className="text-lg font-mono font-semibold text-cyan-400 break-all">
                {orderId || depositId || orderNumber}
              </p>
              <p className="text-xs text-gray-500 mt-3">
                This order has been cancelled and can be retried anytime.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push("/")}
              className="block w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-cyan-500/30"
            >
              Return to Home Now
            </button>

            <button
              onClick={() => router.push("/dashboard/wallet")}
              className="block w-full bg-white/5 border border-white/10 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
            >
              Try Again
            </button>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Need help? <span className="text-cyan-400 cursor-pointer hover:underline" onClick={() => router.push("/support")}>Contact our support team</span>
          </p>
        </div>
      </div>
    </div>
  );
}
