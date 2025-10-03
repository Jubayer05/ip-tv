"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

export default function DepositPopup({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userEmail,
}) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [step, setStep] = useState("amount");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const pollRef = useRef(null);

  // Original text constants for translation
  const ORIGINAL_TEXTS = {
    addFunds: "Add Funds",
    amount: "Amount ($)",
    enterAmount: "Enter amount",
    proceedToPay: "Proceed to Pay",
    selectPaymentMethod: "Select a Payment Method",
    noPaymentMethods: "No payment methods available",
    selectedPaymentMethod: "Selected Payment Method",
    method: "Method:",
    depositAmount: "Deposit Amount:",
    serviceFee: "Service Fee:",
    totalCharge: "Total Charge:",
    bonus: "Bonus:",
    totalYoullReceive: "Total You'll Receive:",
    confirmPayment: "Confirm Payment",
    processing: "Processing...",
    waitingForConfirmation: "Waiting for payment confirmation...",
    paymentConfirmed: "Payment confirmed.",
    paymentFailed: "Payment failed or canceled.",
    failedToStartPayment: "Failed to start payment",
    invalidAmount: "Invalid amount",
    enterValidAmount: "Please enter a valid amount greater than 0.",
    min: "Min:",
    needMore: "more",
    bonusText: "Bonus",
    minToGet: "to get",
    serviceFeeLabel: "Service Fee:",
    total: "Total:",
    youGet: "You get",
    card: "Card",
    crypto: "Crypto",
    payment: "Payment",
    exchange: "Exchange",
  };

  // State for translated texts
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  // Translate texts when language changes
  useEffect(() => {
    if (!isLanguageLoaded || language?.code === "en") {
      setTexts(ORIGINAL_TEXTS);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const textsToTranslate = Object.values(ORIGINAL_TEXTS);
        const translated = await translate(textsToTranslate);
        if (!isMounted) return;

        const newTexts = {};
        Object.keys(ORIGINAL_TEXTS).forEach((key, index) => {
          newTexts[key] = translated[index];
        });
        setTexts(newTexts);
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language?.code, translate, isLanguageLoaded]);

  // Fetch payment methods when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    } else {
      // Reset state when popup is closed
      setStep("amount");
      setAmount("");
      setLoading(false);
      setStatusText("");
      setSelectedGateway(null);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
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

  const proceedToGateways = () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      Swal.fire({
        icon: "warning",
        title: texts.invalidAmount,
        text: texts.enterValidAmount,
        confirmButtonColor: "#00b877",
      });
      return;
    }
    setStep("gateway");
  };

  const selectGateway = (method) => {
    const isAmountValid = Number(amount) >= method.minAmount;
    if (isAmountValid) {
      setSelectedGateway(method);
    }
  };

  const confirmPayment = async () => {
    if (!selectedGateway) return;

    if (loading) return;
    setLoading(true);
    setStatusText("");
    try {
      const payload = {
        amount: Number(amount),
        currency: "USD",
        userId: userId || null,
        customerEmail: userEmail || "",
      };

      const res = await fetch(
        `/api/payments/${selectedGateway.gateway}/deposit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.error || `Failed to create ${selectedGateway.gateway} deposit`
        );
      }

      const data = await res.json();
      const checkoutUrl = data?.checkoutUrl;
      const depositId = data?.depositId;

      if (!checkoutUrl || !depositId) {
        throw new Error("Invalid deposit creation response");
      }

      window.open(checkoutUrl, "_blank", "noopener,noreferrer");

      setStatusText(texts.waitingForConfirmation);
      pollRef.current = setInterval(async () => {
        try {
          const st = await fetch(`/api/deposits/status/${depositId}`);
          if (!st.ok) return;
          const s = await st.json();
          if (s?.status === "completed") {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setStatusText(texts.paymentConfirmed);
            onSuccess?.();
            onClose?.();
          } else if (s?.status === "failed" || s?.status === "cancelled") {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setStatusText(texts.paymentFailed);
          }
        } catch {}
      }, 4000);
    } catch (e) {
      setStatusText(e?.message || texts.failedToStartPayment);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get logo path - now checks for custom imageUrl first
  const getLogoPath = (method) => {
    // First check if there's a custom imageUrl from the backend
    if (method.imageUrl) {
      return method.imageUrl;
    }

    // Fallback to default logos
    const logoMap = {
      stripe: "/payment_logo/stripe.png",
      plisio: "/payment_logo/plisio.png",
      hoodpay: "/payment_logo/hoodpay.jpeg",
      nowpayment: "/payment_logo/now_payments.png",
      changenow: "/payment_logo/changenow.png",
      cryptomus: "/payment_logo/cryptomus.png",
      paygate: "/payment_logo/paygate.png",
      volet: "/payment_logo/volet.png",
    };
    return logoMap[method.gateway] || "/payment_logo/default.png";
  };

  // Helper function to get payment type
  const getPaymentType = (gateway) => {
    const typeMap = {
      stripe: texts.card,
      plisio: texts.crypto,
      hoodpay: texts.payment,
      nowpayment: texts.crypto,
      changenow: texts.exchange,
      cryptomus: texts.crypto,
      paygate: texts.crypto,
      volet: texts.crypto,
    };
    return typeMap[gateway] || texts.payment;
  };

  // Helper function to calculate service fee
  const calculateServiceFee = (method, amount) => {
    if (!method.feeSettings || !method.feeSettings.isActive) {
      return { feeAmount: 0, totalAmount: amount };
    }

    let feeAmount = 0;
    if (method.feeSettings.feeType === "percentage") {
      feeAmount = (amount * method.feeSettings.feePercentage) / 100;
    } else if (method.feeSettings.feeType === "fixed") {
      feeAmount = method.feeSettings.fixedAmount;
    }

    return {
      feeAmount: parseFloat(feeAmount.toFixed(2)),
      totalAmount: parseFloat((amount + feeAmount).toFixed(2)),
    };
  };

  // Helper function to get all applicable bonuses for a given amount
  const getApplicableBonuses = (method, amount) => {
    if (!method.bonusSettings || method.bonusSettings.length === 0) return [];

    const activeBonuses = method.bonusSettings.filter(
      (bonus) => bonus.isActive
    );
    if (activeBonuses.length === 0) return [];

    // Find all applicable bonuses (amount meets minimum requirement)
    const applicableBonuses = activeBonuses
      .filter((bonus) => amount >= bonus.minAmount)
      .sort((a, b) => b.bonusPercentage - a.bonusPercentage); // Sort by highest percentage first

    return applicableBonuses.map((bonus) => ({
      percentage: bonus.bonusPercentage,
      amount: (amount * bonus.bonusPercentage) / 100,
      minAmount: bonus.minAmount,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-[70] font-secondary">
      <div className="bg-black rounded-2xl p-5 sm:p-6 w-full max-w-sm sm:max-w-[700px] mx-auto relative border border-[#FFFFFF26] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-300 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {step === "amount" && (
          <div>
            <h3 className="text-white text-lg sm:text-xl font-bold mb-4">
              {texts.addFunds}
            </h3>
            <label className="block text-sm text-gray-300 mb-2">
              {texts.amount}
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={texts.enterAmount}
              className="w-full bg-[#0c171c] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={proceedToGateways}
              className="mt-4 w-full cursor-pointer py-2 bg-cyan-400 text-black rounded font-semibold hover:bg-cyan-300"
            >
              {texts.proceedToPay}
            </button>
          </div>
        )}

        {step === "gateway" && (
          <div>
            <h3 className="text-white text-lg sm:text-xl font-bold mb-4">
              {texts.selectPaymentMethod}
            </h3>

            {loadingMethods ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">{texts.noPaymentMethods}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const bonuses = getApplicableBonuses(method, Number(amount));
                  const feeInfo = calculateServiceFee(method, Number(amount));
                  const isAmountValid = Number(amount) >= method.minAmount;
                  const isSelected = selectedGateway?._id === method._id;

                  // Get the highest bonus available for this method (regardless of current amount)
                  const highestBonus =
                    method.bonusSettings && method.bonusSettings.length > 0
                      ? method.bonusSettings
                          .filter((bonus) => bonus.isActive)
                          .sort(
                            (a, b) => b.bonusPercentage - a.bonusPercentage
                          )[0]
                      : null;

                  return (
                    <button
                      key={method._id}
                      className={`aspect-auto py-4 px-3 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 flex flex-col items-center justify-center space-y-1 min-h-[140px] ${
                        isSelected
                          ? "bg-cyan-400 text-black"
                          : isAmountValid
                          ? "bg-white text-black hover:bg-gray-50"
                          : "bg-gray-600 text-gray-300 cursor-not-allowed"
                      }`}
                      onClick={() => selectGateway(method)}
                      disabled={loading || !isAmountValid}
                      title={`${method.name} - Min: $${method.minAmount}`}
                    >
                      <Image
                        src={getLogoPath(method)}
                        alt={method.name}
                        width={60}
                        height={30}
                        className="object-contain w-[100px]"
                      />
                      <span className="text-xs text-gray-600">
                        {getPaymentType(method.gateway)}
                      </span>

                      {/* Always show minimum amount */}
                      <div className="text-xs text-center">
                        <span className="font-medium text-gray-600">
                          {texts.min} ${method.minAmount}
                        </span>
                        {!isAmountValid && (
                          <div className="text-red-500 text-xs mt-1">
                            Need $
                            {(method.minAmount - Number(amount)).toFixed(2)}{" "}
                            {texts.needMore}
                          </div>
                        )}
                      </div>

                      {/* Always show bonus if available */}
                      {highestBonus && (
                        <div className="text-xs text-green-600 font-medium">
                          +{highestBonus.bonusPercentage}% {texts.bonusText}
                        </div>
                      )}

                      {/* Show minimum amount to get this bonus */}
                      {highestBonus && (
                        <div className="text-xs text-gray-500">
                          {texts.min} ${highestBonus.minAmount} {texts.minToGet}
                        </div>
                      )}

                      {/* Show service fee if active */}
                      {method.feeSettings && method.feeSettings.isActive && (
                        <div className="text-xs text-red-500 font-medium">
                          {texts.serviceFeeLabel}{" "}
                          {method.feeSettings.feeType === "percentage"
                            ? `${method.feeSettings.feePercentage}%`
                            : `$${method.feeSettings.fixedAmount}`}
                        </div>
                      )}

                      {/* Show total charge amount */}
                      {method.feeSettings && method.feeSettings.isActive && (
                        <div className="text-xs text-red-400 font-medium">
                          {texts.total}: ${feeInfo.totalAmount.toFixed(2)}
                        </div>
                      )}

                      {/* Show current bonus if amount is valid and has applicable bonuses */}
                      {bonuses.length > 0 && isAmountValid && (
                        <div className="text-xs text-blue-600 font-medium">
                          {texts.youGet} +{bonuses[0].percentage}%
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected Gateway Summary */}
            {selectedGateway && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h4 className="text-white font-semibold mb-3 text-center">
                  {texts.selectedPaymentMethod}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{texts.method}</span>
                    <span className="text-white font-medium">
                      {selectedGateway.name}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{texts.depositAmount}</span>
                    <span className="text-white font-medium">
                      ${Number(amount).toFixed(2)}
                    </span>
                  </div>

                  {/* Show service fee if active */}
                  {(() => {
                    const feeInfo = calculateServiceFee(
                      selectedGateway,
                      Number(amount)
                    );
                    if (feeInfo.feeAmount > 0) {
                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">
                              {texts.serviceFee}
                            </span>
                            <span className="text-red-400 font-medium">
                              ${feeInfo.feeAmount.toFixed(2)} (
                              {selectedGateway.feeSettings.feeType ===
                              "percentage"
                                ? `${selectedGateway.feeSettings.feePercentage}%`
                                : "Fixed"}
                              )
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">
                              {texts.totalCharge}
                            </span>
                            <span className="text-red-300 font-medium">
                              ${feeInfo.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </>
                      );
                    }
                    return null;
                  })()}

                  {/* Show bonus for selected gateway */}
                  {(() => {
                    const bonuses = getApplicableBonuses(
                      selectedGateway,
                      Number(amount)
                    );
                    if (bonuses.length > 0) {
                      // Get only the highest bonus (first one since they're sorted by percentage)
                      const highestBonus = bonuses[0];
                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{texts.bonus}</span>
                            <span className="text-green-400 font-medium">
                              +${highestBonus.amount.toFixed(2)} (
                              {highestBonus.percentage}%)
                            </span>
                          </div>
                          <div className="border-t border-gray-600 my-2"></div>
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-white">
                              {texts.totalYoullReceive}
                            </span>
                            <span className="text-cyan-400">
                              $
                              {(Number(amount) + highestBonus.amount).toFixed(
                                2
                              )}
                            </span>
                          </div>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>

                <button
                  onClick={confirmPayment}
                  disabled={loading}
                  className="mt-4 w-full py-2 bg-cyan-400 text-black rounded font-semibold hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? texts.processing : texts.confirmPayment}
                </button>
              </div>
            )}

            {!!statusText && (
              <p className="text-xs text-gray-300 mt-4 text-center">
                {statusText}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
