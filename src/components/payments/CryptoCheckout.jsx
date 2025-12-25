"use client";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function CryptoCheckout({ paymentData, onComplete, onCancel }) {
  const {
    walletAddress,
    amount,
    network,
    coin,
    ipnToken,
    expiresAt,
    depositId,
  } = paymentData;

  const [timeLeft, setTimeLeft] = useState(null);
  const [copied, setCopied] = useState({ address: false, amount: false });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    console.log("🔐 CryptoCheckout mounted:", {
      network,
      coin,
      amount,
      depositId,
    });

    // Countdown timer
    const timerInterval = setInterval(() => {
      const remaining = new Date(expiresAt) - new Date();
      setTimeLeft(remaining > 0 ? remaining : 0);

      if (remaining <= 0) {
        clearInterval(timerInterval);
      }
    }, 1000);

    // Poll payment status every 10 seconds
    const statusPoll = setInterval(async () => {
      try {
        setChecking(true);
        console.log(`🔍 Checking payment status for IPN: ${ipnToken?.substring(0, 10)}...`);

        const res = await fetch(`/api/payments/paygate/status/${ipnToken}`);
        const data = await res.json();

        console.log("📊 Status response:", data);

        if (data.success && data.status === "paid") {
          console.log("✅ Payment confirmed!");
          clearInterval(statusPoll);
          clearInterval(timerInterval);
          onComplete?.(data);
        }
      } catch (error) {
        console.error("❌ Status check error:", error);
      } finally {
        setChecking(false);
      }
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(timerInterval);
      clearInterval(statusPoll);
    };
  }, [ipnToken, expiresAt, onComplete]);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [type]: true });
      setTimeout(() => {
        setCopied({ ...copied, [type]: false });
      }, 2000);
      console.log(`📋 Copied ${type}:`, text);
    } catch (error) {
      console.error("❌ Copy failed:", error);
    }
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getNetworkIcon = (network) => {
    const icons = {
      tron: "⚡",
      ethereum: "💎",
      polygon: "🔷",
      bitcoin: "₿",
    };
    return icons[network.toLowerCase()] || "🔗";
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Network Badge */}
      <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
        <span className="text-2xl">{getNetworkIcon(network)}</span>
        <span className="text-lg font-semibold text-white">
          {network.toUpperCase()} Network
        </span>
      </div>

      {/* QR Code Section */}
      <div className="bg-white p-6 rounded-xl mb-6 flex flex-col items-center">
        <QRCodeSVG
          value={walletAddress}
          size={220}
          level="H"
          className="mb-4"
          includeMargin={true}
        />
        <p className="text-gray-700 font-medium">
          Scan to pay with {coin.toUpperCase()}
        </p>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 space-y-4 mb-6 border border-gray-700">
        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 font-medium">Amount to Send:</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-400">
              {amount} {coin.toUpperCase()}
            </span>
            <button
              onClick={() => copyToClipboard(amount.toString(), "amount")}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Copy amount"
              aria-label="Copy amount to clipboard"
            >
              {copied.amount ? (
                <span className="text-green-400">✓</span>
              ) : (
                <span className="text-gray-400">📋</span>
              )}
            </button>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="flex items-start justify-between gap-4">
          <span className="text-gray-400 font-medium whitespace-nowrap">
            Wallet Address:
          </span>
          <div className="flex items-center gap-2 flex-1">
            <code className="text-sm text-blue-400 bg-gray-900/50 px-3 py-2 rounded flex-1 break-all">
              {walletAddress}
            </code>
            <button
              onClick={() => copyToClipboard(walletAddress, "address")}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors shrink-0"
              title="Copy address"
              aria-label="Copy wallet address to clipboard"
            >
              {copied.address ? (
                <span className="text-green-400 text-xl">✓</span>
              ) : (
                <span className="text-gray-400 text-xl">📋</span>
              )}
            </button>
          </div>
        </div>

        {/* Network */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 font-medium">Network:</span>
          <span className="text-white font-semibold">
            {network.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Timer Section */}
      {timeLeft > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 flex items-center justify-center gap-3">
          <span className="text-2xl">⏱️</span>
          <span className="text-lg font-semibold text-orange-300">
            Time remaining: {formatTime(timeLeft)}
          </span>
        </div>
      )}

      {/* Checking Status Indicator */}
      {checking && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-6 flex items-center justify-center gap-2">
          <div className="animate-spin text-xl">🔄</div>
          <span className="text-blue-300">Checking payment status...</span>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-800/30 rounded-xl p-6 mb-6 border border-gray-700">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>📌</span>
          <span>Payment Instructions</span>
        </h4>
        <ol className="space-y-3 text-gray-300">
          <li className="flex gap-3">
            <span className="text-green-400 font-bold">1.</span>
            <span>
              Send <strong className="text-white">{amount} {coin.toUpperCase()}</strong> to
              the wallet address above
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-400 font-bold">2.</span>
            <span>
              Make sure you&apos;re using the{" "}
              <strong className="text-white">{network.toUpperCase()}</strong> network
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-400 font-bold">3.</span>
            <span>
              Wait for blockchain confirmation (usually 1-5 minutes)
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-400 font-bold">4.</span>
            <span>Your balance will be credited automatically</span>
          </li>
        </ol>
      </div>

      {/* Warning Box */}
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="text-red-300 font-medium">
              <strong>Important:</strong> Only send{" "}
              <strong>{coin.toUpperCase()}</strong> on{" "}
              <strong>{network.toUpperCase()}</strong> network.
            </p>
            <p className="text-red-400 text-sm mt-1">
              Sending other coins or using the wrong network will result in
              permanent loss of funds!
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to cancel? Your payment will not be processed."
              )
            ) {
              onCancel?.();
            }
          }}
          className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
        >
          Cancel Payment
        </button>
        <button
          onClick={async () => {
            setChecking(true);
            try {
              const res = await fetch(`/api/payments/paygate/status/${ipnToken}`);
              const data = await res.json();
              if (data.success && data.status === "paid") {
                onComplete?.(data);
              } else {
                alert(
                  "Payment not yet confirmed. Please wait a few more minutes."
                );
              }
            } catch (error) {
              console.error(error);
              alert("Failed to check status. Please try again.");
            } finally {
              setChecking(false);
            }
          }}
          disabled={checking}
          className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
        >
          {checking ? "Checking..." : "Sent Payment"}
        </button>
      </div>

      {/* Already Sent Message */}
      <p className="text-center text-gray-400 text-sm mt-4">
        If you&apos;ve already sent the payment, please wait for blockchain
        confirmation. The page will update automatically.
      </p>
    </div>
  );
}
