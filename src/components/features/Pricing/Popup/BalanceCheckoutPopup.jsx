"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePayment } from "@/contexts/PaymentContext";
import { ArrowRight, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function BalanceCheckoutPopup({ isOpen, onClose, onSuccess }) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user } = useAuth();
  const { setOrderAndShowPopup } = usePayment();
  const [placing, setPlacing] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Original text constants
  const ORIGINAL_TEXTS = {
    title: "Pay with Balance",
    subtitle: "Complete your purchase using your account balance",
    orderSummary: "Order Summary",
    balance: "Current Balance",
    total: "Total Amount",
    confirm: "Confirm Payment",
    cancel: "Cancel",
    insufficient: "Insufficient Balance",
    processing: "Processing Payment...",
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
          ORIGINAL_TEXTS.orderSummary,
          ORIGINAL_TEXTS.balance,
          ORIGINAL_TEXTS.total,
          ORIGINAL_TEXTS.confirm,
          ORIGINAL_TEXTS.cancel,
          ORIGINAL_TEXTS.insufficient,
          ORIGINAL_TEXTS.processing,
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        setTexts({
          title: translated[0],
          subtitle: translated[1],
          orderSummary: translated[2],
          balance: translated[3],
          total: translated[4],
          confirm: translated[5],
          cancel: translated[6],
          insufficient: translated[7],
          processing: translated[8],
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

  const handleBalancePayment = async () => {
    if (placing) return;
    setPlacing(true);

    try {
      const selRaw = localStorage.getItem("cs_order_selection");
      const sel = selRaw ? JSON.parse(selRaw) : null;
      if (!sel || !sel.productId || !sel.variantId) {
        throw new Error("Missing order selection");
      }

      // Calculate total amount from the order selection data
      const totalAmount =
        sel.priceCalculation?.finalTotal ||
        sel.finalPrice ||
        sel.plan?.price ||
        0;

      // Check if user has sufficient balance
      if (user?.balance < totalAmount) {
        Swal.fire({
          icon: "error",
          title: texts.insufficient,
          text: `You need $${(totalAmount - user.balance).toFixed(
            2
          )} more to complete this purchase.`,
        });
        return;
      }

      const payload = {
        userId: user?._id,
        productId: sel.productId,
        variantId: sel.variantId,
        quantity: Number(
          sel.isCustomQuantity ? sel.quantity || 1 : sel.quantity || 1
        ),
        // Keep a single devicesAllowed for backward compatibility; per-account is in accountConfigurations
        devicesAllowed: Number(sel.selectedDevices || sel.devices || 1),
        adultChannels: !!sel.adultChannels,
        couponCode: sel.coupon?.code || "",
        paymentMethod: "Balance",
        paymentGateway: "Balance",
        paymentStatus: "completed",

        // Trust UI total for complex multi-account pricing
        totalAmount: totalAmount,

        // IPTV Configuration - include all fields from selection
        lineType: sel.lineType || 0,
        macAddresses: sel.macAddresses || [],
        adultChannelsConfig: sel.adultChannelsConfig || [],

        // Multi-account data
        accountConfigurations: sel.accountConfigurations || [],
        generatedCredentials: sel.generatedCredentials || [],

        // Package/devices
        val: sel.val || getPackageIdFromDuration(sel.plan?.duration || 1),
        con: sel.con || Number(sel.selectedDevices || sel.devices || 1),

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

      // Deduct balance and create transaction record
      const balanceResponse = await fetch("/api/admin/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          type: "purchase",
          amount: totalAmount,
          description: `Purchase: ${sel.plan?.name || "IPTV Service"}`,
        }),
      });

      if (!balanceResponse.ok) {
        const balanceErr = await balanceResponse.json().catch(() => ({}));
        throw new Error(balanceErr?.error || "Failed to deduct balance");
      }

      // Create IPTV accounts after successful payment
      try {
        // Get the actual quantity from selection data
        const actualQuantity = sel.isCustomQuantity
          ? parseInt(sel.customQuantity) || 1
          : parseInt(sel.quantity) || 1;

        const iptvResponse = await fetch("/api/iptv/create-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: data.order.orderNumber,
            val: sel.val || getPackageIdFromDuration(sel.plan?.duration || 1),
            con: sel.con || Number(sel.selectedDevices || sel.devices || 1),
          }),
        });

        if (iptvResponse.ok) {
          const iptvData = await iptvResponse.json();

          // Set the order with credentials and show the popup
          setOrderAndShowPopup(iptvData.order);
        } else {
          console.error(
            "Failed to create IPTV accounts:",
            await iptvResponse.text()
          );
        }
      } catch (iptvError) {
        console.error("Error creating IPTV accounts:", iptvError);
        // Don't fail the entire process if IPTV creation fails
      }

      // Send confirmation email
      try {
        await fetch("/api/orders/send-confirmation-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.order._id,
            paymentMethod: "Balance",
          }),
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the entire process if email fails
      }

      // Store the order with the correct total amount for
      try {
        const orderWithCorrectAmount = {
          ...data.order,
          totalAmount: totalAmount, // Ensure the order has the correct discounted amount
        };
        localStorage.setItem(
          "cs_last_order",
          JSON.stringify(orderWithCorrectAmount)
        );
      } catch {}

      onSuccess && onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: e?.message || "Failed to process payment",
      });
    } finally {
      setPlacing(false);
    }
  };

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

  if (!isOpen || !orderDetails) return null;

  // Calculate total amount from the order selection data
  const totalAmount =
    orderDetails.priceCalculation?.finalTotal ||
    orderDetails.finalPrice ||
    orderDetails.plan?.price ||
    0;
  const hasInsufficientBalance = user?.balance < totalAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 font-secondary">
      <div className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:pm-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto relative border border-[#FFFFFF26]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white hover:text-gray-300 transition-colors"
          aria-label="Close balance checkout popup"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>

        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="bg-cyan-400 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
            <Wallet
              size={24}
              className="text-black font-bold sm:w-8 sm:h-8 md:w-8 md:h-8"
              strokeWidth={2}
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

        {/* Order Summary */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">
            {texts.orderSummary}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Service:</span>
              <span className="text-white">
                {orderDetails.plan?.name || "IPTV Subscription"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Duration:</span>
              <span className="text-white">
                {orderDetails.plan?.duration || orderDetails.duration || "1"}{" "}
                month(s)
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Devices:</span>
              <span className="text-white">
                {orderDetails.selectedDevices || orderDetails.devices || 1}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Quantity:</span>
              <span className="text-white">{orderDetails.quantity || 1}</span>
            </div>
            {orderDetails.coupon && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Coupon:</span>
                <span className="text-green-400">
                  {orderDetails.coupon.code}
                </span>
              </div>
            )}
            <div className="border-t border-gray-600 pt-2 mt-3">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-gray-300">{texts.total}:</span>
                <span className="text-white">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">{texts.balance}:</span>
            <span
              className={`text-lg font-semibold ${
                hasInsufficientBalance ? "text-red-400" : "text-green-400"
              }`}
            >
              ${user?.balance?.toFixed(2) || "0.00"}
            </span>
          </div>
          {hasInsufficientBalance && (
            <p className="text-red-400 text-xs mt-2">{texts.insufficient}</p>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={handleBalancePayment}
            disabled={placing || hasInsufficientBalance}
            className="w-full bg-cyan-400 text-black py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {placing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                {texts.processing}
              </>
            ) : (
              <>
                {texts.confirm}
                <ArrowRight size={16} className="sm:w-5 sm:h-5" />
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full bg-transparent border-2 border-primary text-primary py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-400 hover:text-black transition-colors"
          >
            {texts.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
