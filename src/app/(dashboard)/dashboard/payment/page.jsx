"use client";
import PaymentMethods from "@/components/features/Dashboard/PaymentMethod/PaymentMethod";
import { AlertCircle, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentPage() {
  const [cardPaymentEnabled, setCardPaymentEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch card payment settings
  const fetchCardPaymentSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings/card-payment");
      const data = await response.json();

      if (data.success) {
        setCardPaymentEnabled(data.data.isEnabled);
      } else {
        setCardPaymentEnabled(false);
      }
    } catch (error) {
      console.error("Error fetching card payment settings:", error);
      setCardPaymentEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardPaymentSettings();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show 404 if card payment is disabled
  if (!cardPaymentEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="mb-6">
          <AlertCircle className="w-24 h-24 text-gray-400 mx-auto" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">
          Payment Methods Not Available
        </h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Card payment functionality is currently disabled. Please contact an
          administrator if you need access to payment methods.
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Show payment methods when enabled
  return (
    <div className="">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
          <CreditCard className="w-6 h-6 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">PAYMENT METHODS</h2>
      </div>
      <PaymentMethods />
    </div>
  );
}
