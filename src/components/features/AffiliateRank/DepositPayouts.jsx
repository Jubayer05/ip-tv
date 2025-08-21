"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

export default function DepositPayouts() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const balance = 87.0;

  const ORIGINAL_HEADING = "DEPOSIT & PAYOUTS";
  const ORIGINAL_BALANCE_LABEL = "Affiliate Wallet Balance:";
  const ORIGINAL_DEPOSIT_BUTTON = "Deposit Funds";
  const ORIGINAL_WITHDRAW_BUTTON = "Withdraw Funds";
  const ORIGINAL_DISCLAIMER =
    "*You can use your balance to buy plans or withdraw to your preferred payment method.";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [balanceLabel, setBalanceLabel] = useState(ORIGINAL_BALANCE_LABEL);
  const [depositButton, setDepositButton] = useState(ORIGINAL_DEPOSIT_BUTTON);
  const [withdrawButton, setWithdrawButton] = useState(
    ORIGINAL_WITHDRAW_BUTTON
  );
  const [disclaimer, setDisclaimer] = useState(ORIGINAL_DISCLAIMER);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_HEADING,
        ORIGINAL_BALANCE_LABEL,
        ORIGINAL_DEPOSIT_BUTTON,
        ORIGINAL_WITHDRAW_BUTTON,
        ORIGINAL_DISCLAIMER,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tHeading,
        tBalanceLabel,
        tDepositButton,
        tWithdrawButton,
        tDisclaimer,
      ] = translated;

      setHeading(tHeading);
      setBalanceLabel(tBalanceLabel);
      setDepositButton(tDepositButton);
      setWithdrawButton(tWithdrawButton);
      setDisclaimer(tDisclaimer);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const handleDepositFunds = () => {
    console.log("Deposit funds clicked");
  };

  const handleWithdrawFunds = () => {
    console.log("Withdraw funds clicked");
  };

  return (
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
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-4 sm:mb-6 flex-1 sm:flex sm:flex-col sm:items-end">
          <button
            onClick={handleDepositFunds}
            className="w-full sm:w-[150px] py-2 sm:py-3 border-2 border-cyan-400 text-cyan-400 rounded-full text-xs sm:text-sm font-bold hover:bg-cyan-400 hover:text-gray-900 transition-colors duration-200"
          >
            {depositButton}
          </button>

          <button
            onClick={handleWithdrawFunds}
            className="w-full sm:w-[150px] py-2 sm:py-3 bg-cyan-400 text-gray-900 rounded-full text-xs sm:text-sm font-bold hover:bg-cyan-500 transition-colors duration-200"
          >
            {withdrawButton}
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-white text-center font-medium text-xs leading-relaxed">
        {disclaimer}
      </p>
    </div>
  );
}
