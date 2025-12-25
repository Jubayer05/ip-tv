"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  const depositId = searchParams.get("depositId");
  const orderNumber = searchParams.get("orderNumber");
  const gateway = searchParams.get("gateway");
  
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5); // 5 second countdown for auto-redirect

  useEffect(() => {
    // Auto-redirect for HoodPay and other direct success redirects (no polling needed)
    if (gateway === 'hoodpay' || depositId || orderNumber) {
      setLoading(false);
      setPaymentStatus({
        orderId: depositId || orderNumber || 'N/A',
        priceAmount: searchParams.get("amount") || '0',
        priceCurrency: 'USD',
        internalStatus: 'completed',
        userCredited: true,
        creditedAmount: searchParams.get("amount") || '0',
      });
      
      // Start countdown for auto-redirect
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
    }

    if (!orderId) {
      setLoading(false);
      return;
    }

    // Poll payment status
    let pollInterval;
    let pollCount = 0;
    const MAX_POLLS = 60; // 5 minutes max (60 * 5 seconds)

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `/api/payments/nowpayments/status/${orderId}`
        );
        const data = await response.json();

        if (data.success) {
          setPaymentStatus(data.data);

          // Stop polling if payment is finalized
          if (
            ["completed", "failed", "cancelled"].includes(
              data.data.internalStatus
            )
          ) {
            clearInterval(pollInterval);
            setLoading(false);
          }
        } else {
          setError(data.error || "Failed to fetch payment status");
        }

        pollCount++;
        if (pollCount >= MAX_POLLS) {
          clearInterval(pollInterval);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error checking status:", err);
        setError("Failed to check payment status");
      }
    };

    // Initial check
    checkStatus();

    // Poll every 5 seconds
    pollInterval = setInterval(checkStatus, 5000);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderId, depositId, orderNumber, gateway, router, searchParams]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
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
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            No Order Found
          </h1>
          <p className="text-gray-400 mb-8 text-sm">
            Unable to find payment information. Please check your email or contact support.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-8 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-cyan-500/30"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-cyan-500/30">
            {loading ? (
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/20 border-t-cyan-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-cyan-500/30 rounded-full animate-pulse"></div>
                </div>
              </div>
            ) : paymentStatus?.internalStatus === "completed" ? (
              <svg
                className="w-12 h-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : paymentStatus?.internalStatus === "failed" ? (
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
            ) : (
              <svg
                className="w-12 h-12 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">
            {loading
              ? "Processing Payment..."
              : paymentStatus?.internalStatus === "completed"
              ? "Payment Completed! 🎉"
              : paymentStatus?.internalStatus === "failed"
              ? "Payment Failed"
              : "Payment Pending"}
          </h1>

          {/* Description */}
          <p className="text-gray-400 mb-8 text-sm">
            {loading
              ? "Please wait while we confirm your payment with the blockchain..."
              : paymentStatus?.internalStatus === "completed"
              ? "Your payment has been confirmed and your account has been credited."
              : paymentStatus?.internalStatus === "failed"
              ? "Your payment could not be completed. Please try again or contact support."
              : "Your payment is being processed. This may take a few minutes."}
          </p>

          {/* Payment Details */}
          {paymentStatus && (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-xl p-5 mb-8 text-left space-y-3 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                <span className="text-gray-400">Order ID</span>
                <span className="font-mono font-semibold text-cyan-400 text-xs">
                  {paymentStatus.orderId?.substring(0, 20)}...
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Amount</span>
                <span className="font-bold text-white text-lg">
                  ${paymentStatus.priceAmount} <span className="text-gray-500 text-xs font-normal">{paymentStatus.priceCurrency}</span>
                </span>
              </div>
              {paymentStatus.payCurrency && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Paid with</span>
                  <span className="font-semibold text-white">
                    {paymentStatus.actuallyPaid} <span className="text-cyan-400">{paymentStatus.payCurrency?.toUpperCase()}</span>
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Status</span>
                <span
                  className={`font-semibold px-3 py-1 rounded-full text-xs ${
                    paymentStatus.internalStatus === "completed"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : paymentStatus.internalStatus === "failed"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  }`}
                >
                  {paymentStatus.internalStatus?.toUpperCase()}
                </span>
              </div>
              {paymentStatus.userCredited && (
                <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3">
                  <span className="text-gray-400">Credited to Wallet</span>
                  <span className="font-bold text-green-400 text-lg">
                    +${paymentStatus.creditedAmount}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {!loading && paymentStatus?.internalStatus === "completed" && (
              <>
                {countdown > 0 && (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-4">
                    <p className="text-sm text-cyan-400 text-center">
                      Redirecting to home in <span className="font-bold text-xl">{countdown}</span> seconds...
                    </p>
                  </div>
                )}
                <button
                  onClick={() => router.push("/")}
                  className="block w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-cyan-500/30"
                >
                  Go to Home Now
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="block w-full bg-white/5 border border-white/10 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
                >
                  View Dashboard
                </button>
              </>
            )}

            {!loading && paymentStatus?.internalStatus !== "completed" && (
              <button
                onClick={() => router.push("/")}
                className="block w-full bg-white/5 border border-white/10 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
              >
                Return Home
              </button>
            )}
          </div>

          {loading && (
            <div className="mt-8 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-cyan-400">
                ⏳ This page will automatically update when your payment is confirmed.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Checking status every 5 seconds...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
