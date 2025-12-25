"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function DepositPopup({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userEmail,
}) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState(null);
  
  // NEW: PayGate multi-provider support
  const [paygateProviders, setPaygateProviders] = useState({ card: [] });
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  // Validation state
  const [validationStatus, setValidationStatus] = useState(null); // 'valid', 'invalid', or null
  const [helperText, setHelperText] = useState("");

  // Original text constants for translation
  const ORIGINAL_TEXTS = {
    addFunds: "Add Funds",
    amount: "Amount ($)",
    enterAmount: "Enter amount",
    selectPaymentMethod: "Select a Payment Method",
    selectPaymentProvider: "Select Payment Provider",
    noPaymentMethods: "No payment methods available",
    method: "Method:",
    depositAmount: "Deposit Amount:",
    serviceFee: "Service Fee:",
    totalCharge: "Total Charge:",
    bonus: "Bonus:",
    totalYoullReceive: "Total You'll Receive:",
    confirmPayment: "Confirm Payment",
    processing: "Processing...",
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
    payment: "Payment",
    exchange: "Exchange",
    cardPayments: "Card Payments",
    selectProvider: "Select a payment provider to continue",
    provider: "Provider:",
    enterAmountFirst: "Enter an amount to see available payment methods",
    youNeedMore: "You need",
    moreFor: "more for",
    amountValid: "Amount is valid! Select a payment method below.",
    cancel: "Cancel",
    changePaymentMethod: "Change Payment Method",
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
      setAmount("");
      setLoading(false);
      setStatusText("");
      setSelectedGateway(null);
      setSelectedProvider(null);
      setPaygateProviders({ card: [] });
      setValidationStatus(null);
      setHelperText("");
    }
  }, [isOpen]);

  // Fetch PayGate providers when PayGate is selected
  useEffect(() => {
    if (selectedGateway?.gateway === 'paygate') {
      fetchPaygateProviders();
    }
  }, [selectedGateway]);

  // Real-time validation when amount changes
  useEffect(() => {
    const amountNum = Number(amount);
    
    // No amount entered
    if (!amount || amount === "") {
      setValidationStatus(null);
      setHelperText(texts.enterAmountFirst);
      return;
    }
    
    // Invalid amount (zero or negative)
    if (amountNum <= 0) {
      setValidationStatus('invalid');
      setHelperText(texts.enterValidAmount);
      return;
    }
    
    // Check against all payment method minimums
    if (paymentMethods.length > 0) {
      const lowestMinimum = Math.min(...paymentMethods.map(m => m.minAmount));
      const availableMethods = paymentMethods.filter(m => amountNum >= m.minAmount);
      
      if (availableMethods.length === 0) {
        // Amount is too low for all methods
        const closestMethod = paymentMethods.reduce((prev, curr) => 
          (curr.minAmount < prev.minAmount) ? curr : prev
        );
        const needed = (closestMethod.minAmount - amountNum).toFixed(2);
        setValidationStatus('invalid');
        setHelperText(`${texts.youNeedMore} $${needed} ${texts.moreFor} ${closestMethod.name}`);
      } else {
        // Amount is valid for at least one method
        setValidationStatus('valid');
        setHelperText(texts.amountValid);
      }
    } else {
      // No payment methods loaded yet
      setValidationStatus('valid');
      setHelperText(texts.amountValid);
    }
  }, [amount, paymentMethods, texts]);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const response = await fetch("/api/payment-settings");
      const data = await response.json();

      if (data.success) {
        const activeMethods = data.data.filter((method) => method.isActive);
        setPaymentMethods(activeMethods);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoadingMethods(false);
    }
  };

  const fetchPaygateProviders = async () => {
    try {
      setLoadingProviders(true);
      console.log("[DepositPopup] Fetching PayGate providers...");
      
      const timestamp = Date.now(); // Cache busting
      const response = await fetch(`/api/payments/paygate/providers?region=US&t=${timestamp}`);
      const data = await response.json();

      if (data.success) {
        // Filter only active providers (double-check on frontend)
        const activeProviders = {
          card: (data.providers.card || []).filter(p => p.isActive !== false),
          crypto: (data.providers.crypto || []).filter(p => p.isActive !== false),
          bank: (data.providers.bank || []).filter(p => p.isActive !== false),
        };
        
        setPaygateProviders(activeProviders);
        
        // Auto-select first card provider if available
        if (activeProviders.card.length > 0) {
          setSelectedProvider(activeProviders.card[0]);
        }
      }
    } catch (error) {
      console.error("❌ [DepositPopup] Error fetching PayGate providers:", error);
    } finally {
      setLoadingProviders(false);
    }
  };

  if (!isOpen) return null;

  const selectGateway = (method) => {
    const isAmountValid = Number(amount) >= method.minAmount;
    if (isAmountValid) {
      setSelectedGateway(method);
      setSelectedProvider(null); // Reset provider when changing gateway
    }
  };

  const confirmPayment = async () => {
    if (!selectedGateway) return;

    // Validate provider for PayGate
    if (selectedGateway.gateway === 'paygate' && !selectedProvider) {
      Swal.fire({
        icon: "warning",
        title: "Provider Required",
        text: texts.selectProvider,
        confirmButtonColor: "#00b877",
      });
      return;
    }

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

      // Add provider for PayGate
      if (selectedGateway.gateway === 'paygate') {
        payload.provider = selectedProvider.code;
        payload.userRegion = 'US'; // You can detect this from user's location
      }

      console.log("🔵 Creating deposit:", {
        gateway: selectedGateway.gateway,
        amount: payload.amount,
        userId: payload.userId,
        provider: payload.provider || 'N/A',
      });

      const res = await fetch(
        `/api/payments/${selectedGateway.gateway}/deposit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      console.log("📡 Deposit API response:", {
        status: res.status,
        ok: res.ok,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.error || `Failed to create ${selectedGateway.gateway} deposit`
        );
      }

      const data = await res.json();
      
      console.log("✅ Deposit data received:", {
        success: data?.success,
        depositId: data?.depositId,
        hasCheckoutUrl: !!data?.checkoutUrl,
        provider: data?.provider,
      });

      const checkoutUrl = data?.checkoutUrl;
      const depositId = data?.depositId;

      if (!data.success) {
        throw new Error(data?.error || "Deposit creation failed");
      }

      if (!checkoutUrl || checkoutUrl === "") {
        console.error("❌ Missing checkoutUrl:", data);
        throw new Error("Payment URL not generated. Please try again.");
      }

      if (!depositId) {
        console.error("❌ Missing depositId:", data);
        throw new Error("Deposit ID not generated. Please try again.");
      }

      console.log("✅ Redirecting to payment checkout:", checkoutUrl);

      if (onSuccess) {
        onSuccess({
          depositId,
          amount: data.amount,
          gateway: selectedGateway.gateway,
          provider: data.provider,
        });
      }

      onClose?.();
      window.location.href = checkoutUrl;

    } catch (e) {
      console.error("❌ Deposit error:", e);
      
      Swal.fire({
        icon: "error",
        title: "Deposit Failed",
        text: e?.message || texts.failedToStartPayment,
        confirmButtonColor: "#00b877",
      });
      
      setStatusText(e?.message || texts.failedToStartPayment);
      setLoading(false);
    }
  };

  const getLogoPath = (method) => {
    if (method.imageUrl) {
      return method.imageUrl;
    }

    const logoMap = {
      plisio: "/payment_logo/plisio.png",
      hoodpay: "/payment_logo/hoodpay.jpeg",
      nowpayment: "/payment_logo/now_payments.png",
      changenow: "/payment_logo/changenow.png",
      cryptomus: "/payment_logo/cryptomus.png",
      paygate: "/payment_logo/paygate.png",
      volet: "/payment_logo/volet.png",
      stripe: "/payment_logo/stripe.png",
    };
    return logoMap[method.gateway] || "/payment_logo/default.png";
  };

  const getPaymentType = (gateway) => {
    const typeMap = {
      plisio: texts.card,
      hoodpay: texts.payment,
      nowpayment: texts.card,
      changenow: texts.exchange,
      cryptomus: texts.card,
      paygate: texts.card,
      volet: texts.card,
    };
    return typeMap[gateway] || texts.payment;
  };

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

  const getApplicableBonuses = (method, amount) => {
    if (!method.bonusSettings || method.bonusSettings.length === 0) return [];

    const activeBonuses = method.bonusSettings.filter(
      (bonus) => bonus.isActive
    );
    if (activeBonuses.length === 0) return [];

    const applicableBonuses = activeBonuses
      .filter((bonus) => amount >= bonus.minAmount)
      .sort((a, b) => b.bonusPercentage - a.bonusPercentage);

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

        <h3 className="text-white text-lg sm:text-xl font-bold mb-4">
          {texts.addFunds}
        </h3>

        {/* Amount Input with Real-time Validation */}
        <div className="mb-6">
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
            className={`w-full bg-[#0c171c] border-2 rounded px-3 py-2 text-white focus:outline-none transition-colors ${
              validationStatus === 'valid' 
                ? 'border-green-500 focus:border-green-400' 
                : validationStatus === 'invalid'
                ? 'border-red-500 focus:border-red-400'
                : 'border-white/15 focus:border-cyan-400'
            }`}
          />
          {/* Helper Text */}
          {helperText && (
            <p className={`text-xs mt-2 ${
              validationStatus === 'valid' 
                ? 'text-green-400' 
                : validationStatus === 'invalid'
                ? 'text-red-400'
                : 'text-gray-400'
            }`}>
              {helperText}
            </p>
          )}
        </div>

        {/* Auto-show Payment Methods when amount is entered */}
        {amount && Number(amount) > 0 && (
          <div className="mb-6">
            <h4 className="text-white text-base font-semibold mb-3">
              {texts.selectPaymentMethod}
            </h4>

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

                      {highestBonus && (
                        <div className="text-xs text-green-600 font-medium">
                          +{highestBonus.bonusPercentage}% {texts.bonusText}
                        </div>
                      )}

                      {highestBonus && (
                        <div className="text-xs text-gray-500">
                          {texts.min} ${highestBonus.minAmount} {texts.minToGet}
                        </div>
                      )}

                      {method.feeSettings && method.feeSettings.isActive && (
                        <div className="text-xs text-red-500 font-medium">
                          {texts.serviceFeeLabel}{" "}
                          {method.feeSettings.feeType === "percentage"
                            ? `${method.feeSettings.feePercentage}%`
                            : `$${method.feeSettings.fixedAmount}`}
                        </div>
                      )}

                      {method.feeSettings && method.feeSettings.isActive && (
                        <div className="text-xs text-red-400 font-medium">
                          {texts.total}: ${feeInfo.totalAmount.toFixed(2)}
                        </div>
                      )}

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
          </div>
        )}

        {/* PayGate Provider Selection (Auto-show when PayGate selected) */}
        {selectedGateway?.gateway === 'paygate' && (
          <div className="mb-6">
            <div className="mb-6">
              <button
                onClick={() => {
                  setSelectedGateway(null);
                  setSelectedProvider(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-2 text-sm transition-colors"
              >
                <span>←</span> {texts.changePaymentMethod || "Back to Payment Methods"}
              </button>
              
              <h3 className="text-white text-2xl font-bold mb-2">
                {texts.selectPaymentProvider}
              </h3>
              <p className="text-gray-400 text-sm">
                Choose how you want to pay with PayGate
              </p>
            </div>

            {loadingProviders ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
              </div>
            ) : (
              <>
                {/* Card Providers */}
                {paygateProviders.card && paygateProviders.card.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white text-lg font-semibold mb-3 flex items-center gap-2">
                      💳 {texts.cardPayments || "Card Payments"}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {paygateProviders.card.map((provider) => {
                        const isSelected = selectedProvider?.code === provider.code;
                        const isAmountValid = Number(amount) >= provider.minAmount;

                        return (
                          <button
                            key={provider.code}
                            onClick={() => setSelectedProvider(provider)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-cyan-500 bg-cyan-500/10'
                                : isAmountValid
                                ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                : 'border-gray-800 bg-gray-900/50 opacity-60 cursor-not-allowed'
                            }`}
                            disabled={!isAmountValid}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-left flex-1">
                                <p className="text-white font-semibold">{provider.name}</p>
                                <p className="text-gray-400 text-xs mt-1">{provider.description}</p>
                                <p className={`text-xs mt-2 ${isAmountValid ? 'text-cyan-400' : 'text-red-400'}`}>
                                  {texts.min}: ${provider.minAmount}
                                </p>
                                {!isAmountValid && (
                                  <p className="text-red-400 text-xs mt-1">
                                    {texts.youNeedMore || "Need"} ${(provider.minAmount - Number(amount)).toFixed(2)} {texts.moreFor || "more"}
                                  </p>
                                )}
                              </div>
                              <div className="text-3xl ml-4">{provider.icon}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Payment Summary & Confirmation (Auto-show when method selected) */}
        {selectedGateway && (selectedGateway.gateway !== 'paygate' || selectedProvider) && (
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex-1 text-center">
                Payment Summary
              </h4>
              <button
                onClick={() => {
                  setSelectedGateway(null);
                  setSelectedProvider(null);
                }}
                className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                title="Change payment method"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{texts.method}</span>
                <span className="text-white font-medium">
                  {selectedGateway.name}
                </span>
              </div>

              {selectedProvider && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{texts.provider}</span>
                  <span className="text-cyan-400 font-medium">
                    {selectedProvider.name}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{texts.depositAmount}</span>
                <span className="text-white font-medium">
                  ${Number(amount).toFixed(2)}
                </span>
              </div>

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
                          ${feeInfo.feeAmount.toFixed(2)}
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

              {(() => {
                const bonuses = getApplicableBonuses(
                  selectedGateway,
                  Number(amount)
                );
                if (bonuses.length > 0) {
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
              className="mt-4 w-full py-2 bg-cyan-400 text-black rounded font-semibold hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>{texts.processing}</span>
                </div>
              ) : (
                texts.confirmPayment
              )}
            </button>

            {!loading && (
              <button
                onClick={() => {
                  setSelectedGateway(null);
                  setSelectedProvider(null);
                }}
                className="mt-2 w-full py-2 bg-gray-700 text-gray-300 rounded font-medium hover:bg-gray-600 transition-colors"
              >
                ← {texts.changePaymentMethod}
              </button>
            )}

            {!!statusText && !loading && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
                <p className="text-sm text-red-500 text-center">{statusText}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}