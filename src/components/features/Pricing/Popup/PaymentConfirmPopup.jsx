import { useLanguage } from "@/contexts/LanguageContext";
import { Check, Home, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentConfirmPopup({ isOpen, onClose, order }) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const router = useRouter();

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
    footer: {
      receipt: "A receipt has been sent to your email.",
      contact: "For questions, contact: info@iptvstore.com",
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
  });

  const getLineTypeName = (lineType) => {
    const names = { 0: "M3U Playlist", 1: "MAG Device", 2: "Enigma2" };
    return names[lineType] || "M3U Playlist";
  };

  useEffect(() => {
    // Update texts when order prop changes
    setTexts(getOriginalTexts());
  }, [order]);

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
          ...Object.values(originalTexts.footer),
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const [tTitle, tSubtitle, ...tOrderDetails] = translated;
        const tOrderValues = tOrderDetails.slice(7, 14);
        const tButtons = tOrderDetails.slice(14, 16);
        const tFooter = tOrderDetails.slice(16);

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
  }, [language.code, isLanguageLoaded, translate, order]);

  useEffect(() => {
    if (!isOpen) return;

    // If order prop is provided, derive values from it
    if (order) {
      const product = order?.products?.[0] || {};
      setOrderInfo({
        orderNumber: order?.orderNumber || "",
        orderDate: new Date(
          order?.createdAt || Date.now()
        ).toLocaleDateString(),
        service: "IPTV Subscription",
        duration: product?.duration ? `${product.duration} month(s)` : "",
        devicesAllowed: product?.devicesAllowed || "",
        adultChannels: product?.adultChannels ? "Yes" : "No",
        totalPaid: `$${(order?.totalAmount || 0).toFixed(2)}`,
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
        });
      }
    } catch {}
  }, [isOpen, order]);

  const handleBackToHome = () => {
    onClose();
    router.push("/");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-[70] font-secondary">
      <div
        className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:pm-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto relative border border-[#FFFFFF26] max-h-[90vh] overflow-y-auto"
        style={{
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* Internet Explorer 10+ */,
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

          {/* Devices Allowed */}
          <div className="flex justify-between items-center">
            <span className="text-white/75 text-xs sm:text-sm">
              {texts.orderDetails.devicesAllowed}
            </span>
            <span className="text-white text-xs sm:text-sm font-medium">
              {orderInfo.devicesAllowed}
            </span>
          </div>

          {/* Adult Channels */}
          <div className="flex justify-between items-center">
            <span className="text-white/75 text-xs sm:text-sm">
              {texts.orderDetails.adultChannels}
            </span>
            <span className="text-white text-xs sm:text-sm font-medium">
              {orderInfo.adultChannels}
            </span>
          </div>

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
        {order && (
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-white/75 text-xs sm:text-sm">
                Order ID:
              </span>
              <span className="text-white text-xs sm:text-sm font-medium">
                {order._id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/75 text-xs sm:text-sm">
                Payment Method:
              </span>
              <span className="text-white text-xs sm:text-sm font-medium">
                {order.paymentMethod || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/75 text-xs sm:text-sm">
                Payment Status:
              </span>
              <span className="text-white text-xs sm:text-sm font-medium">
                {order.paymentStatus || "Unknown"}
              </span>
            </div>
            {order.products?.[0] && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-white/75 text-xs sm:text-sm">
                    Device Type:
                  </span>
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {getLineTypeName(order.products[0].lineType)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/75 text-xs sm:text-sm">
                    Quantity:
                  </span>
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {order.products[0].quantity ?? 1}
                  </span>
                </div>
              </>
            )}
            {Array.isArray(order.iptvCredentials) && (
              <div className="flex justify-between items-center">
                <span className="text-white/75 text-xs sm:text-sm">
                  Accounts:
                </span>
                <span className="text-white text-xs sm:text-sm font-medium">
                  {order.iptvCredentials.length}
                </span>
              </div>
            )}
          </div>
        )}

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
      </div>
    </div>
  );
}
