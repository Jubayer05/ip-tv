"use client";
import PaymentConfirmPopup from "@/components/features/Pricing/Popup/PaymentConfirmPopup";
import Button from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Mail,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const OrderHistory = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user, getAuthToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redownloadingOrder, setRedownloadingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideContent, setGuideContent] = useState("");
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedCredentials, setCopiedCredentials] = useState({});
  const [expandedCredentials, setExpandedCredentials] = useState({});

  const ORIGINAL_TEXTS = {
    loadingOrders: "Loading your orders...",
    noOrdersYet: "No Orders Yet",
    noOrdersMessage:
      "You haven't made any purchases yet. Start exploring our packages!",
    browsePackages: "Browse Packages",
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
    deviceConfiguration: "Device Configuration",
    adult: "Adult",
    nonAdult: "Non Adult",
    adultChannelsEnabled: "Adult Channels Enabled",
    iptvCredentialsReady: "IPTV Credentials Ready",
    viewGuide: "View Guide",
    resendToEmail: "Resend to Email",
    sending: "Sending...",
    awaitingPayment:
      "Awaiting Payment - IPTV credentials will be sent after payment confirmation",
    iptvSetupGuide: "IPTV Setup Guide",
    noGuideAvailable: "No guide available yet.",
    success: "Success!",
    iptvCredentialsSent:
      "IPTV credentials have been sent to your email address.",
    error: "Error",
    failedToSendCredentials: "Failed to send credentials",
    networkError: "Network error. Please try again.",
    username: "Username",
    password: "Password",
    showPassword: "Show Password",
    hidePassword: "Hide Password",
    copyCredentials: "Copy Credentials",
    credentialsCopied: "Credentials Copied!",
    iptvCredentials: "IPTV Credentials",
    showDetails: "Show Details",
    hideDetails: "Hide Details",
    m3uLink: "M3U Link",
    connectionDetails: "Connection Details",
    expires: "Expires",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

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

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchGuideContent();
    }
  }, [user]);

  const fetchGuideContent = async () => {
    try {
      const response = await fetch("/api/admin/settings/email-content");
      const data = await response.json();
      if (data.success) {
        setGuideContent(data.data.content || "");
      }
    } catch (error) {
      console.error("Failed to fetch guide content:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch("/api/orders/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedownloadCredentials = async (orderNumber) => {
    setRedownloadingOrder(orderNumber);

    try {
      const response = await fetch("/api/orders/redownload-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderNumber }),
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

  const handleShowGuide = (order) => {
    setSelectedOrder(order);
    setShowGuide(true);
  };

  const togglePasswordVisibility = (orderId, credentialIndex) => {
    setShowPasswords((prev) => ({
      ...prev,
      [`${orderId}-${credentialIndex}`]: !prev[`${orderId}-${credentialIndex}`],
    }));
  };

  const toggleCredentialDetails = (orderId, credentialIndex) => {
    setExpandedCredentials((prev) => ({
      ...prev,
      [`${orderId}-${credentialIndex}`]: !prev[`${orderId}-${credentialIndex}`],
    }));
  };

  const copyCredentials = async (orderId, credential) => {
    const credentialText = `${texts.username}: ${credential.username}\n${texts.password}: ${credential.password}`;

    try {
      await navigator.clipboard.writeText(credentialText);
      setCopiedCredentials((prev) => ({
        ...prev,
        [`${orderId}-${credential.username}`]: true,
      }));

      setTimeout(() => {
        setCopiedCredentials((prev) => ({
          ...prev,
          [`${orderId}-${credential.username}`]: false,
        }));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy credentials:", error);
    }
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCredentials((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedCredentials((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const buildM3uUrl = (credential) => {
    if (credential.lineInfo) {
      const lines = credential.lineInfo.split("\n");
      const m3uLine = lines.find((line) => line.includes("m3u_plus"));
      if (m3uLine) return m3uLine;
    }

    if (credential.username && credential.password) {
      return `http://hfast.xyz/get.php?username=${credential.username}&password=${credential.password}&type=m3u_plus&output=ts`;
    }

    return "";
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-400 mt-4">{texts.loadingOrders}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {texts.noOrdersYet}
        </h3>
        <p className="text-gray-400 mb-6">{texts.noOrdersMessage}</p>
        <Button
          variant="primary"
          onClick={() => (window.location.href = "/packages")}
        >
          {texts.browsePackages}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{texts.orderHistory}</h2>
        <div className="text-sm text-gray-400">
          {orders.length}{" "}
          {orders.length !== 1 ? texts.ordersFound : texts.order}
        </div>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => {
          const product = order.products?.[0];

          return (
            <div
              key={order._id}
              className=" overflow-x-auto overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#FFFFFF26] rounded-xl p-6"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.paymentStatus
                    )} bg-gray-800`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Product Details */}
              {product && (
                <div className="bg-black/30 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        {texts.subscription}
                      </p>
                      <p className="text-white font-medium">
                        {product.duration}{" "}
                        {product.duration !== 1 ? texts.months : texts.month}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        {texts.deviceType}
                      </p>
                      <p className="text-white font-medium">
                        {getLineTypeName(product.lineType)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        {texts.quantity}
                      </p>
                      <p className="text-white font-medium">
                        {product.quantity}{" "}
                        {product.quantity === 1
                          ? texts.account
                          : texts.accounts}
                      </p>
                    </div>
                  </div>

                  {/* IPTV Configuration Details */}
                  {product.lineType > 0 && product.adultChannelsConfig && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400 mb-2">
                        {texts.deviceConfiguration}:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.adultChannelsConfig.map(
                          (adultEnabled, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${
                                adultEnabled
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {getLineTypeName(product.lineType)} #{index + 1}:{" "}
                              {adultEnabled ? texts.adult : texts.nonAdult}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {product.lineType === 0 && product.adultChannels && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <span className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-400">
                        {texts.adultChannelsEnabled}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* IPTV Credentials Status */}
              {order.paymentStatus === "completed" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 font-medium">
                        {texts.iptvCredentialsReady} (
                        {order.iptvCredentials.length}{" "}
                        {order.iptvCredentials.length === 1
                          ? texts.account
                          : texts.accounts}
                        )
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowGuide(order);
                        }}
                        className="flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        {texts.viewGuide}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRedownloadCredentials(order.orderNumber);
                        }}
                        disabled={redownloadingOrder === order.orderNumber}
                        className="flex items-center gap-2"
                      >
                        {redownloadingOrder === order.orderNumber ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {texts.sending}
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            {texts.resendToEmail}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                          setPopupOpen(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        View Order
                      </Button>
                    </div>
                  </div>

                  {/* IPTV Credentials Display */}
                  {order.iptvCredentials &&
                    order.iptvCredentials.length > 0 && (
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                          {texts.iptvCredentials}
                        </h4>
                        <div className="space-y-3">
                          {order.iptvCredentials.map((credential, index) => {
                            const isPasswordVisible =
                              showPasswords[`${order._id}-${index}`];
                            const isExpanded =
                              expandedCredentials[`${order._id}-${index}`];
                            const m3uUrl = buildM3uUrl(credential);

                            return (
                              <div
                                key={index}
                                className="bg-black/30 rounded-lg p-3 space-y-3"
                              >
                                {/* Header with Account # and Toggle */}
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">
                                      {texts.account} #{index + 1}
                                    </span>
                                    <span className="text-xs text-cyan-400">
                                      {getLineTypeName(credential.lineType)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        copyCredentials(order._id, credential)
                                      }
                                      className="flex items-center gap-1 text-xs px-2 py-1 h-6"
                                    >
                                      {copiedCredentials[
                                        `${order._id}-${credential.username}`
                                      ] ? (
                                        <>
                                          <Check className="w-3 h-3" />
                                          {texts.credentialsCopied}
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          {texts.copyCredentials}
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        toggleCredentialDetails(
                                          order._id,
                                          index
                                        )
                                      }
                                      className="flex items-center gap-1 text-xs px-2 py-1 h-6"
                                    >
                                      {isExpanded ? (
                                        <>
                                          <ChevronUp className="w-3 h-3" />
                                          {texts.hideDetails}
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown className="w-3 h-3" />
                                          {texts.showDetails}
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                {/* Basic Credentials (Always Visible) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-gray-400 block mb-1">
                                      {texts.username}
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={credential.username}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm font-mono"
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          navigator.clipboard.writeText(
                                            credential.username
                                          )
                                        }
                                        className="px-2 py-1 h-8"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-xs text-gray-400 mb-1 ">
                                      {texts.password}
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type={
                                          isPasswordVisible
                                            ? "text"
                                            : "password"
                                        }
                                        value={credential.password}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm font-mono"
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          togglePasswordVisibility(
                                            order._id,
                                            index
                                          )
                                        }
                                        className="px-2 py-1 h-8"
                                      >
                                        {isPasswordVisible ? (
                                          <EyeOff className="w-3 h-3" />
                                        ) : (
                                          <Eye className="w-3 h-3" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          navigator.clipboard.writeText(
                                            credential.password
                                          )
                                        }
                                        className="px-2 py-1 h-8"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Extended Details (Collapsible) */}
                                {isExpanded && (
                                  <div className="space-y-3 pt-3 border-t border-gray-700">
                                    {/* M3U Link - Only for M3U Playlist type */}
                                    {credential.lineType === 0 && m3uUrl && (
                                      <div>
                                        <label className="text-xs text-gray-400 block mb-1">
                                          {texts.m3uLink}
                                        </label>
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-xs font-mono overflow-x-auto whitespace-nowrap">
                                            {m3uUrl}
                                          </div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              copyToClipboard(
                                                m3uUrl,
                                                `m3u-${order._id}-${index}`
                                              )
                                            }
                                            className="px-2 py-1 h-8"
                                          >
                                            {copiedCredentials[
                                              `m3u-${order._id}-${index}`
                                            ] ? (
                                              <Check className="w-3 h-3 text-green-400" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Line Info */}
                                    {credential.lineInfo && (
                                      <div>
                                        <label className="text-xs text-gray-400 block mb-1">
                                          {texts.connectionDetails}
                                        </label>
                                        <div className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                                          {credential.lineInfo}
                                        </div>
                                      </div>
                                    )}

                                    {/* Expiry Date */}
                                    {credential.expire && (
                                      <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                                        <span className="text-xs text-gray-400">
                                          {texts.expires}:
                                        </span>
                                        <span className="text-xs text-white font-medium">
                                          {new Date(
                                            credential.expire * 1000
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {order.paymentStatus === "pending" && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400 font-medium">
                    {texts.awaitingPayment}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-[#FFFFFF26] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {texts.iptvSetupGuide}
                </h3>
                <button
                  onClick={() => setShowGuide(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {guideContent ? (
                  <div className="bg-gray-900 rounded-lg p-6">
                    <div
                      className="text-gray-300 prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: guideContent }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">{texts.noGuideAvailable}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <PaymentConfirmPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrderHistory;
