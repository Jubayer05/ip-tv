"use client";
import PaymentConfirmPopup from "@/components/features/Pricing/Popup/PaymentConfirmPopup";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function GuestOrderHistory({ orders }) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [redownloadingOrder, setRedownloadingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  // Original static texts
  const ORIGINAL_TEXTS = {
    noOrdersFound: "No Orders Found",
    noOrdersMessage: "No orders were found for this email address.",
    orderHistory: "Order History",
    ordersFound: "orders found",
    order: "order",
    subscription: "Subscription",
    deviceType: "Device Type",
    quantity: "Quantity",
    month: "Month",
    months: "Months",
    account: "Account",
    accounts: "Accounts",
    adultChannelsEnabled: "Adult Channels Enabled",
    iptvCredentialsReady: "IPTV Credentials Ready",
    awaitingPayment:
      "Awaiting Payment - IPTV credentials will be sent after payment confirmation",
    resendToEmail: "Resend to Email",
    sending: "Sending...",
    success: "Success!",
    iptvCredentialsSent:
      "IPTV credentials have been sent to your email address.",
    error: "Error",
    failedToSendCredentials: "Failed to send credentials",
    networkError: "Network error. Please try again.",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  // Translate texts
  useEffect(() => {
    if (!isLanguageLoaded || language?.code === "en") {
      setTexts(ORIGINAL_TEXTS);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const items = Object.values(ORIGINAL_TEXTS);
        const translated = await translate(items);
        if (!isMounted) return;

        const translatedTexts = {};
        Object.keys(ORIGINAL_TEXTS).forEach((key, index) => {
          translatedTexts[key] = translated[index];
        });
        setTexts(translatedTexts);
      } catch (error) {
        console.error("Translation error:", error);
        setTexts(ORIGINAL_TEXTS);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language?.code, translate, isLanguageLoaded]);

  const handleRedownloadCredentials = async (orderNumber, email) => {
    setRedownloadingOrder(orderNumber);

    try {
      const response = await fetch("/api/orders/redownload-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderNumber, email }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: texts.success,
          text: texts.iptvCredentialsSent,
          icon: "success",
          confirmButtonColor: "#00b877",
        });
      } else {
        Swal.fire({
          title: texts.error,
          text: data.error || texts.failedToSendCredentials,
          icon: "error",
          confirmButtonColor: "#dc3545",
        });
      }
    } catch (error) {
      console.error("Redownload error:", error);
      Swal.fire({
        title: texts.error,
        text: texts.networkError,
        icon: "error",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setRedownloadingOrder(null);
    }
  };

  const getLineTypeName = (lineType) => {
    const names = {
      0: "M3U Playlist",
      1: "MAG Device",
      2: "Enigma2",
    };
    return names[lineType] || "M3U Playlist";
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "text-green-500",
      pending: "text-yellow-500",
      cancelled: "text-red-500",
      new: "text-blue-500",
    };
    return colors[status] || "text-gray-500";
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {texts.noOrdersFound}
        </h3>
        <p className="text-gray-400">{texts.noOrdersMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {texts.orderHistory}
        </h3>
        <div className="text-sm text-gray-400">
          {orders.length}{" "}
          {orders.length !== 1 ? texts.ordersFound : texts.order}
        </div>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => {
          const product = order.products?.[0];

          return (
            <div
              key={order._id}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#FFFFFF26] rounded-xl p-4 cursor-pointer hover:border-cyan-400/30 transition-colors"
              onClick={() => {
                setSelectedOrder(order);
                setPopupOpen(true);
              }}
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                <div>
                  <h4 className="text-base font-semibold text-white mb-1">
                    Order #{order.orderNumber}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.paymentStatus
                    )} bg-gray-800`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </span>
                  <span className="text-sm font-bold text-cyan-400">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Product Details */}
              {product && (
                <div className="bg-black/30 rounded-lg p-3 mb-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        {texts.subscription}
                      </p>
                      <p className="text-white text-sm font-medium">
                        {product.duration}{" "}
                        {product.duration !== 1 ? texts.months : texts.month}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        {texts.deviceType}
                      </p>
                      <p className="text-white text-sm font-medium">
                        {getLineTypeName(product.lineType)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        {texts.quantity}
                      </p>
                      <p className="text-white text-sm font-medium">
                        {product.quantity}{" "}
                        {product.quantity === 1
                          ? texts.account
                          : texts.accounts}
                      </p>
                    </div>
                  </div>

                  {/* Adult Channels Info */}
                  {product.lineType === 0 && product.adultChannels && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <span className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-400">
                        {texts.adultChannelsEnabled}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* IPTV Credentials Status */}
              {order.paymentStatus === "completed" && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400 text-sm font-medium">
                      {texts.iptvCredentialsReady} (
                      {order.iptvCredentials.length}{" "}
                      {order.iptvCredentials.length === 1
                        ? texts.account
                        : texts.accounts}
                      )
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRedownloadCredentials(
                        order.orderNumber,
                        order.contactInfo?.email || order.guestEmail
                      );
                    }}
                    disabled={redownloadingOrder === order.orderNumber}
                    className="flex items-center gap-2 px-3 py-2 bg-transparent border border-cyan-400 text-cyan-400 rounded-lg text-xs hover:bg-cyan-400 hover:text-black transition-colors disabled:opacity-60"
                  >
                    {redownloadingOrder === order.orderNumber ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-cyan-400"></div>
                        {texts.sending}
                      </>
                    ) : (
                      <>
                        <Mail className="w-3 h-3" />
                        {texts.resendToEmail}
                      </>
                    )}
                  </button>
                </div>
              )}

              {order.paymentStatus === "pending" && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400 text-sm font-medium">
                    {texts.awaitingPayment}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <PaymentConfirmPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}
