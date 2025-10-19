"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, BadgeDollarSign, Check, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import BalanceCheckoutPopup from "./BalanceCheckoutPopup";
import GatewaySelectPopup from "./GatewaySelectPopup";
import PaymentConfirmPopup from "./PaymentConfirmPopup";
// Add to imports at the top
import DepositPopup from "@/components/features/AffiliateRank/DepositPopup";

export default function ThankRegisterPopup({
  isOpen,
  onClose,
  // Add all the new props
  showPaymentConfirm,
  setShowPaymentConfirm,
  placing,
  setPlacing,
  showGatewaySelect,
  setShowGatewaySelect,
  showBalanceCheckout,
  setShowBalanceCheckout,
  showDepositPopup,
  setShowDepositPopup,
  orderWithCredentials,
  setOrderWithCredentials,
  handleBalancePaymentSuccess,
  handleDepositSuccess,
  handleDepositFunds,
}) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user } = useAuth();

  // Original text constants
  // Update the ORIGINAL_TEXTS object to include depositFunds
  const ORIGINAL_TEXTS = {
    title: "THANK YOU FOR YOUR ORDER!",
    subtitle:
      "Check your email for IPTV details and a secure link to view your order history.",
    buttons: {
      backToHome: "Back To Home Page",
      paymentConfirm: "Confirm Your Payment",
      payWithBalance: "Pay with Balance",
      depositFunds: "Deposit Funds", // Add this
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
        // Update the translation logic in useEffect (around line 49)
        const items = [
          ORIGINAL_TEXTS.title,
          ORIGINAL_TEXTS.subtitle,
          ...Object.values(ORIGINAL_TEXTS.buttons), // This will now include depositFunds
          ...Object.values(ORIGINAL_TEXTS.footer),
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const [tTitle, tSubtitle, ...tButtons] = translated;
        const tFooter = tButtons.slice(5); // Changed from 4 to 5 because we added one button

        setTexts({
          title: tTitle,
          subtitle: tSubtitle,
          buttons: {
            backToHome: tButtons[0],
            paymentConfirm: tButtons[1],
            payWithBalance: tButtons[2],
            depositFunds: tButtons[3], // Add this
            cancel: tButtons[4], // Changed from tButtons[3]
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
        // Keep a single devicesAllowed for backward compatibility; per-account is in accountConfigurations
        devicesAllowed: Number(sel.selectedDevices || sel.devices || 1),
        adultChannels: !!sel.adultChannels,
        couponCode: "",
        paymentMethod: "Manual",
        paymentGateway: "None",
        paymentStatus: "completed",

        // Trust UI total for complex multi-account pricing
        totalAmount: Number(sel.finalPrice || 0),

        // IPTV Configuration
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

      // Show loading indicator
      Swal.fire({
        title: "Processing Order...",
        text: "Please wait while we create your IPTV account",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

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

      // Create IPTV accounts
      let orderWithCreds = null;

      try {
        // Get the actual quantity from selection data
        const actualQuantity = sel.isCustomQuantity
          ? parseInt(sel.customQuantity) || 1
          : parseInt(sel.quantity) || 1;

        // Create IPTV accounts for each quantity
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
          Swal.update({
            title: "Creating IPTV Credentials...",
            text: `Creating ${actualQuantity} IPTV account(s), please wait...`,
          });

          // Retry fetching order with credentials (try up to 5 times)
          const maxRetries = 5;
          let credentialsFound = false;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            // Wait progressively longer: 1s, 1.5s, 2s, 2.5s, 3s
            await new Promise((resolve) =>
              setTimeout(resolve, attempt * 500 + 500)
            );

            const updatedOrderResponse = await fetch(
              `/api/orders/by-number/${data.order.orderNumber}`
            );

            if (updatedOrderResponse.ok) {
              const updatedData = await updatedOrderResponse.json();

              // Verify credentials exist and have the required data
              if (
                updatedData.order?.iptvCredentials &&
                updatedData.order.iptvCredentials.length > 0 &&
                updatedData.order.iptvCredentials[0].username &&
                updatedData.order.iptvCredentials[0].password
              ) {
                orderWithCreds = updatedData.order;
                localStorage.setItem(
                  "cs_last_order",
                  JSON.stringify(updatedData.order)
                );
                credentialsFound = true;
                break; // Success! Exit retry loop
              } 
            } else {
              console.error(
                `❌ Failed to fetch order (attempt ${attempt}):`,
                await updatedOrderResponse.text()
              );
            }
          }

          // Close loading and proceed based on whether we got credentials
          Swal.close();

          if (credentialsFound && orderWithCreds) {
            // SUCCESS: Show popup with credentials
            setOrderWithCredentials(orderWithCreds);
            setShowPaymentConfirm(true);
          } else {
            // FALLBACK: Credentials not ready, but order was created
            console.warn("⚠️ Could not fetch credentials in time");

            Swal.fire({
              icon: "warning",
              title: "Order Created",
              html: `
                Your order has been placed successfully!<br><br>
                <strong>Order Number:</strong> ${data.order.orderNumber}<br><br>
                Your IPTV credentials are being generated and will be sent to your email within a few minutes.<br><br>
                You can also check your order history to view the credentials.
              `,
              confirmButtonColor: "#00b877",
              confirmButtonText: "View Order History",
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.href = "/dashboard/orders";
              }
            });

            // Store order without credentials as fallback
            localStorage.setItem("cs_last_order", JSON.stringify(data.order));
          }
        } else {
          Swal.close();
          throw new Error(
            "Failed to create IPTV accounts: " + (await iptvResponse.text())
          );
        }
      } catch (iptvError) {
        Swal.close();
        console.error("❌ Error creating IPTV accounts:", iptvError);

        // Show error but still allow user to check order history
        Swal.fire({
          icon: "error",
          title: "IPTV Account Creation Issue",
          html: `
            Your order was placed but there was an issue creating your IPTV account.<br><br>
            <strong>Order Number:</strong> ${data.order.orderNumber}<br><br>
            Please contact support or check your order history in a few minutes.
          `,
          confirmButtonColor: "#00b877",
        });

        localStorage.setItem("cs_last_order", JSON.stringify(data.order));
      }
    } catch (e) {
      Swal.close();
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
    setOrderWithCredentials(null);
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
            {/* Pay with Balance Button */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowBalanceCheckout(true)}
                disabled={placing}
                className="w-full flex-[0.6]  bg-green-600 text-white py-2 rounded-full font-semibold text-xs sm:text-sm hover:bg-green-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Wallet size={16} className="sm:w-5 sm:h-5" />
                <div className="flex flex-col ">
                  {texts.buttons.payWithBalance}
                  <span className="text-xs opacity-75">
                    (${user?.balance?.toFixed(2)})
                  </span>
                </div>
              </button>

              {/* Deposit Funds Button - NEW */}
              <button
                onClick={handleDepositFunds}
                disabled={placing}
                className="w-full flex-[0.4] bg-purple-600 text-white py-2 rounded-full font-semibold text-xs sm:text-sm hover:bg-purple-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <BadgeDollarSign size={16} className="sm:w-5 sm:h-5" />
                {texts.buttons.depositFunds}
              </button>
            </div>

            {/* Payment Confirm Button */}
            <button
              onClick={() => setShowGatewaySelect(true)}
              disabled={placing}
              className="w-full bg-cyan-400 text-black py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {texts.buttons.paymentConfirm}
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
            </button>

            {/* Cancel Button */}
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
        order={orderWithCredentials}
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
      {/* Add this DepositPopup */}
      <DepositPopup
        isOpen={showDepositPopup}
        onClose={() => setShowDepositPopup(false)}
        onSuccess={handleDepositSuccess}
        userId={user?._id}
        userEmail={user?.email}
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
