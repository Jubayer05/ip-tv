"use client";
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function GatewaySelectPopup({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [guide, setGuide] = useState({ title: "", content: "" });
  const [loadingGuide, setLoadingGuide] = useState(true);
  
  // NEW: PayGate multi-provider support
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [paygateProviders, setPaygateProviders] = useState({ card: [], crypto: [] });
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showProviderSelection, setShowProviderSelection] = useState(false);

  // Fetch payment methods when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
      fetchGuide();
      
      // Reset states when popup opens
      setSelectedGateway(null);
      setSelectedProvider(null);
      setShowProviderSelection(false);
      setPaygateProviders({ card: [], crypto: [] });
      
      console.log("🔵 [GatewaySelectPopup] Popup opened, states reset");
    }
  }, [isOpen]);
  
  // Fetch PayGate providers when PayGate is selected
  useEffect(() => {
    if (selectedGateway?.gateway === 'paygate') {
      console.log("🔵 [GatewaySelectPopup] PayGate selected, fetching providers...");
      fetchPaygateProviders();
    }
  }, [selectedGateway]);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      console.log("🔵 [GatewaySelectPopup] Fetching payment methods...");
      
      const response = await fetch("/api/payment-settings");
      const data = await response.json();

      if (data.success) {
        // Filter only active payment methods
        const activeMethods = data.data.filter((method) => method.isActive);
        setPaymentMethods(activeMethods);
        
        console.log("✅ [GatewaySelectPopup] Payment methods loaded:", {
          total: activeMethods.length,
          gateways: activeMethods.map(m => m.gateway),
        });
      }
    } catch (error) {
      console.error("❌ [GatewaySelectPopup] Error fetching payment methods:", error);
    } finally {
      setLoadingMethods(false);
    }
  };
  
  const fetchPaygateProviders = async () => {
    try {
      setLoadingProviders(true);
      console.log("🔵 [GatewaySelectPopup] Fetching PayGate providers...");
      
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
        
        console.log("✅ [GatewaySelectPopup] Active PayGate providers loaded:", {
          card: activeProviders.card.length,
          crypto: activeProviders.crypto.length,
          bank: activeProviders.bank.length,
          cardOptions: activeProviders.card.map(p => p.code),
        });
        
        setPaygateProviders(activeProviders);
        
        // Auto-select first card provider as default
        if (activeProviders.card.length > 0) {
          setSelectedProvider(activeProviders.card[0]);
          console.log("✅ [GatewaySelectPopup] Auto-selected provider:", activeProviders.card[0].code);
        }
      }
    } catch (error) {
      console.error("❌ [GatewaySelectPopup] Error fetching PayGate providers:", error);
    } finally {
      setLoadingProviders(false);
    }
  };

  const fetchGuide = async () => {
    try {
      setLoadingGuide(true);
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data?.success) {
        const ug = data.settings?.legalContent?.userGuide || {};
        setGuide({
          title: ug.title || "User Guide",
          content: ug.content || "",
        });
      } else {
        setGuide({ title: "", content: "" });
      }
    } catch (e) {
      setGuide({ title: "", content: "" });
    } finally {
      setLoadingGuide(false);
    }
  };

  if (!isOpen) return null;

  const startPayment = async (gateway) => {
    if (loading) return;
    
    console.log("🔵 [GatewaySelectPopup] startPayment called:", { gateway });
    
    // If PayGate is selected, show provider selection
    if (gateway === 'paygate') {
      const paygateMethod = paymentMethods.find(m => m.gateway === 'paygate');
      if (paygateMethod) {
        setSelectedGateway(paygateMethod);
        setShowProviderSelection(true);
        console.log("🔵 [GatewaySelectPopup] Showing PayGate provider selection");
        return;
      }
    }
    
    // For other gateways, proceed with normal flow
    processPayment(gateway, null);
  };
  
  const processPayment = async (gateway, provider = null) => {
    setStatusText("");
    setLoading(true);
    
    console.log("🔵 [GatewaySelectPopup] processPayment started:", { 
      gateway, 
      provider,
      hasProvider: !!provider 
    });
    
    try {
      const selRaw = localStorage.getItem("cs_order_selection");
      const sel = selRaw ? JSON.parse(selRaw) : null;
      
      console.log("🔵 [GatewaySelectPopup] Order selection:", {
        hasSelection: !!sel,
        amount: sel?.priceCalculation?.finalTotal,
        productId: sel?.productId,
      });
      
      if (!sel || !sel.priceCalculation?.finalTotal) {
        throw new Error("Missing selection or amount");
      }

      const amount = Number(sel.priceCalculation.finalTotal);
      if (!amount || amount <= 0) throw new Error("Invalid amount");

      // Determine customer email and contact info
      const customerEmail = user?.email || sel.guestContactInfo?.email || "";
      const contactInfo = user
        ? {
            fullName:
              `${user?.profile?.firstName || ""} ${
                user?.profile?.lastName || ""
              }`.trim() ||
              user?.profile?.username ||
              user?.email,
            email: user?.email,
            phone: user?.profile?.phone || "",
          }
        : sel.guestContactInfo;

      const payload = {
        amount,
        currency: "USD",
        userId: user?._id || null,
        customerEmail,
        contactInfo, // Add contactInfo for guest users
        type: "subscription",
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
      
      // Add provider for PayGate
      if (gateway === 'paygate' && provider) {
        payload.provider = provider;
        payload.preferredProvider = provider;
        payload.userRegion = 'US'; // You can detect this from user's location
        
        console.log("🔵 [GatewaySelectPopup] PayGate payload with provider:", {
          provider: payload.provider,
          preferredProvider: payload.preferredProvider,
          userRegion: payload.userRegion,
        });
      }
      
      console.log("🔵 [GatewaySelectPopup] Creating payment:", {
        gateway,
        amount: payload.amount,
        currency: payload.currency,
        userId: payload.userId,
        provider: payload.provider || 'N/A',
        hasContactInfo: !!payload.contactInfo,
      });

      const res = await fetch(`/api/payments/${gateway}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      console.log("📡 [GatewaySelectPopup] Payment API response:", {
        status: res.status,
        ok: res.ok,
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("❌ [GatewaySelectPopup] Payment API error:", err);
        throw new Error(err?.error || `Failed to create ${gateway} payment`);
      }
      
      const data = await res.json();
      
      console.log("✅ [GatewaySelectPopup] Payment data received:", {
        success: data?.success,
        paymentId: data?.paymentId,
        hasCheckoutUrl: !!data?.checkoutUrl,
        provider: data?.provider,
      });
      
      const paymentId = data?.paymentId;
      const checkoutUrl = data?.checkoutUrl;

      if (!paymentId || !checkoutUrl) {
        console.error("❌ [GatewaySelectPopup] Missing required data:", {
          hasPaymentId: !!paymentId,
          hasCheckoutUrl: !!checkoutUrl,
        });
        throw new Error("Invalid payment creation response");
      }

      console.log("✅ [GatewaySelectPopup] Opening checkout URL:", checkoutUrl);

      // Open provider checkout in new tab
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");

      // Redirect to payment status page instead of polling here
      window.location.href = `/payment-status/${paymentId}?provider=${gateway}`;

      // Close the popup
      onClose?.();
    } catch (e) {
      console.error("❌ [GatewaySelectPopup] Payment error:", e);
      setStatusText(e?.message || "Failed to start payment");
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

  // Helper function to get display name
  const getDisplayName = (gateway) => {
    const nameMap = {
      plisio: "Plisio",
      hoodpay: "HoodPay",
      nowpayment: "NOWPayments",
      changenow: "ChangeNOW",
      cryptomus: "Cryptomus",
      paygate: "PayGate",
      volet: "Volet",
    };
    return nameMap[gateway] || gateway;
  };

  // Helper function to get payment type
  const getPaymentType = (gateway) => {
    const typeMap = {
      plisio: "Crypto",
      hoodpay: "Payment",
      nowpayment: "Crypto",
      changenow: "Exchange",
      cryptomus: "Crypto",
      paygate: "Crypto",
      volet: "Crypto",
    };
    return typeMap[gateway] || "Payment";
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60] font-secondary">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 w-full max-w-2xl mx-auto relative border border-gray-700 shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Add custom styles for hiding scrollbar */}
        <style jsx>{`
          .hide-scrollbar {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none; /* Chrome, Safari and Opera */
          }
        `}</style>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="Close gateway selection popup"
        >
          <X size={24} />
        </button>

        {/* Scrollable content wrapper */}
        <div className="overflow-y-auto max-h-[calc(90vh-3rem)] hide-scrollbar">
          {/* Main Content: Payment Methods */}
          {!showProviderSelection && (
            <>
              <div className="mb-6">
                <h3 className="text-white text-2xl font-bold mb-2">
                  Choose Payment Method
                </h3>
                <p className="text-gray-400 text-sm">
                  Select your preferred payment gateway to complete the purchase
                </p>
              </div>

              {loadingMethods ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No payment methods available</p>
                </div>
              ) : (
                <>
                  {/* Payment Methods Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {paymentMethods.map((method) => {
                      const selRaw = localStorage.getItem("cs_order_selection");
                      const sel = selRaw ? JSON.parse(selRaw) : null;
                      const amount = sel?.priceCalculation?.finalTotal || 0;
                      const feeInfo = calculateServiceFee(method, amount);

                      return (
                        <button
                          key={method._id}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-cyan-500 text-white py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 flex flex-col items-center justify-center space-y-2 min-h-[100px] group"
                          onClick={() => startPayment(method.gateway)}
                          disabled={loading}
                        >
                          <Image
                            src={getLogoPath(method)}
                            alt={method.name}
                            width={50}
                            height={25}
                            className="object-contain h-8 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                          <span className="text-xs text-gray-400 group-hover:text-cyan-400">
                            {getPaymentType(method.gateway)}
                          </span>

                          {method.feeSettings && method.feeSettings.isActive && (
                            <div className="text-center">
                              <span className="text-[10px] text-yellow-400 block">
                                +
                                {method.feeSettings.feeType === "percentage"
                                  ? `${method.feeSettings.feePercentage}%`
                                  : `$${method.feeSettings.fixedAmount}`}{" "}
                                fee
                              </span>
                              <span className="text-xs text-white font-semibold">
                                ${feeInfo.totalAmount.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Help Section from settings (User Guide) */}
                  {!loadingGuide && guide?.content && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-4">
                      <h4 className="text-white text-sm font-semibold mb-2">
                        {guide.title || "User Guide"}
                      </h4>
                      <div
                        className="prose prose-invert prose-sm max-w-none text-gray-300"
                        dangerouslySetInnerHTML={{ __html: guide.content }}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* PayGate Provider Selection */}
          {showProviderSelection && selectedGateway?.gateway === 'paygate' && (
            <>
              <div className="mb-6">
                <button
                  onClick={() => {
                    setShowProviderSelection(false);
                    setSelectedGateway(null);
                    setSelectedProvider(null);
                    console.log("🔵 [GatewaySelectPopup] Back to payment methods");
                  }}
                  className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-2"
                >
                  <span>←</span> Back to Payment Methods
                </button>
                
                <h3 className="text-white text-2xl font-bold mb-2">
                  Select Payment Provider
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
                      <h4 className="text-white text-lg font-semibold mb-3">
                        💳 Card Payments
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {paygateProviders.card.map((provider) => (
                          <button
                            key={provider.code}
                            onClick={() => {
                              setSelectedProvider(provider);
                              console.log("✅ [GatewaySelectPopup] Provider selected:", provider.code);
                            }}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedProvider?.code === provider.code
                                ? 'border-cyan-500 bg-cyan-500/10'
                                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-left">
                                <p className="text-white font-semibold">{provider.name}</p>
                                <p className="text-gray-400 text-xs mt-1">{provider.description}</p>
                                <p className="text-cyan-400 text-xs mt-2">
                                  Min: ${provider.minAmount}
                                </p>
                              </div>
                              <div className="text-2xl">{provider.icon}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confirm Button */}
                  <button
                    onClick={() => {
                      if (!selectedProvider) {
                        console.warn("⚠️ [GatewaySelectPopup] No provider selected");
                        return;
                      }
                      console.log("🔵 [GatewaySelectPopup] Confirming payment with provider:", selectedProvider.code);
                      processPayment('paygate', selectedProvider.code);
                    }}
                    disabled={!selectedProvider || loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Processing...
                      </span>
                    ) : (
                      `Continue with ${selectedProvider?.name || 'Selected Provider'}`
                    )}
                  </button>
                </>
              )}
            </>
          )}

          {!!statusText && (
            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-sm text-cyan-400 text-center flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400 inline-block"></span>
                {statusText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
