"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Check, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import BalanceCheckoutPopup from "./BalanceCheckoutPopup";
import GatewaySelectPopup from "./GatewaySelectPopup";
import PaymentConfirmPopup from "./PaymentConfirmPopup";

export default function ThankRegisterPopup({ isOpen, onClose }) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user } = useAuth();
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [showGatewaySelect, setShowGatewaySelect] = useState(false);
  const [showBalanceCheckout, setShowBalanceCheckout] = useState(false);

  // Original text constants
  const ORIGINAL_TEXTS = {
    title: "THANK YOU FOR YOUR ORDER!",
    subtitle:
      "Check your email for IPTV details and a secure link to view your order history.",
    buttons: {
      backToHome: "Back To Home Page",
      paymentConfirm: "Confirm Your Payment",
      payWithBalance: "Pay with Balance",
      cancel: "Cancel",
    },
    footer: {
      receipt: "A receipt has been sent to your email.",
      contact: "For questions, contact: info@iptvstore.com",
    },
  };

  // State for translated content
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        const items = [
          ORIGINAL_TEXTS.title,
          ORIGINAL_TEXTS.subtitle,
          ...Object.values(ORIGINAL_TEXTS.buttons),
          ...Object.values(ORIGINAL_TEXTS.footer),
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const [tTitle, tSubtitle, ...tButtons] = translated;
        const tFooter = tButtons.slice(4);

        setTexts({
          title: tTitle,
          subtitle: tSubtitle,
          buttons: {
            backToHome: tButtons[0],
            paymentConfirm: tButtons[1],
            payWithBalance: tButtons[2],
            cancel: tButtons[3],
          },
          footer: {
            receipt: tFooter[0],
            contact: tFooter[1],
          },
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const handlePaymentConfirm = async () => {
    if (placing) return;
    setPlacing(true);
    try {
      const selRaw = localStorage.getItem("cs_order_selection");
      const sel = selRaw ? JSON.parse(selRaw) : null;
      if (!sel || !sel.productId || !sel.variantId) {
        throw new Error("Missing order selection");
      }

      const payload = {
        userId: user?._id,
        productId: sel.productId,
        variantId: sel.variantId,
        quantity: Number(
          sel.isCustomQuantity ? sel.quantity || 1 : sel.quantity || 1
        ),
        devicesAllowed: Number(sel.devices || 1),
        adultChannels: !!sel.adultChannels,
        couponCode: "",
        paymentMethod: "Manual",
        paymentGateway: "None",
        paymentStatus: "completed", // ensure completion on create
        
        // IPTV Configuration - include val and con parameters
        lineType: sel.lineType || 0,
        templateId: sel.templateId || 2,
        macAddresses: sel.macAddresses || [],
        adultChannelsConfig: sel.adultChannelsConfig || [],
        generatedCredentials: sel.generatedCredentials || [],
        val: sel.val || getPackageIdFromDuration(sel.plan?.duration || 1), // Add val parameter
        con: sel.con || Number(sel.devices || 1), // Add con parameter
        
        contactInfo: {
          fullName:
            `${user?.profile?.firstName || ""} ${
              user?.profile?.lastName || ""
            }`.trim() ||
            user?.profile?.username ||
            user?.email,
          email: user?.email,
          phone: user?.profile?.phone || "",
        },
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to place order");
      }
      const data = await res.json();

      // Fallback: if backend still returns pending, force-complete it
      if (data?.order?._id && data?.order?.paymentStatus !== "completed") {
        await fetch(`/api/orders/${data.order._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus: "completed" }),
        });
      }

      // Create IPTV accounts with val and con parameters
      try {
        const iptvResponse = await fetch("/api/iptv/create-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: data.order.orderNumber,
            val: sel.val || getPackageIdFromDuration(sel.plan?.duration || 1),
            con: sel.con || Number(sel.devices || 1),
          }),
        });

        if (iptvResponse.ok) {
          const iptvData = await iptvResponse.json();
          console.log("IPTV accounts created:", iptvData);
        } else {
          console.error(
            "Failed to create IPTV accounts:",
            await iptvResponse.text()
          );
        }
      } catch (iptvError) {
        console.error("Error creating IPTV accounts:", iptvError);
      }

      try {
        localStorage.setItem("cs_last_order", JSON.stringify(data.order));
      } catch {}
      setShowPaymentConfirm(true);
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: e?.message || "Failed to place order",
      });
    } finally {
      setPlacing(false);
    }
  };

  const closePaymentConfirm = () => {
    setShowPaymentConfirm(false);
  };

  const handleBalancePaymentSuccess = () => {
    setShowPaymentConfirm(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 font-secondary">
        <div className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:pm-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-[lg] mx-auto relative border border-[#FFFFFF26]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white hover:text-gray-300 transition-colors"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>

          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-cyan-400 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
              <Check
                size={24}
                className="text-black font-bold sm:w-8 sm:h-8 md:w-8 md:h-8"
                strokeWidth={3}
              />
            </div>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 tracking-wide">
              {texts.title}
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              {texts.subtitle}
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Pay with Balance Button - Only show if user has balance */}
            {user?.balance > 0 && (
              <button
                onClick={() => setShowBalanceCheckout(true)}
                disabled={placing}
                className="w-full bg-green-600 text-white py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-green-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Wallet size={16} className="sm:w-5 sm:h-5" />
                {texts.buttons.payWithBalance}
                <span className="text-xs opacity-75">
                  (${user?.balance?.toFixed(2)})
                </span>
              </button>
            )}

            <button
              onClick={() => setShowGatewaySelect(true)}
              disabled={placing}
              className="w-full bg-cyan-400 text-black py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {texts.buttons.paymentConfirm}
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={onClose}
              className="w-full bg-transparent border-2 border-primary text-primary py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-400 hover:text-black transition-colors"
            >
              {texts.buttons.cancel}
            </button>
          </div>

          <div className="text-center mt-6 sm:mt-8 space-y-2">
            <p className="text-gray-300 text-xs">{texts.footer.receipt}</p>
            <p className="text-gray-400 text-xs">{texts.footer.contact}</p>
          </div>
        </div>
      </div>

      <PaymentConfirmPopup
        isOpen={showPaymentConfirm}
        onClose={closePaymentConfirm}
      />

      <GatewaySelectPopup
        isOpen={showGatewaySelect}
        onClose={() => setShowGatewaySelect(false)}
        onSuccess={handlePaymentConfirm}
      />

      <BalanceCheckoutPopup
        isOpen={showBalanceCheckout}
        onClose={() => setShowBalanceCheckout(false)}
        onSuccess={handleBalancePaymentSuccess}
      />
    </>
  );
}

// Helper function to get package ID from duration
const getPackageIdFromDuration = (durationMonths) => {
  switch (durationMonths) {
    case 1:
      return 2; // 1 Month Subscription
    case 3:
      return 3; // 3 Month Subscription
    case 6:
      return 4; // 6 Month Subscription
    case 12:
      return 5; // 12 Month Subscription
    default:
      return 2; // Default to 1 month
  }
};
