"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePayment } from "@/contexts/PaymentContext";
import { Check, ChevronDown, Copy, Eye, EyeOff, Home, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PaymentConfirmPopup({ isOpen, onClose, order }) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { orderWithCredentials, closePaymentConfirm } = usePayment();
  const router = useRouter();

  // Use orderWithCredentials from context if available, otherwise fall back to order prop
  const displayOrder = orderWithCredentials || order;

  // Dynamic text based on order prop
  const getOriginalTexts = () => ({
    title: order ? "ORDER DETAILS" : "PAYMENT CONFIRMED",
    subtitle: order
      ? "View your order information"
      : "Thank you for your purchase!",
    orderDetails: {
      orderNumber: "Order Number:",
      orderDate: "Order Date:",
      service: "Service:",
      duration: "Duration:",
      devicesAllowed: "Devices Allowed:",
      adultChannels: "Adult Channels:",
      totalChannels: "Total Paid:",
      quantity: "Quantity:",
    },
    orderValues: {
      orderNumber: "CS-20250922-U6PBMY",
      orderDate: "9/22/2025",
      service: "IPTV Subscription",
      duration: "1 month(s)",
      devicesAllowed: "1",
      adultChannels: "No",
      totalPaid: "$0.02",
    },
    buttons: {
      backToHome: "Back to Home",
      close: "Close",
    },
    countdown: {
      redirecting: "Redirecting to dashboard in",
      seconds: "seconds",
    },
    footer: {
      receipt: "A receipt has been sent to your email.",
      contact: "For questions, contact: help@cheapstream.com",
    },
    accountDetails: {
      accountNumber: "Account",
      devices: "Devices",
      adultChannels: "Adult Channels",
      username: "Username",
      password: "Password",
      m3uLink: "M3U Link",
      portalLink: "Portal Link",
      connectionDetails: "Connection Details",
      expires: "Expires",
      deviceType: "Device Type",
    },
  });

  // State for translated content
  const [texts, setTexts] = useState(getOriginalTexts());
  const [orderInfo, setOrderInfo] = useState({
    orderNumber: "",
    orderDate: "",
    service: "IPTV Subscription",
    duration: "",
    devicesAllowed: "",
    adultChannels: "",
    totalPaid: "",
    quantity: "",
  });

  const [showPasswords, setShowPasswords] = useState({});
  const [copiedItems, setCopiedItems] = useState({});
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef(null);

  const getLineTypeName = (lineType) => {
    const names = { 0: "M3U Playlist", 1: "MAG Device", 2: "Enigma2" };
    return names[lineType] || "M3U Playlist";
  };

  // Helper function to build M3U URL
  const buildM3uUrl = (credential) => {
    // Try to extract from lineInfo first
    if (credential.lineInfo) {
      const lines = credential.lineInfo.split("\n");
      const m3uLine = lines.find((line) => line.includes("m3u_plus"));
      if (m3uLine) return m3uLine;
    }

    // Otherwise use provider response only (no constructed fallback)
    try {
      const info =
        typeof credential.lineInfo === "string"
          ? JSON.parse(credential.lineInfo)
          : credential.lineInfo;

      if (info && typeof info === "object") {
        if (credential.lineType === 0) {
          return info.dns_link || "";
        }
        return (
          info.portal_link ||
          info.dns_link ||
          info.dns_link_for_samsung_lg ||
          ""
        );
      }
    } catch {}
    return "";

    return "";
  };

  // Helper function to build Portal Link for MAG/Enigma devices
  const buildPortalLink = (credential) => {
    // Try to extract from lineInfo
    try {
      const info =
        typeof credential.lineInfo === "string"
          ? JSON.parse(credential.lineInfo)
          : credential.lineInfo;

      if (info && typeof info === "object") {
        return info.portal_link || "";
      }
    } catch {}
    return "";
  };

  // Helper function to get account configuration from order or credentials
  const getAccountConfiguration = (credential, index) => {
    // If order has accountConfigurations, use that
    if (displayOrder?.accountConfigurations?.[index]) {
      return displayOrder.accountConfigurations[index];
    }

    // Fallback to credential data or default
    return {
      devices: credential.devices || 1,
      adultChannels: credential.adultChannels || false,
    };
  };

  const togglePasswordVisibility = (index) => {
    setShowPasswords((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedItems((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedItems((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  useEffect(() => {
    if (!isOpen) return;

    // If we have a display order, use it
    if (displayOrder) {
      const product = displayOrder?.products?.[0] || {};

      // Handle cart checkout orders
      if (displayOrder.isCartCheckout) {
        setOrderInfo({
          orderNumber:
            displayOrder?.orderNumbers?.[0] || displayOrder?.orderNumber || "",
          orderDate: new Date(
            displayOrder?.createdAt || Date.now()
          ).toLocaleDateString(),
          service: "IPTV Subscription (Cart Checkout)",
          duration:
            displayOrder.cartItems?.length > 1
              ? `${displayOrder.cartItems.length} different plans`
              : `${product?.duration || 1} month(s)`,
          devicesAllowed: displayOrder.iptvCredentials?.length || 1,
          adultChannels: displayOrder.iptvCredentials?.some(
            (cred) => cred.adultChannels
          )
            ? "Yes"
            : "No",
          totalPaid: `$${(displayOrder?.totalAmount || 0).toFixed(2)}`,
          quantity: displayOrder.iptvCredentials?.length || 1,
        });
        return;
      }

      // Regular single order handling
      setOrderInfo({
        orderNumber: displayOrder?.orderNumber || "",
        orderDate: new Date(
          displayOrder?.createdAt || Date.now()
        ).toLocaleDateString(),
        service: "IPTV Subscription",
        duration: product?.duration ? `${product.duration} month(s)` : "",
        devicesAllowed: product?.devicesAllowed || "",
        adultChannels: product?.adultChannels ? "Yes" : "No",
        totalPaid: `$${(displayOrder?.totalAmount || 0).toFixed(2)}`,
        quantity:
          product?.quantity || displayOrder?.iptvCredentials?.length || 1,
      });
      return;
    }

    // Fallback to previous localStorage behavior
    try {
      const raw = localStorage.getItem("cs_last_order");
      if (raw) {
        const o = JSON.parse(raw);
        const product = o?.products?.[0] || {};
        setOrderInfo({
          orderNumber: o?.orderNumber || "CS-20250922-U6PBMY",
          orderDate: new Date(o?.createdAt || Date.now()).toLocaleDateString(),
          service: "IPTV Subscription",
          duration: product?.duration
            ? `${product.duration} month(s)`
            : "1 month(s)",
          devicesAllowed: product?.devicesAllowed || "1",
          adultChannels: product?.adultChannels ? "Yes" : "No",
          totalPaid: `$${(o?.totalAmount || 0.02).toFixed(2)}`,
          quantity: product?.quantity || 1,
        });
      }
    } catch {}
  }, [isOpen, displayOrder]);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        const originalTexts = getOriginalTexts();
        const items = [
          originalTexts.title,
          originalTexts.subtitle,
          ...Object.values(originalTexts.orderDetails),
          ...Object.values(originalTexts.orderValues),
          ...Object.values(originalTexts.buttons),
          originalTexts.countdown.redirecting,
          originalTexts.countdown.seconds,
          ...Object.values(originalTexts.footer),
          ...Object.values(originalTexts.accountDetails),
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const [tTitle, tSubtitle, ...tOrderDetails] = translated;
        const tOrderValues = tOrderDetails.slice(7, 15);
        const tButtons = tOrderDetails.slice(15, 17);
        const tCountdown = tOrderDetails.slice(17, 19);
        const tFooter = tOrderDetails.slice(19, 21);
        const tAccountDetails = tOrderDetails.slice(21);

        setTexts({
          title: tTitle,
          subtitle: tSubtitle,
          orderDetails: {
            orderNumber: tOrderDetails[0],
            orderDate: tOrderDetails[1],
            service: tOrderDetails[2],
            duration: tOrderDetails[3],
            devicesAllowed: tOrderDetails[4],
            adultChannels: tOrderDetails[5],
            totalPaid: tOrderDetails[6],
            quantity: tOrderDetails[7],
          },
          orderValues: {
            orderNumber: originalTexts.orderValues.orderNumber,
            orderDate: originalTexts.orderValues.orderDate,
            service: tOrderValues[0],
            duration: tOrderValues[1],
            devicesAllowed: originalTexts.orderValues.devicesAllowed,
            adultChannels: tOrderValues[3],
            totalPaid: originalTexts.orderValues.totalPaid,
          },
          buttons: {
            backToHome: tButtons[0],
            close: tButtons[1],
          },
          countdown: {
            redirecting: tCountdown[0],
            seconds: tCountdown[1],
          },
          footer: {
            receipt: tFooter[0],
            contact: tFooter[1],
          },
          accountDetails: {
            accountNumber: tAccountDetails[0],
            devices: tAccountDetails[1],
            adultChannels: tAccountDetails[2],
            username: tAccountDetails[3],
            password: tAccountDetails[4],
            m3uLink: tAccountDetails[5],
            portalLink: tAccountDetails[6],
            connectionDetails: tAccountDetails[7],
            expires: tAccountDetails[8],
            deviceType: tAccountDetails[9],
          },
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate, order]);

  useEffect(() => {
    if (orderWithCredentials && orderWithCredentials.iptvCredentials) {
      // The popup will automatically display the credentials
    }
  }, [orderWithCredentials]);

  // Scroll detection for showing scroll indicator
  useEffect(() => {
    if (!isOpen || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;

    const checkScrollability = () => {
      const hasScroll = container.scrollHeight > container.clientHeight;
      const isAtTop = container.scrollTop < 10;
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 10;

      // Show indicator only if scrollable, at top, and not at bottom
      setShowScrollIndicator(hasScroll && isAtTop && !isAtBottom);
      setIsScrolled(container.scrollTop > 10);
    };

    const handleScroll = () => {
      const isAtTop = container.scrollTop < 10;
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 10;

      setIsScrolled(container.scrollTop > 10);
      setShowScrollIndicator(isAtTop && !isAtBottom);
    };

    // Initial check with small delay to ensure DOM is ready
    const timer = setTimeout(checkScrollability, 100);

    // Check on resize
    window.addEventListener("resize", checkScrollability);
    container.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScrollability);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  const handleBackToHome = () => {
    onClose();
    router.push("/dashboard");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-[70] font-secondary">
      <div
        ref={scrollContainerRef}
        className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:pm-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto relative border border-[#FFFFFF26] max-h-[90vh] overflow-y-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
          }
        `}</style>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white hover:text-gray-300 transition-colors z-10"
          aria-label="Close payment confirmation popup"
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
          <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 tracking-wide">
            {texts.title}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm">{texts.subtitle}</p>
        </div>

        {/* Order Details Section */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {/* Order Number */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-white/75 text-xs sm:text-sm">
              {texts.orderDetails.orderNumber}
            </span>
            <span className="text-white text-xs sm:text-sm font-medium">
              {orderInfo.orderNumber}
            </span>
          </div>

          {/* Order Date */}
          <div className="flex justify-between items-center pb-3 sm:pb-5 border-b border-[#313131]">
            <span className="text-white/75 text-xs sm:text-sm">
              {texts.orderDetails.orderDate}
            </span>
            <span className="text-white text-xs sm:text-sm font-medium">
              {orderInfo.orderDate}
            </span>
          </div>

          {/* Service */}
          <div className="flex justify-between items-center">
            <span className="text-white/75 text-xs sm:text-sm">
              {texts.orderDetails.service}
            </span>
            <span className="text-white text-xs sm:text-sm font-medium text-right">
              {texts.orderValues.service}
            </span>
          </div>

          {/* Duration */}
          <div className="flex justify-between items-center">
            <span className="text-white/75 text-xs sm:text-sm">
              {texts.orderDetails.duration}
            </span>
            <span className="text-white text-xs sm:text-sm font-medium">
              {orderInfo.duration}
            </span>
          </div>

          {/* Quantity */}
          <div className="flex justify-between items-center">
            <span className="text-white/75 text-xs sm:text-sm">
              {texts.orderDetails.quantity}
            </span>
            <span className="text-white text-xs sm:text-sm font-medium">
              {orderInfo.quantity}
            </span>
          </div>

          {/* Devices Allowed - Show only for single account or when all accounts have same device count */}
          {displayOrder?.iptvCredentials?.length === 1 ||
          (displayOrder?.iptvCredentials?.length > 1 &&
            displayOrder.iptvCredentials.every(
              (cred) => cred.devices === displayOrder.iptvCredentials[0].devices
            )) ? (
            <div className="flex justify-between items-center">
              <span className="text-white/75 text-xs sm:text-sm">
                {texts.orderDetails.devicesAllowed}
              </span>
              <span className="text-white text-xs sm:text-sm font-medium">
                {displayOrder?.iptvCredentials?.[0]?.devices ||
                  orderInfo.devicesAllowed}
              </span>
            </div>
          ) : null}

          {/* Adult Channels - Show only for single account or when all accounts have same adult channel setting */}
          {displayOrder?.iptvCredentials?.length === 1 ||
          (displayOrder?.iptvCredentials?.length > 1 &&
            displayOrder.iptvCredentials.every(
              (cred) =>
                cred.adultChannels ===
                displayOrder.iptvCredentials[0].adultChannels
            )) ? (
            <div className="flex justify-between items-center">
              <span className="text-white/75 text-xs sm:text-sm">
                {texts.orderDetails.adultChannels}
              </span>
              <span className="text-white text-xs sm:text-sm font-medium">
                {displayOrder?.iptvCredentials?.[0]?.adultChannels ||
                orderInfo.adultChannels === "Yes"
                  ? "Yes"
                  : "No"}
              </span>
            </div>
          ) : null}

          {/* Total Paid */}
          <div className="flex justify-between items-center border-b border-[#313131] pb-3 sm:pb-5">
            <span className="text-white/75 text-xs sm:text-sm">
              {texts.orderDetails.totalPaid}
            </span>
            <span className="text-white text-xs sm:text-sm font-medium">
              {orderInfo.totalPaid}
            </span>
          </div>
        </div>

        {/* Additional details when order is provided */}
        {displayOrder && (
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-white/75 text-xs sm:text-sm">
                Order ID:
              </span>
              <span className="text-white text-xs sm:text-sm font-medium">
                {displayOrder._id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/75 text-xs sm:text-sm">
                Payment Method:
              </span>
              <span className="text-white text-xs sm:text-sm font-medium">
                {displayOrder.paymentMethod || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/75 text-xs sm:text-sm">
                Payment Status:
              </span>
              <span className="text-white text-xs sm:text-sm font-medium">
                {displayOrder.paymentStatus || "Unknown"}
              </span>
            </div>
            {displayOrder.products?.[0] && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-white/75 text-xs sm:text-sm">
                    Device Type:
                  </span>
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {getLineTypeName(displayOrder.products[0].lineType)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* IPTV Credentials Section - Enhanced for Multiple Accounts */}
        {(displayOrder &&
          displayOrder.iptvCredentials &&
          displayOrder.iptvCredentials.length > 0) ||
        order ? (
          <div className="mt-6 space-y-4">
            <h3 className="text-white font-semibold text-sm sm:text-base border-b border-[#313131] pb-2">
              IPTV Accounts{" "}
              {displayOrder?.iptvCredentials?.length
                ? `(${displayOrder.iptvCredentials.length})`
                : "(Loading...)"}
            </h3>

            {displayOrder?.iptvCredentials &&
            displayOrder.iptvCredentials.length > 0 ? (
              displayOrder.iptvCredentials.map((credential, index) => {
                const isPasswordVisible = showPasswords[index];
                const m3uUrl = buildM3uUrl(credential);
                const portalLink = buildPortalLink(credential);
                const accountConfig = getAccountConfiguration(
                  credential,
                  index
                );

                // Determine if we should show raw lineInfo
                const shouldShowLineInfo = (() => {
                  if (!credential.lineInfo) return false;

                  const hasDisplayedLink =
                    (credential.lineType === 0 && m3uUrl) ||
                    ((credential.lineType === 1 || credential.lineType === 2) &&
                      portalLink);

                  // If we have a displayed link, check if lineInfo is just the API response
                  if (hasDisplayedLink) {
                    try {
                      const info =
                        typeof credential.lineInfo === "string"
                          ? JSON.parse(credential.lineInfo)
                          : credential.lineInfo;

                      // Check if it's the standard API response structure
                      if (
                        info &&
                        typeof info === "object" &&
                        !Array.isArray(info)
                      ) {
                        // Check for API response structure (has type, id, username, password, package, template, etc.)
                        const isApiResponse =
                          (info.type === "M3U" ||
                            info.type === "MAG" ||
                            info.type === "ENIGMA2") &&
                          typeof info.id === "number" &&
                          typeof info.username === "string" &&
                          typeof info.password === "string" &&
                          (info.package ||
                            info.template ||
                            info.dns_link ||
                            info.portal_link);

                        // If it's the API response and we have the link displayed, hide it
                        if (isApiResponse) {
                          return false;
                        }
                      }
                    } catch {
                      // If parsing fails, it might be text format - show it
                      return true;
                    }
                  }

                  // Show lineInfo if no link is displayed, or if it's not the standard API response
                  return !hasDisplayedLink;
                })();

                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-900/70 to-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700 space-y-3"
                  >
                    {/* Account Header with Configuration */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 text-xs sm:text-sm font-medium">
                          {texts.accountDetails.accountNumber} #{index + 1}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {getLineTypeName(credential.lineType)}
                        </span>
                      </div>
                    </div>

                    {/* Account Configuration Summary */}
                    <div className="grid grid-cols-2 gap-2 mb-3 p-2 bg-gray-800/50 rounded border border-gray-600">
                      <div className="text-center">
                        <div className="text-white/75 text-xs">
                          {texts.accountDetails.devices}
                        </div>
                        <div className="text-white text-sm font-medium">
                          {accountConfig.devices}{" "}
                          {accountConfig.devices === 1 ? "Device" : "Devices"}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-white/75 text-xs">
                          {texts.accountDetails.adultChannels}
                        </div>
                        <div className="text-white text-sm font-medium">
                          {accountConfig.adultChannels ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="text-white/75 text-xs block mb-1">
                        {texts.accountDetails.username}:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={credential.username}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-xs sm:text-sm font-mono"
                        />
                        <button
                          onClick={() =>
                            copyToClipboard(
                              credential.username,
                              `username-${index}`
                            )
                          }
                          className="p-2 bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
                          aria-label="Copy username to clipboard"
                        >
                          {copiedItems[`username-${index}`] ? (
                            <Check size={16} className="text-green-400" />
                          ) : (
                            <Copy size={16} className="text-white" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-white/75 text-xs block mb-1">
                        {texts.accountDetails.password}:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type={isPasswordVisible ? "text" : "password"}
                          value={credential.password}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-xs sm:text-sm font-mono"
                        />
                        <button
                          onClick={() => togglePasswordVisibility(index)}
                          className="p-2 bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
                          aria-label={
                            isPasswordVisible
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {isPasswordVisible ? (
                            <EyeOff size={16} className="text-white" />
                          ) : (
                            <Eye size={16} className="text-white" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              credential.password,
                              `password-${index}`
                            )
                          }
                          className="p-2 bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
                          aria-label="Copy password to clipboard"
                        >
                          {copiedItems[`password-${index}`] ? (
                            <Check size={16} className="text-green-400" />
                          ) : (
                            <Copy size={16} className="text-white" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* M3U Link - Only show for M3U Playlist type (lineType === 0) */}
                    {credential.lineType === 0 && m3uUrl && (
                      <div>
                        <label className="text-white/75 text-xs block mb-1">
                          {texts.accountDetails.m3uLink}:
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-xs font-mono overflow-x-auto whitespace-nowrap">
                            {m3uUrl}
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(m3uUrl, `m3u-${index}`)
                            }
                            className="p-2 bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
                            aria-label="Copy M3U link to clipboard"
                          >
                            {copiedItems[`m3u-${index}`] ? (
                              <Check size={16} className="text-green-400" />
                            ) : (
                              <Copy size={16} className="text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Portal Link - Only show for MAG/Enigma devices (lineType === 1 or 2) */}
                    {(credential.lineType === 1 || credential.lineType === 2) &&
                      portalLink && (
                        <div>
                          <label className="text-white/75 text-xs block mb-1">
                            {texts.accountDetails.portalLink}:
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-xs font-mono overflow-x-auto whitespace-nowrap">
                              {portalLink}
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(portalLink, `portal-${index}`)
                              }
                              className="p-2 bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
                              aria-label="Copy portal link to clipboard"
                            >
                              {copiedItems[`portal-${index}`] ? (
                                <Check size={16} className="text-green-400" />
                              ) : (
                                <Copy size={16} className="text-white" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                    {/* Line Info - Only show if it's not already displayed as M3U/Portal link or if it contains additional info */}
                    {shouldShowLineInfo && (
                      <div>
                        <label className="text-white/75 text-xs block mb-1">
                          {texts.accountDetails.connectionDetails}:
                        </label>
                        <div className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {credential.lineInfo}
                        </div>
                      </div>
                    )}

                    {/* Expiry Date - if available */}
                    {credential.expire && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                        <span className="text-white/75 text-xs">
                          {texts.accountDetails.expires}:
                        </span>
                        <span className="text-white text-xs font-medium">
                          {new Date(
                            credential.expire * 1000
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 text-center">
                <p className="text-gray-400 text-sm">
                  IPTV credentials will be generated after payment confirmation.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 mt-2 md:mt-5">
          <button
            onClick={handleBackToHome}
            className="w-full bg-cyan-400 text-black py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={16} className="sm:w-5 sm:h-5" />
            {texts.buttons.backToHome}
          </button>

          <button
            onClick={onClose}
            className="w-full bg-transparent border-2 border-primary text-primary py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-400 hover:text-black transition-colors"
          >
            {texts.buttons.close}
          </button>
        </div>

        <div className="text-center space-y-2">
          {/* Only show receipt text when not displaying order history */}
          {!order && (
            <p className="text-white/75 text-xs">{texts.footer.receipt}</p>
          )}
          <p className="text-white/75 text-xs">{texts.footer.contact}</p>
        </div>

        {/* Scroll Indicator - Gradient Fade */}
        {showScrollIndicator && (
          <div className="sticky bottom-0 left-0 right-0 pointer-events-none z-10">
            {/* Gradient fade */}
            <div className="absolute -bottom-2 left-0 right-0 h-[100px] bg-gradient-to-t from-black via-black/80 to-transparent" />

            {/* Pulsing scroll indicator */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-auto">
              <div className="flex flex-col items-center gap-1.5">
                <div className="animate-bounce">
                  <ChevronDown className="w-6 h-6 text-cyan-400 drop-shadow-lg" />
                </div>
                <span className="text-cyan-400 text-xs font-medium animate-pulse">
                  Scroll for more
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
