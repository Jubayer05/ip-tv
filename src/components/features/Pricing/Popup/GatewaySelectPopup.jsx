"use client";
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function GatewaySelectPopup({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const pollRef = useRef(null);

  // Fetch payment methods when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const response = await fetch("/api/payment-settings");
      const data = await response.json();

      if (data.success) {
        // Filter only active payment methods
        const activeMethods = data.data.filter((method) => method.isActive);
        setPaymentMethods(activeMethods);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoadingMethods(false);
    }
  };

  if (!isOpen) return null;

  const startPayment = async (gateway) => {
    if (loading) return;
    setStatusText("");
    setLoading(true);
    try {
      const selRaw = localStorage.getItem("cs_order_selection");
      const sel = selRaw ? JSON.parse(selRaw) : null;
      if (!sel || !sel.priceCalculation?.finalTotal) {
        throw new Error("Missing selection or amount");
      }

      const amount = Number(sel.priceCalculation.finalTotal);
      if (!amount || amount <= 0) throw new Error("Invalid amount");

      const payload = {
        amount,
        currency: "USD",
        userId: user?._id || null,
        customerEmail: user?.email || "",
        meta: {
          productId: sel.productId,
          variantId: sel.variantId,
          devices: sel.devices,
          adultChannels: !!sel.adultChannels,
          quantity: sel.isCustomQuantity
            ? sel.quantity || 1
            : sel.quantity || 1,
        },
      };

      const res = await fetch(`/api/payments/${gateway}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Failed to create ${gateway} payment`);
      }
      const data = await res.json();
      const paymentId = data?.paymentId;
      const checkoutUrl = data?.checkoutUrl;

      if (!paymentId || !checkoutUrl) {
        throw new Error("Invalid payment creation response");
      }

      // Open provider checkout
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");

      // Start polling provider status through our API
      setStatusText("Waiting for payment confirmation...");
      pollRef.current = setInterval(async () => {
        try {
          const st = await fetch(
            `/api/payments/${gateway}/status/${paymentId}`
          );
          if (!st.ok) return;
          const s = await st.json();
          if (
            s?.status === "completed" ||
            s?.status === "paid" ||
            s?.paid === true
          ) {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setStatusText("Payment confirmed.");
            // Let parent finalize order using existing callback
            onSuccess?.();
            onClose?.();
          } else if (s?.status === "failed" || s?.status === "canceled") {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setStatusText("Payment failed or canceled.");
          }
        } catch {}
      }, 4000);
    } catch (e) {
      setStatusText(e?.message || "Failed to start payment");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get logo path
  const getLogoPath = (gateway) => {
    const logoMap = {
      stripe: "/payment_logo/stripe.png",
      plisio: "/payment_logo/plisio.png",
      hoodpay: "/payment_logo/hoodpay.jpeg",
      nowpayment: "/payment_logo/now_payments.png",
      changenow: "/payment_logo/changenow.png",
      cryptomus: "/payment_logo/cryptomus.png",
    };
    return logoMap[gateway] || "/payment_logo/default.png";
  };

  // Helper function to get display name
  const getDisplayName = (gateway) => {
    const nameMap = {
      stripe: "Stripe",
      plisio: "Plisio",
      hoodpay: "HoodPay",
      nowpayment: "NOWPayments",
      changenow: "ChangeNOW",
      cryptomus: "Cryptomus",
    };
    return nameMap[gateway] || gateway;
  };

  // Helper function to get payment type
  const getPaymentType = (gateway) => {
    const typeMap = {
      stripe: "Card",
      plisio: "Crypto",
      hoodpay: "Payment",
      nowpayment: "Crypto",
      changenow: "Exchange",
      cryptomus: "Crypto",
    };
    return typeMap[gateway] || "Payment";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-[60] font-secondary">
      <div className="bg-black rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-sm sm:max-w-[700px] mx-auto relative border border-[#FFFFFF26]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-300 transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-white text-lg sm:text-xl font-bold mb-4">
          Select a Payment Method
        </h3>

        {loadingMethods ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No payment methods available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method._id}
                className="aspect-square bg-white text-black py-4 px-3 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 flex flex-col items-center justify-center space-y-2"
                onClick={() => startPayment(method.gateway)}
                disabled={loading}
                title={`${method.name} - Min: $${method.minAmount}`}
              >
                <Image
                  src={getLogoPath(method.gateway)}
                  alt={method.name}
                  width={60}
                  height={30}
                  className="object-contain w-[100px]"
                />
                <span className="text-xs text-gray-600">
                  {getPaymentType(method.gateway)}
                </span>
                {method.bonusSettings && method.bonusSettings.length > 0 && (
                  <span className="text-xs text-green-600 font-medium">
                    Bonus Available
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {!!statusText && (
          <p className="text-xs text-gray-300 mt-4 text-center">{statusText}</p>
        )}
      </div>
    </div>
  );
}
