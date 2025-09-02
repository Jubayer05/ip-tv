"use client";
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function GatewaySelectPopup({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const pollRef = useRef(null);

  // Move useEffect before the early return
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            className="aspect-square bg-white text-black py-4 px-3 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 flex flex-col items-center justify-center space-y-2"
            onClick={() => startPayment("plisio")}
            disabled={loading}
          >
            <span className="text-xs">Plisio</span>
            <span className="text-xs text-gray-600">Crypto</span>
          </button>
          {/* <button
            className="aspect-square bg-white text-black py-4 px-3 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 flex flex-col items-center justify-center space-y-2"
            onClick={() => startPayment("hoodpay")}
            disabled={loading}
          >
            <span className="text-xs">HoodPay</span>
            <span className="text-xs text-gray-600">Payment</span>
          </button>
          <button
            className="aspect-square bg-white text-black py-4 px-3 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 flex flex-col items-center justify-center space-y-2"
            onClick={() => startPayment("nowpayment")}
            disabled={loading}
          >
            <span className="text-xs">NOWPayments</span>
            <span className="text-xs text-gray-600">Crypto</span>
          </button> */}
        </div>

        {!!statusText && (
          <p className="text-xs text-gray-300 mt-4 text-center">{statusText}</p>
        )}
      </div>
    </div>
  );
}
