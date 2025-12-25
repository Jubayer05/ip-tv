"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { X } from "lucide-react";
import { useState } from "react";

export default function WithdrawalPopup({
  isOpen,
  onClose,
  onSuccess,
  userBalance,
  userId,
}) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    walletAddress: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ORIGINAL_HEADING = "WITHDRAW FUNDS";
  const ORIGINAL_AMOUNT_LABEL = "Amount:";
  const ORIGINAL_CURRENCY_LABEL = "Currency:";
  const ORIGINAL_WALLET_LABEL = "Wallet Address:";
  const ORIGINAL_MESSAGE_LABEL = "Message (Optional):";
  const ORIGINAL_SUBMIT_BUTTON = "Submit Request";
  const ORIGINAL_CANCEL_BUTTON = "Cancel";
  const ORIGINAL_AVAILABLE_BALANCE = "Available Balance:";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [amountLabel, setAmountLabel] = useState(ORIGINAL_AMOUNT_LABEL);
  const [currencyLabel, setCurrencyLabel] = useState(ORIGINAL_CURRENCY_LABEL);
  const [walletLabel, setWalletLabel] = useState(ORIGINAL_WALLET_LABEL);
  const [messageLabel, setMessageLabel] = useState(ORIGINAL_MESSAGE_LABEL);
  const [submitButton, setSubmitButton] = useState(ORIGINAL_SUBMIT_BUTTON);
  const [cancelButton, setCancelButton] = useState(ORIGINAL_CANCEL_BUTTON);
  const [availableBalance, setAvailableBalance] = useState(
    ORIGINAL_AVAILABLE_BALANCE
  );

  // Translation logic here (similar to other components)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
        setFormData({
          amount: "",
          currency: "USD",
          walletAddress: "",
          message: "",
        });
      } else {
        setError(data.error || "Failed to submit withdrawal request");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-[#212121] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{heading}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close withdrawal popup">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
          <p className="text-blue-400 text-sm">
            {availableBalance}{" "}
            <span className="text-white font-bold">
              ${userBalance.toFixed(2)}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {amountLabel}
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0.01"
              max={userBalance}
              step="0.01"
              required
              className="w-full bg-[#0c171c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {currencyLabel}
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full bg-[#0c171c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="USD">USD</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="BNB">BNB</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {walletLabel}
            </label>
            <input
              type="text"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleChange}
              required
              className="w-full bg-[#0c171c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {messageLabel}
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              className="w-full bg-[#0c171c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700"
            >
              {cancelButton}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 cursor-pointer py-2 bg-cyan-400 text-black rounded font-medium hover:bg-cyan-300 disabled:opacity-50"
            >
              {loading ? "Submitting..." : submitButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
