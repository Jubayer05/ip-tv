"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import WithdrawalPopup from "./WithdrawalPopup";

export default function DepositPayouts() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user } = useAuth();
  const [showWithdrawalPopup, setShowWithdrawalPopup] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);

  // Get real balance from user data
  const balance = user?.balance || 0;
  const referralEarnings = user?.referral?.earnings || 0;

  const ORIGINAL_HEADING = "DEPOSIT & PAYOUTS";
  const ORIGINAL_BALANCE_LABEL = "Affiliate Wallet Balance:";
  const ORIGINAL_EARNINGS_LABEL = "Total Referral Earnings:";
  const ORIGINAL_DEPOSIT_BUTTON = "Deposit Funds";
  const ORIGINAL_WITHDRAW_BUTTON = "Withdraw Funds";
  const ORIGINAL_DISCLAIMER =
    "*You can use your balance to buy plans or withdraw to your preferred payment method.";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [balanceLabel, setBalanceLabel] = useState(ORIGINAL_BALANCE_LABEL);
  const [earningsLabel, setEarningsLabel] = useState(ORIGINAL_EARNINGS_LABEL);
  const [depositButton, setDepositButton] = useState(ORIGINAL_DEPOSIT_BUTTON);
  const [withdrawButton, setWithdrawButton] = useState(
    ORIGINAL_WITHDRAW_BUTTON
  );
  const [disclaimer, setDisclaimer] = useState(ORIGINAL_DISCLAIMER);

  // Fetch user's withdrawal requests
  useEffect(() => {
    if (!user?._id) return;

    const fetchWithdrawals = async () => {
      try {
        const response = await fetch(`/api/withdrawals?userId=${user._id}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setWithdrawals(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching withdrawals:", err);
      }
    };

    fetchWithdrawals();
  }, [user?._id]);

  // Refresh withdrawals after successful submission
  const handleWithdrawalSuccess = () => {
    setShowWithdrawalPopup(false);
    // Refresh the withdrawals list
    if (user?._id) {
      fetch(`/api/withdrawals?userId=${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setWithdrawals(data.data || []);
          }
        });
    }
  };

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_HEADING,
        ORIGINAL_BALANCE_LABEL,
        ORIGINAL_EARNINGS_LABEL,
        ORIGINAL_DEPOSIT_BUTTON,
        ORIGINAL_WITHDRAW_BUTTON,
        ORIGINAL_DISCLAIMER,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tHeading,
        tBalanceLabel,
        tEarningsLabel,
        tDepositButton,
        tWithdrawButton,
        tDisclaimer,
      ] = translated;

      setHeading(tHeading);
      setBalanceLabel(tBalanceLabel);
      setEarningsLabel(tEarningsLabel);
      setDepositButton(tDepositButton);
      setWithdrawButton(tWithdrawButton);
      setDisclaimer(tDisclaimer);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const handleDepositFunds = () => {
  };

  const handleWithdrawFunds = () => {
    setShowWithdrawalPopup(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400";
      case "approved":
        return "text-blue-400";
      case "rejected":
        return "text-red-400";
      case "paid":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <>
      <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 rounded-lg w-full lg:max-w-md mx-auto">
        {/* Header */}
        <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 tracking-wide">
          {heading}
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Balance Section */}
          <div className="mb-4 sm:mb-6 flex-1">
            <p className="text-gray-300 text-xs sm:text-sm mb-3">
              {balanceLabel}
            </p>
            <div className="inline-block border-2 bg-primary/15 border-primary text-primary rounded-full px-4 sm:px-6 py-2 sm:py-3">
              <span className="text-xl sm:text-2xl font-bold">
                ${balance.toFixed(2)}
              </span>
            </div>

            {/* Referral Earnings */}
            <p className="text-gray-300 text-xs sm:text-sm mb-3 mt-4">
              {earningsLabel}
            </p>
            <div className="inline-block border-2 bg-green-500/15 border-green-500 text-green-400 rounded-full px-4 sm:px-6 py-2 sm:py-3">
              <span className="text-lg sm:text-xl font-bold">
                ${referralEarnings.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-4 sm:mb-6 flex-1 sm:flex sm:flex-col sm:items-end">
            <button
              onClick={handleDepositFunds}
              className="w-full sm:w-[150px] cursor-pointer py-2 sm:py-3 border-2 border-cyan-400 text-cyan-400 rounded-full text-xs sm:text-sm font-bold hover:bg-cyan-400 hover:text-gray-900 transition-colors duration-200"
            >
              {depositButton}
            </button>

            <button
              onClick={handleWithdrawFunds}
              className="w-full sm:w-[150px] cursor-pointer py-2 sm:py-3 bg-cyan-400 text-gray-900 rounded-full text-xs sm:text-sm font-bold hover:bg-cyan-500 transition-colors duration-200"
            >
              {withdrawButton}
            </button>
          </div>
        </div>

        {/* Recent Withdrawals */}
        {withdrawals.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-300">
              Recent Withdrawals
            </h3>
            <div className="space-y-2">
              {withdrawals.slice(0, 3).map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="flex justify-between items-center text-xs bg-white/5 p-2 rounded"
                >
                  <span>${withdrawal.amount.toFixed(2)}</span>
                  <span
                    className={`${getStatusColor(
                      withdrawal.status
                    )} capitalize`}
                  >
                    {withdrawal.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-white text-center font-medium text-xs leading-relaxed mt-4">
          {disclaimer}
        </p>
      </div>

      {/* Withdrawal Popup */}
      <WithdrawalPopup
        isOpen={showWithdrawalPopup}
        onClose={() => setShowWithdrawalPopup(false)}
        onSuccess={handleWithdrawalSuccess}
        userBalance={balance}
        userId={user?._id}
      />
    </>
  );
}
