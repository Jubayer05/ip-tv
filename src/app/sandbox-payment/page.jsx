"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SandboxPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const depositId = searchParams.get("depositId");
  const amount = searchParams.get("amount");
  const currency = searchParams.get("currency") || "USD";

  useEffect(() => {
    // Warn if not in sandbox mode
    if (process.env.NEXT_PUBLIC_NOWPAYMENTS_SANDBOX_MODE !== "true") {
      console.warn("⚠️ Sandbox payment page accessed but sandbox mode is not enabled");
    }
  }, []);

  const handlePaymentSimulation = async (status) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sandbox/complete-deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          depositId,
          status, // "completed" or "failed"
          amount,
          currency,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to simulate payment");
      }

      console.log("✅ Payment simulation completed:", result);

      // Redirect based on status
      if (status === "completed") {
        router.push("/dashboard/wallet?deposit=success");
      } else {
        router.push("/dashboard/wallet?deposit=failed");
      }
    } catch (err) {
      console.error("❌ Payment simulation error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!depositId || !amount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2">Invalid Payment Link</h1>
            <p className="text-gray-300 mb-6">Missing required payment parameters</p>
            <button
              onClick={() => router.push("/dashboard/wallet")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Sandbox Payment Simulator
          </h1>
          <p className="text-gray-300">
            This is a test environment. No real payment will be processed.
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Payment Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Deposit ID:</span>
              <span className="text-white font-mono text-sm">{depositId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Amount:</span>
              <span className="text-white font-semibold text-xl">
                {currency} {parseFloat(amount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Payment Gateway:</span>
              <span className="text-white">NOWPayments (Sandbox)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Payment Method:</span>
              <span className="text-white">Cryptocurrency</span>
            </div>
          </div>
        </div>

        {/* Simulation Buttons */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">
            Simulate Payment Outcome
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={() => handlePaymentSimulation("completed")}
            disabled={loading}
            className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 
                     text-white font-semibold rounded-xl transition-all duration-200
                     flex items-center justify-center gap-3 shadow-lg hover:shadow-green-500/50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">✅</span>
                <span>Simulate Successful Payment</span>
              </>
            )}
          </button>

          <button
            onClick={() => handlePaymentSimulation("failed")}
            disabled={loading}
            className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-600
                     text-white font-semibold rounded-xl transition-all duration-200
                     flex items-center justify-center gap-3 shadow-lg hover:shadow-red-500/50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">❌</span>
                <span>Simulate Failed Payment</span>
              </>
            )}
          </button>

          <button
            onClick={() => router.push("/dashboard/wallet?deposit=cancelled")}
            disabled={loading}
            className="w-full py-4 px-6 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800
                     text-white font-semibold rounded-xl transition-all duration-200
                     flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🚫</span>
            <span>Cancel Payment</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-300 mb-2">
            💡 Testing Instructions
          </h3>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>Click "Simulate Successful Payment" to test a successful deposit</li>
            <li>Click "Simulate Failed Payment" to test a failed deposit</li>
            <li>Your wallet balance will be updated accordingly</li>
            <li>Check the database to verify WalletDeposit records</li>
          </ul>
        </div>

        {/* Production Warning */}
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-300 mb-2">
            ⚠️ Sandbox Mode Active
          </h3>
          <p className="text-sm text-gray-300">
            To switch to production mode, set <code className="bg-black/30 px-2 py-1 rounded">NOWPAYMENTS_SANDBOX_MODE=false</code> in your .env.local file and add your real NOWPayments API key.
          </p>
        </div>
      </div>
    </div>
  );
}
