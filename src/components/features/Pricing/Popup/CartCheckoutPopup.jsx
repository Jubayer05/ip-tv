"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function CartCheckoutPopup({ isOpen, onClose, onSuccess }) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

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
    quantity: "Quantity",
    accounts: "Account Configurations",
    devices: "devices",
    device: "device",
    adult: "Adult",
    nonAdult: "Non Adult",
    deviceType: "Device Type",
  };
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    if (!isLanguageLoaded || language.code === "en") return;
    let mounted = true;
    (async () => {
      try {
        const items = Object.values(ORIGINAL_TEXTS);
        const translated = await translate(items);
        if (!mounted) return;
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
          quantity: translated[9],
          accounts: translated[10],
          devices: translated[11],
          device: translated[12],
          adult: translated[13],
          nonAdult: translated[14],
          deviceType: translated[15],
        });
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  // Load order selection only when opening; no deps that change every render
  useEffect(() => {
    if (!isOpen) return;
    try {
      const selRaw = localStorage.getItem("cs_order_selection");
      const sel = selRaw ? JSON.parse(selRaw) : null;
      setOrderDetails(sel);
    } catch (e) {
      console.error("Error loading order details:", e);
    }
  }, [isOpen]);

  const getDeviceTypeName = (deviceType) => {
    switch (deviceType) {
      case 0:
        return "M3U Playlist";
      case 1:
        return "MAG Device";
      case 2:
        return "Enigma2";
      default:
        return "Unknown";
    }
  };
  const getDeviceTypeIcon = (deviceType) => {
    switch (deviceType) {
      case 0:
        return "📱";
      case 1:
        return "📺";
      case 2:
        return "📡";
      default:
        return "❓";
    }
  };

  const getPackageIdFromDuration = (durationMonths) => {
    switch (Number(durationMonths)) {
      case 1:
        return 2;
      case 3:
        return 3;
      case 6:
        return 4;
      case 12:
        return 5;
      default:
        return 2;
    }
  };

  const handleBalancePayment = async () => {
    if (placing) return;
    setPlacing(true);
    try {
      const sel = orderDetails;
      if (!sel || !Array.isArray(sel.cartItems) || sel.cartItems.length === 0) {
        throw new Error("Missing cart items");
      }

      // Process each cart item as its own order
      const createdOrders = [];
      const allIptvCredentials = [];

      for (const item of sel.cartItems) {
        console.log("Processing item:", item);
        console.log("Using variantId:", item.variantId);

        const payload = {
          userId: user?._id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          devicesAllowed: item.accounts.reduce((acc, a) => acc + a.devices, 0),
          adultChannels: item.accounts.some((a) => a.adultChannels),
          couponCode: item.coupon?.code || "",
          paymentMethod: "Balance",
          paymentGateway: "Balance",
          paymentStatus: "completed",
          totalAmount: item.finalPrice,
          lineType: 0,
          macAddresses: [],
          adultChannelsConfig: [],
          accountConfigurations: item.accounts,
          generatedCredentials: [],
          val: getPackageIdFromDuration(item.planDuration),
          con: item.accounts.reduce((acc, a) => acc + a.devices, 0),
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

        console.log("Payload being sent:", payload);

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Order creation failed:", err);
          throw new Error(err?.error || "Failed to place order");
        }
        const data = await res.json();
        createdOrders.push(data.order);

        // Collect IPTV credentials from this order
        if (
          data.order.iptvCredentials &&
          data.order.iptvCredentials.length > 0
        ) {
          allIptvCredentials.push(...data.order.iptvCredentials);
        }

        // Deduct balance per item
        await fetch("/api/admin/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            type: "purchase",
            amount: item.finalPrice,
            description: `Purchase: ${item.planName}`,
          }),
        });

        // Create IPTV account(s)
        try {
          const iptvRes = await fetch("/api/iptv/create-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderNumber: data.order.orderNumber,
              val: getPackageIdFromDuration(item.planDuration),
              con: item.accounts.reduce((acc, a) => acc + a.devices, 0),
            }),
          });

          if (iptvRes.ok) {
            const iptvData = await iptvRes.json();
            // Update the order with the generated credentials
            if (iptvData.credentials && iptvData.credentials.length > 0) {
              // Update the order in the database with credentials
              await fetch("/api/orders/update-credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: data.order._id,
                  credentials: iptvData.credentials,
                }),
              });

              // Add to our collection
              allIptvCredentials.push(...iptvData.credentials);
            }
          }
        } catch (iptvError) {
          console.error("IPTV creation failed:", iptvError);
        }
      }

      // Store the combined order data for PaymentConfirmPopup
      const combinedOrderData = {
        ...createdOrders[0], // Use first order as base
        // Combine all IPTV credentials from all orders
        iptvCredentials: allIptvCredentials,
        // Update total amount to reflect all items
        totalAmount: createdOrders.reduce(
          (sum, order) => sum + order.totalAmount,
          0
        ),
        // Store all order numbers
        orderNumbers: createdOrders.map((order) => order.orderNumber),
        // Mark as cart checkout
        isCartCheckout: true,
        cartItems: sel.cartItems,
        // Add products array for compatibility
        products: createdOrders
          .map((order) => order.products?.[0])
          .filter(Boolean),
      };

      // Store in localStorage for PaymentConfirmPopup
      localStorage.setItem("cs_last_order", JSON.stringify(combinedOrderData));

      // Clear cart after success
      localStorage.removeItem("cs_cart");
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      // Show success and trigger PaymentConfirmPopup
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

  if (!isOpen) return null;
  if (!orderDetails) return null;

  const totalAmount =
    orderDetails.priceCalculation?.finalTotal ||
    orderDetails.finalPrice ||
    orderDetails.plan?.price ||
    0;
  const hasInsufficientBalance = (user?.balance || 0) < totalAmount;
  const cartItems = orderDetails.cartItems || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 font-secondary">
      <div className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:pm-6 md:p-8 w-full max-w-4xl mx-auto relative border border-[#FFFFFF26] max-h-[90vh] overflow-y-auto scrollbar-hide">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white hover:text-gray-300 transition-colors"
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

        {/* All cart items */}
        <div className="space-y-4 mb-6">
          <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">
            {texts.orderSummary}
          </h3>

          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-semibold text-sm sm:text-base">
                    {item.productName}
                  </h4>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {item.planName} - {item.planDuration} Month
                    {Number(item.planDuration) > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 font-semibold text-sm sm:text-base">
                    ${item.finalPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">{texts.quantity}:</span>
                  <span className="text-white">
                    {item.quantity} account{item.quantity > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-2">
                  <h5 className="text-gray-300 text-xs sm:text-sm font-medium">
                    {texts.accounts}:
                  </h5>
                  {item.accounts.map((account, idx) => (
                    <div key={idx} className="bg-gray-700 rounded p-2 text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">
                          Account #{idx + 1}:
                        </span>
                        <span className="text-white">
                          {account.devices}{" "}
                          {account.devices > 1 ? texts.devices : texts.device} •
                          {account.adultChannels
                            ? ` ${texts.adult}`
                            : ` ${texts.nonAdult}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">
                          {texts.deviceType}:
                        </span>
                        <span className="flex items-center gap-1 text-cyan-400">
                          <span>
                            {getDeviceTypeIcon(account.deviceType || 0)}
                          </span>
                          <span className="font-medium">
                            {getDeviceTypeName(account.deviceType || 0)}
                          </span>
                        </span>
                      </div>

                      {account.deviceInfo && (
                        <div className="text-xs text-gray-500 space-y-1 mt-1">
                          {account.deviceType === 1 &&
                            account.deviceInfo.macAddress && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">MAC:</span>
                                <span className="text-green-400 font-mono">
                                  {account.deviceInfo.macAddress}
                                </span>
                              </div>
                            )}
                          {account.deviceType === 2 &&
                            account.deviceInfo.enigma2Info && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">Enigma2:</span>
                                <span className="text-purple-400">
                                  {account.deviceInfo.enigma2Info}
                                </span>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {item.coupon && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-400">Coupon:</span>
                    <span className="text-green-400">
                      {item.coupon.code} (-${item.coupon.discount})
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Balance summary */}
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
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-300 text-sm">{texts.total}:</span>
            <span className="text-white text-lg font-semibold">
              ${totalAmount.toFixed(2)}
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
