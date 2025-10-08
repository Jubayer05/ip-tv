import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import GatewaySelectPopup from "./GatewaySelectPopup";
import NotRegisterPopup from "./NotRegisterPopup";
import PaymentConfirmPopup from "./PaymentConfirmPopup";
import ThankRegisterPopup from "./ThankRegisterPopup";

export default function RegisterFormPopup({ isOpen, onClose }) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [fullName, setFullName] = useState("Guest User");
  const [email, setEmail] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [showNotRegister, setShowNotRegister] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showGatewaySelect, setShowGatewaySelect] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Original text constants
  const ORIGINAL_TEXTS = {
    title: "THANK YOU FOR YOUR ORDER!",
    subtitle:
      "Check your email for IPTV details and a secure link to view your order history.",
    form: {
      email: "Email",
      emailPlaceholder: "Enter email",
      submitButton: "Proceed With Checkout",
      processingButton: "Processing...",
    },
    footer: {
      or: "Or",
      createAccount: "Create an Account",
      toUnlock: "to unlock even more benefits",
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
          ...Object.values(ORIGINAL_TEXTS.form),
          ...Object.values(ORIGINAL_TEXTS.footer),
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const [tTitle, tSubtitle, ...tForm] = translated;
        const tFooter = tForm.slice(6);

        setTexts({
          title: tTitle,
          subtitle: tSubtitle,
          form: {
            fullName: tForm[0],
            email: tForm[1],
            fullNamePlaceholder: tForm[2],
            emailPlaceholder: tForm[3],
            submitButton: tForm[4],
            processingButton: tForm[5],
          },
          footer: {
            or: tFooter[0],
            createAccount: tFooter[1],
            toUnlock: tFooter[2],
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

  // Load order details when popup opens
  useEffect(() => {
    if (isOpen) {
      loadOrderDetails();
    }
  }, [isOpen]);

  const loadOrderDetails = () => {
    try {
      const selRaw = localStorage.getItem("cs_order_selection");
      const sel = selRaw ? JSON.parse(selRaw) : null;
      if (sel) {
        setOrderDetails(sel);
      }
    } catch (error) {
      console.error("Error loading order details:", error);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleGuestOrder = async () => {
    if (submitting) return;
    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please enter your email",
        confirmButtonColor: "#00b877",
        confirmButtonText: "OK",
      });
      return;
    }

    // Store guest contact info for payment gateway
    try {
      const selRaw = localStorage.getItem("cs_order_selection");
      const sel = selRaw ? JSON.parse(selRaw) : null;
      if (sel) {
        // Add guest contact information to the selection data
        const updatedSelection = {
          ...sel,
          guestContactInfo: {
            fullName: fullName || "Guest User",
            email: email,
            phone: "",
          },
        };
        localStorage.setItem(
          "cs_order_selection",
          JSON.stringify(updatedSelection)
        );
      }
    } catch (error) {
      console.error("Error storing guest contact info:", error);
    }

    // Instead of creating order directly, show payment gateway selection
    setShowGatewaySelect(true);
  };

  const handlePaymentSuccess = async () => {
    setSubmitting(true);
    try {
      const selRaw = localStorage.getItem("cs_order_selection");
      const sel = selRaw ? JSON.parse(selRaw) : null;
      if (!sel || !sel.productId || !sel.variantId) {
        throw new Error("Missing order selection");
      }

      const payload = {
        productId: sel.productId,
        variantId: sel.variantId,
        quantity: Number(
          sel.isCustomQuantity ? sel.quantity || 1 : sel.quantity || 1
        ),
        devicesAllowed: Number(sel.devices || 1),
        adultChannels: !!sel.adultChannels,
        guestEmail: email,
        contactInfo: { fullName, email, phone: "" },
        paymentMethod: "Gateway", // Updated to indicate gateway payment
        paymentGateway: "Selected", // Will be updated by gateway selection
        paymentStatus: "completed", // Ensure completion after successful payment

        // IPTV Configuration - include val and con parameters
        lineType: sel.lineType || 0,
        templateId: sel.templateId || 2,
        macAddresses: sel.macAddresses || [],
        adultChannelsConfig: sel.adultChannelsConfig || [],
        generatedCredentials: sel.generatedCredentials || [],
        val: sel.val || getPackageIdFromDuration(sel.plan?.duration || 1),
        con: sel.con || Number(sel.devices || 1),
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
        } else {
          console.error(
            "Failed to create IPTV accounts:",
            await iptvResponse.text()
          );
        }
      } catch (iptvError) {
        console.error("Error creating IPTV accounts:", iptvError);
      }

      // Send confirmation email
      try {
        await fetch("/api/orders/send-confirmation-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.order._id,
            paymentMethod: "Gateway",
          }),
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      try {
        localStorage.setItem("cs_last_order", JSON.stringify(data.order));
      } catch {}

      // SHOW PAYMENT CONFIRM POPUP
      setShowPaymentConfirm(true);
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: e?.message || "Failed to place order",
      });
    } finally {
      // reset the initial state
      setFullName("");
      setEmail("");
      setSubmitting(false);
    }
  };

  const closeThankYou = () => {
    setShowThankYou(false);
    onClose();
  };

  const handleCreateAccount = () => {
    setShowNotRegister(true);
  };

  const closeNotRegister = () => {
    setShowNotRegister(false);
  };

  const closePaymentConfirm = () => {
    setShowPaymentConfirm(false);
    onClose(); // Close the main popup after payment confirmation
  };

  const closeGatewaySelect = () => {
    setShowGatewaySelect(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
        {/* Modal Content */}
        <div className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto relative border border-[#FFFFFF26]">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white hover:text-gray-300 transition-colors"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 tracking-wide">
              {texts.title}
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-secondary">
              {texts.subtitle}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 sm:space-y-6 font-secondary">
            {/* Email Field */}
            <div>
              <label className="block text-white text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                {texts.form.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={texts.form.emailPlaceholder}
                className="w-full bg-[#0c171c] border border-[#FFFFFF26] rounded-full px-4 sm:px-6 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-cyan-400 transition-colors text-sm sm:text-base"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGuestOrder}
              disabled={submitting}
              className="cursor-pointer w-full bg-cyan-400 text-black py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 mt-6 sm:mt-8 font-secondary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  {texts.form.processingButton}
                </>
              ) : (
                <>
                  {texts.form.submitButton}
                  <ArrowRight size={16} className="sm:w-5 sm:h-5" />
                </>
              )}
            </button>

            {/* Footer Text */}
            <p className="text-center text-gray-300 text-xs sm:text-sm mt-4 sm:mt-6 font-secondary">
              {texts.footer.or}{" "}
              <button
                onClick={handleCreateAccount}
                className="text-white/75 hover:text-cyan-300 underline cursor-pointer"
              >
                {texts.footer.createAccount}
              </button>{" "}
              {texts.footer.toUnlock}
            </p>
          </div>
        </div>
      </div>

      {/* Thank You Popup */}
      <ThankRegisterPopup isOpen={showThankYou} onClose={closeThankYou} />

      {/* Not Register Popup */}
      <NotRegisterPopup isOpen={showNotRegister} onClose={closeNotRegister} />

      {/* Payment Confirm Popup */}
      <PaymentConfirmPopup
        isOpen={showPaymentConfirm}
        onClose={closePaymentConfirm}
      />

      {/* Gateway Selection Popup */}
      <GatewaySelectPopup
        isOpen={showGatewaySelect}
        onClose={closeGatewaySelect}
        onSuccess={handlePaymentSuccess}
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
