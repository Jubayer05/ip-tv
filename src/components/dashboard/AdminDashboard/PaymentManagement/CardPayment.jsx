"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreditCard, ToggleLeft, ToggleRight } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const CardPayment = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [cardSettings, setCardSettings] = useState({
    isEnabled: false,
    minAmount: 1,
    maxAmount: 1000,
    supportedCards: {
      visa: true,
      mastercard: true,
      amex: false,
      discover: false,
    },
    processingFee: {
      isActive: false,
      feePercentage: 0,
      fixedAmount: 0,
    },
    description: "Pay securely with your credit or debit card",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Card Payment Settings",
    description: "Manage card payment options and settings",
    enableCardPayment: "Enable Card Payment",
    disableCardPayment: "Disable Card Payment",
    cardPaymentEnabled: "Card payment is currently enabled",
    cardPaymentDisabled: "Card payment is currently disabled",
    updateSuccess: "Card payment settings updated successfully",
    updateError: "Failed to update card payment settings",
    loading: "Loading...",
  };

  const texts = translate(ORIGINAL_TEXTS, language);

  // Fetch card payment settings
  const fetchCardSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings/card-payment");
      const data = await response.json();

      if (data.success) {
        setCardSettings(data.data);
      } else {
        console.error("Failed to fetch card payment settings:", data.error);
      }
    } catch (error) {
      console.error("Error fetching card payment settings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update card payment settings
  const updateCardSettings = async (updates) => {
    try {
      setUpdating(true);
      const response = await fetch("/api/settings/card-payment", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setCardSettings(data.data);
        Swal.fire({
          icon: "success",
          title: texts.updateSuccess,
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        throw new Error(data.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating card payment settings:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: texts.updateError,
      });
    } finally {
      setUpdating(false);
    }
  };

  // Toggle card payment enable/disable
  const toggleCardPayment = async () => {
    const newStatus = !cardSettings.isEnabled;
    await updateCardSettings({ isEnabled: newStatus });
  };

  useEffect(() => {
    if (isLanguageLoaded) {
      fetchCardSettings();
    }
  }, [isLanguageLoaded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">{texts.loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-cyan-500/20 rounded-lg">
          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {texts.heading}
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            {texts.description}
          </p>
        </div>
      </div>

      {/* Card Payment Toggle */}
      <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              {cardSettings.isEnabled ? (
                <ToggleRight className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              ) : (
                <ToggleLeft className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              )}
              <div>
                <h3 className="text-base sm:text-lg font-medium text-white">
                  {cardSettings.isEnabled
                    ? texts.enableCardPayment
                    : texts.disableCardPayment}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  {cardSettings.isEnabled
                    ? texts.cardPaymentEnabled
                    : texts.cardPaymentDisabled}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={toggleCardPayment}
            disabled={updating}
            className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
              cardSettings.isEnabled
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {updating
              ? "Updating..."
              : cardSettings.isEnabled
              ? "Disable"
              : "Enable"}
          </button>
        </div>
      </div>

      {/* Additional Settings (when enabled) */}
      {cardSettings.isEnabled && (
        <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">
            Card Payment Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Minimum Amount
              </label>
              <input
                type="number"
                value={cardSettings.minAmount}
                onChange={(e) =>
                  setCardSettings({
                    ...cardSettings,
                    minAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm"
                min="0.01"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Maximum Amount
              </label>
              <input
                type="number"
                value={cardSettings.maxAmount}
                onChange={(e) =>
                  setCardSettings({
                    ...cardSettings,
                    maxAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm"
                min="1"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={cardSettings.description}
              onChange={(e) =>
                setCardSettings({
                  ...cardSettings,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm"
              rows="3"
            />
          </div>

          <button
            onClick={() => updateCardSettings(cardSettings)}
            disabled={updating}
            className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            {updating ? "Saving..." : "Save Settings"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CardPayment;
