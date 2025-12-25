"use client";
import Button from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  Home,
  Loader2,
  Package,
  RefreshCw,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Payment provider configuration
const PAYMENT_PROVIDERS = {
  changenow: {
    name: "ChangeNOW",
    statusEndpoint: (id) => `/api/payments/changenow/status/${id}`,
    logo: "/payment_logo/changenow.png",
  },
  cryptomus: {
    name: "Cryptomus",
    statusEndpoint: (id) => `/api/payments/cryptomus/status/${id}`,
    logo: "/payment_logo/cryptomus.png",
  },
  plisio: {
    name: "Plisio",
    statusEndpoint: (id) => `/api/payments/plisio/status/${id}`,
    logo: "/payment_logo/plisio.png",
  },
  nowpayments: {
    name: "NOWPayments",
    statusEndpoint: (id) => `/api/payments/nowpayment/status/${id}`,
    logo: "/payment_logo/now_payments.png",
  },
  nowpayment: {
    name: "NOWPayments",
    statusEndpoint: (id) => `/api/payments/nowpayment/status/${id}`,
    logo: "/payment_logo/now_payments.png",
  },
  hoodpay: {
    name: "HoodPay",
    statusEndpoint: (id) => `/api/payments/hoodpay/status/${id}`,
    logo: "/payment_logo/hoodpay.jpeg",
  },
  paygate: {
    name: "PayGate",
    statusEndpoint: (id) => `/api/payments/paygate/status/${id}`,
    logo: "/payment_logo/paygate.png",
  },
  volet: {
    name: "Volet",
    statusEndpoint: (id) => `/api/payments/volet/status/${id}`,
    logo: "/payment_logo/volet.png",
  },
  stripe: {
    name: "Stripe",
    statusEndpoint: (id) => `/api/payments/stripe/status/${id}`,
    logo: "/payment_logo/stripe.png",
  },
};

// Status configurations
const STATUS_CONFIG = {
  // Success states
  completed: {
    color: "green",
    icon: CheckCircle,
    title: "Payment Successful!",
    description: "Your payment has been confirmed and processed",
    redirect: true,
    redirectPath: "/payment-status/success",
  },
  finished: {
    color: "green",
    icon: CheckCircle,
    title: "Payment Completed",
    description: "Transaction completed successfully",
    redirect: true,
    redirectPath: "/payment-status/success",
  },
  confirmed: {
    color: "green",
    icon: CheckCircle,
    title: "Payment Confirmed",
    description: "Payment has been confirmed",
    redirect: true,
    redirectPath: "/payment-status/success",
  },

  // Processing states
  pending: {
    color: "yellow",
    icon: Clock,
    title: "Payment Pending",
    description: "Waiting for your payment...",
    polling: true,
  },
  waiting: {
    color: "yellow",
    icon: Clock,
    title: "Awaiting Payment",
    description: "Please complete your payment",
    polling: true,
  },
  confirming: {
    color: "blue",
    icon: Loader2,
    title: "Confirming Payment",
    description: "Your payment is being confirmed on the blockchain",
    polling: true,
    animate: "spin",
  },
  exchanging: {
    color: "blue",
    icon: RefreshCw,
    title: "Processing Exchange",
    description: "Converting your cryptocurrency",
    polling: true,
    animate: "spin",
  },
  sending: {
    color: "blue",
    icon: Loader2,
    title: "Sending Funds",
    description: "Finalizing transaction",
    polling: true,
    animate: "spin",
  },
  partially_paid: {
    color: "orange",
    icon: AlertTriangle,
    title: "Partially Paid",
    description: "Payment received but incomplete",
    polling: true,
  },

  // Failed states
  failed: {
    color: "red",
    icon: XCircle,
    title: "Payment Failed",
    description: "Transaction could not be completed",
    redirect: true,
    redirectPath: "/payment-status/failed",
  },
  cancelled: {
    color: "red",
    icon: XCircle,
    title: "Payment Cancelled",
    description: "Transaction was cancelled",
    redirect: true,
    redirectPath: "/payment-status/failed",
  },
  expired: {
    color: "red",
    icon: AlertTriangle,
    title: "Payment Expired",
    description: "Payment time has expired",
    redirect: true,
    redirectPath: "/payment-status/failed",
  },
  error: {
    color: "red",
    icon: XCircle,
    title: "Payment Error",
    description: "An error occurred during payment",
    redirect: true,
    redirectPath: "/payment-status/failed",
  },
};

export default function PaymentStatusPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { translate, isLanguageLoaded, language } = useLanguage();

  // Get provider from URL parameter or detect from transaction
  const providerParam = searchParams.get("provider")?.toLowerCase();
  const urlStatus = searchParams.get("status")?.toLowerCase(); // Get status from URL

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(providerParam);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Fetch payment status
  const fetchStatus = async () => {
    try {
      if (!params.id) {
        setError("Transaction ID is missing");
        setLoading(false);
        return;
      }

      // If provider not specified, try to detect it by checking each endpoint
      if (!provider) {
        await detectProvider();
        return;
      }

      const providerConfig = PAYMENT_PROVIDERS[provider];
      if (!providerConfig) {
        setError("Invalid payment provider");
        setLoading(false);
        return;
      }


      const res = await fetch(providerConfig.statusEndpoint(params.id));
      const data = await res.json();


      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch status");
      }

      // If URL says success, override the API status if it's still pending
      if (urlStatus === 'success') {
        // Override the status to completed if URL says success
        if (data.status === 'pending' || data.status === 'waiting' || data.status === 'new') {
          data.status = 'completed';
          if (data.payment) {
            data.payment.status = 'completed';
            data.payment.internalStatus = 'completed';
          }
        }
      }

      setStatus(data);
      setError(null);
    } catch (error) {
      console.error("❌ Error fetching status:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Detect payment provider by trying each endpoint
  const detectProvider = async () => {
    for (const [key, config] of Object.entries(PAYMENT_PROVIDERS)) {
      try {
        const res = await fetch(config.statusEndpoint(params.id));
        if (res.ok) {
          setProvider(key);
          return;
        }
      } catch (e) {
        // Continue to next provider
      }
    }
    setError("Transaction not found");
    setLoading(false);
  };

  // Initial fetch and polling
  useEffect(() => {
    if (params.id) {
      fetchStatus();

      // Poll every 10 seconds for processing states
      const interval = setInterval(() => {
        if (status) {
          const paymentStatus = status.status || status.payment?.status || status.payment?.internalStatus || 'pending';
          const statusConfig = STATUS_CONFIG[paymentStatus];
          if (statusConfig?.polling) {
            fetchStatus();
          }
        }
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(interval);
    }
  }, [params.id, provider]);

  // Auto-redirect logic for ALL payment providers
  useEffect(() => {
    if (!status) return;

    const finalStatus = status.status || status.payment?.status || status.payment?.internalStatus || "pending";
    const paymentType = searchParams.get("type") || status.type || "subscription";

    console.log("🔍 Payment status check:", { finalStatus, paymentType, provider });

    // Auto-redirect on success
    if (finalStatus === "completed" || finalStatus === "finished" || finalStatus === "paid") {
      console.log("✅ Payment successful! Starting redirect countdown...");
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Redirect based on payment type
            if (paymentType === "deposit") {
              console.log("🔄 Redirecting to wallet...");
              window.location.href = "/dashboard/wallet";
            } else {
              console.log("🔄 Redirecting to orders...");
              window.location.href = "/dashboard/orders";
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }

    // Auto-redirect on failure/cancellation
    if (finalStatus === "failed" || finalStatus === "cancelled" || finalStatus === "expired") {
      console.log(`❌ Payment ${finalStatus}! Starting redirect countdown...`);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            console.log("🔄 Redirecting to packages...");
            window.location.href = "/packages";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, searchParams, provider]);

  // Helper function to get display amount
  const getDisplayAmount = (status) => {
    if (!status) return "Calculating...";
    
    // Try different property paths
    const amount = status.amount || 
                   status.payment?.priceAmount || 
                   status.payment?.amount ||
                   status.priceAmount;
    
    const currency = (status.currency || 
                     status.payment?.priceCurrency || 
                     status.payment?.currency ||
                     status.priceCurrency || 
                     "USD").toUpperCase();
    
    if (!amount || amount === 0) {
      return "Processing...";
    }
    
    return `${Number(amount).toFixed(2)} ${currency}`;
  };

  // Helper function to get display status
  const getDisplayStatus = (status) => {
    if (!status) return "pending";
    
    // Try different property paths
    return status.status || 
           status.payment?.internalStatus || 
           status.payment?.paymentStatus || 
           status.paymentStatus ||
           "pending";
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading payment status...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/packages")}
              className="flex-1 bg-yellow-600 hover:bg-yellow-500"
            >
              Back to Packages
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-800 hover:bg-gray-700"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get status configuration
  const currentStatus = getDisplayStatus(status);
  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const providerConfig = PAYMENT_PROVIDERS[provider];

  return (
    <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 bg-${statusConfig.color}-500/10 rounded-full blur-3xl`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 bg-${statusConfig.color}-500/10 rounded-full blur-3xl`}
        ></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className={`absolute inset-0 bg-${statusConfig.color}-500/20 rounded-full blur-xl animate-pulse`}
            ></div>
            <div
              className={`relative bg-gradient-to-br from-${statusConfig.color}-500 to-${statusConfig.color}-600 rounded-full p-6`}
            >
              <StatusIcon
                className={`w-16 h-16 text-white ${
                  statusConfig.animate ? `animate-${statusConfig.animate}` : ""
                }`}
                strokeWidth={2.5}
              />
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className={`bg-gradient-to-r from-${statusConfig.color}-600/20 to-${statusConfig.color}-500/10 border-b border-${statusConfig.color}-500/20 p-6 sm:p-8`}
          >
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {statusConfig.title}
              </h1>
              {providerConfig && (
                <img
                  src={providerConfig.logo}
                  alt={providerConfig.name}
                  className="h-10 object-contain"
                />
              )}
            </div>
            <p className={`text-${statusConfig.color}-400 text-lg`}>
              {statusConfig.description}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Transaction Details */}
            <div className="bg-black/30 rounded-xl p-6 mb-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-yellow-500" />
                Transaction Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem label="Transaction ID" value={params.id} copyable />
                <InfoItem
                  label="Status"
                  value={currentStatus}
                  badge
                  statusConfig={statusConfig}
                />
                <InfoItem
                  label="Amount"
                  value={getDisplayAmount(status)}
                />
                {status.orderId && (
                  <InfoItem label="Order ID" value={status.orderId} />
                )}
              </div>
            </div>

            {/* Provider-specific payment information */}
            {renderPaymentInfo(status, provider, copyToClipboard, copied)}

            {/* Redirect countdown for ALL providers */}
            {(currentStatus === "completed" || 
              currentStatus === "finished" || 
              currentStatus === "paid" ||
              currentStatus === "failed" ||
              currentStatus === "cancelled" ||
              currentStatus === "expired") && (
              <div className={`${
                currentStatus === "completed" || currentStatus === "finished" || currentStatus === "paid"
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-red-500/10 border-red-500/20"
              } border rounded-xl p-4 mb-6 text-center`}>
                <p className={`${
                  currentStatus === "completed" || currentStatus === "finished" || currentStatus === "paid"
                    ? "text-green-400"
                    : "text-red-400"
                }`}>
                  {currentStatus === "completed" || currentStatus === "finished" || currentStatus === "paid" ? (
                    <>
                      ✅ Payment successful! Redirecting to{" "}
                      {searchParams.get("type") === "deposit" ? "wallet" : "orders"} in{" "}
                      <span className="font-bold text-white">{countdown}</span> second{countdown !== 1 ? "s" : ""}...
                    </>
                  ) : (
                    <>
                      ❌ Payment {currentStatus}! Redirecting to packages in{" "}
                      <span className="font-bold text-white">{countdown}</span> second{countdown !== 1 ? "s" : ""}...
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Show different buttons based on status */}
              {currentStatus === "completed" || currentStatus === "finished" || currentStatus === "paid" ? (
                <>
                  <Button
                    onClick={() => {
                      const type = searchParams.get("type") || status.type || "subscription";
                      window.location.href = type === "deposit" ? "/dashboard/wallet" : "/dashboard/orders";
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-5 h-5" />
                    Go to {searchParams.get("type") === "deposit" ? "Wallet" : "Orders"}
                  </Button>
                  <Button
                    onClick={() => window.location.href = "/"}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Back to Home
                  </Button>
                </>
              ) : currentStatus === "failed" || currentStatus === "cancelled" || currentStatus === "expired" ? (
                <>
                  <Button
                    onClick={() => window.location.href = "/packages"}
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </Button>
                  <Button
                    onClick={() => window.location.href = "/"}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Back to Home
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={fetchStatus}
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Refresh Status
                  </Button>
                  <Link
                    href="/dashboard"
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-gray-700"
                  >
                    <Home className="w-5 h-5" />
                    Go to Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>
            Need help? Contact us at{" "}
            <span className="text-yellow-500">help@cheapstream.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper component for info items
function InfoItem({ label, value, copyable, badge, statusConfig }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {badge ? (
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400 border border-${statusConfig.color}-500/30`}
          >
            {value}
          </span>
        ) : (
          <p className="text-white font-semibold break-all">{value}</p>
        )}
        {copyable && (
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Render provider-specific payment information
function renderPaymentInfo(status, provider, copyToClipboard, copied) {
  if (!status) return null;

  switch (provider) {
    case "changenow":
      return (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-500" />
            Payment Instructions
          </h3>
          {status.payinAddress && (
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm mb-1">Send To Address:</p>
                <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg">
                  <code className="text-white flex-1 break-all text-sm">
                    {status.payinAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(status.payinAddress)}
                    className="text-yellow-500 hover:text-yellow-400"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-sm">Send Amount:</p>
                  <p className="text-white font-semibold">
                    {status.fromAmount} {status.fromCurrency?.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">You'll Receive:</p>
                  <p className="text-white font-semibold">
                    {status.toAmount} {status.toCurrency?.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case "cryptomus":
      return (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            Payment Information
          </h3>
          {status.address && (
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm mb-1">
                  Payment Address ({status.network}):
                </p>
                <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg">
                  <code className="text-white flex-1 break-all text-sm">
                    {status.address}
                  </code>
                  <button
                    onClick={() => copyToClipboard(status.address)}
                    className="text-yellow-500 hover:text-yellow-400"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              {status.transactions && status.transactions.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Transactions:</p>
                  {status.transactions.map((tx, idx) => (
                    <div
                      key={idx}
                      className="bg-black/30 p-2 rounded text-xs text-gray-300 mb-1"
                    >
                      <span className="text-yellow-500">{tx.status}</span> -{" "}
                      {tx.txid}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );

    case "plisio":
    case "volet":
    case "hoodpay":
      return (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Payment Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {status.walletAddress && (
              <div className="col-span-2">
                <p className="text-gray-400 text-sm mb-1">Wallet Address:</p>
                <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg">
                  <code className="text-white flex-1 break-all text-sm">
                    {status.walletAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(status.walletAddress)}
                    className="text-yellow-500"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {status.confirmations !== undefined && (
              <div>
                <p className="text-gray-400 text-sm">Confirmations:</p>
                <p className="text-white font-semibold">
                  {status.confirmations}
                </p>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}
