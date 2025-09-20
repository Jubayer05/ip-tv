"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import WithdrawalPopup from "./WithdrawalPopup";

export default function DepositPayouts() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user, refreshUserData } = useAuth();
  const [showWithdrawalPopup, setShowWithdrawalPopup] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [totalReferralEarnings, setTotalReferralEarnings] = useState(0);

  // Get separate balances from user data
  const balance = user?.balance || 0;
  const depositBalance = user?.depositBalance || 0;
  const referralEarnings = user?.referral?.earnings || 0; // This will be used for "Total Withdrawable funds"

  const ORIGINAL_HEADING = "WALLET & EARNINGS";
  const ORIGINAL_BALANCE_LABEL = "Total Withdrawable Funds:";
  const ORIGINAL_DEPOSIT_LABEL = "Deposit Balance:";
  const ORIGINAL_EARNINGS_LABEL = "Total Referral Earnings:";
  const ORIGINAL_WITHDRAW_BUTTON = "Withdraw Funds";
  const ORIGINAL_DISCLAIMER =
    "*You can use your main balance to buy plans or withdraw referral earnings to your preferred payment method.";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [balanceLabel, setBalanceLabel] = useState(ORIGINAL_BALANCE_LABEL);
  const [earningsLabel, setEarningsLabel] = useState(ORIGINAL_EARNINGS_LABEL);
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

  // Fetch total referral earnings from referral history
  useEffect(() => {
    if (!user?._id) return;

    const fetchTotalReferralEarnings = async () => {
      try {
        const response = await fetch(`/api/users/${user._id}/referrals`);
        const data = await response.json();

        if (response.ok && data.success) {
          setTotalReferralEarnings(data.data.totalEarnings || 0);
        }
      } catch (err) {
        console.error("Error fetching total referral earnings:", err);
      }
    };

    fetchTotalReferralEarnings();
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
        ORIGINAL_DEPOSIT_LABEL,
        ORIGINAL_EARNINGS_LABEL,
        ORIGINAL_WITHDRAW_BUTTON,
        ORIGINAL_DISCLAIMER,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tHeading,
        tBalanceLabel,
        tDepositLabel,
        tEarningsLabel,
        tWithdrawButton,
        tDisclaimer,
      ] = translated;

      setHeading(tHeading);
      setBalanceLabel(tBalanceLabel);
      setEarningsLabel(tEarningsLabel);
      setWithdrawButton(tWithdrawButton);
      setDisclaimer(tDisclaimer);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

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

        <div className="space-y-4 mb-6">
          {/* Total Withdrawable Funds Section */}
          <div className="mb-4">
            <p className="text-gray-300 text-xs sm:text-sm mb-3">
              {balanceLabel}
            </p>
            <div className="inline-block border-2 bg-primary/15 border-primary text-primary rounded-full px-4 sm:px-6 py-2 sm:py-3">
              <span className="text-xl sm:text-2xl font-bold">
                ${referralEarnings.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Total Referral Earnings Section */}
          <div className="mb-4">
            <p className="text-gray-300 text-xs sm:text-sm mb-3">
              {earningsLabel}
            </p>
            <div className="inline-block border-2 bg-green-500/15 border-green-500 text-green-400 rounded-full px-4 sm:px-6 py-2 sm:py-3">
              <span className="text-lg sm:text-xl font-bold">
                ${totalReferralEarnings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="mb-6">
          <button
            onClick={handleWithdrawFunds}
            className="w-full cursor-pointer py-2 sm:py-3 bg-cyan-400 text-gray-900 rounded-full text-xs sm:text-sm font-bold hover:bg-cyan-500 transition-colors duration-200"
          >
            {withdrawButton}
          </button>
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
        userBalance={referralEarnings} // Only allow withdrawal from referral earnings
        userId={user?._id}
      />
    </>
  );
}
