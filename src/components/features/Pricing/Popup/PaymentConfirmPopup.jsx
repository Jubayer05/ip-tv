import { useLanguage } from "@/contexts/LanguageContext";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function PaymentConfirmPopup({ isOpen, onClose }) {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original text constants
  const ORIGINAL_TEXTS = {
    title: "PAYMENT CONFIRMED",
    subtitle: "Thank you for your purchase!",
    orderDetails: {
      orderId: "Order ID:",
      date: "Date:",
      service: "Service:",
      plan: "Plan:",
      total: "Total:",
    },
    orderValues: {
      orderId: "#92838239",
      date: "24 August 2025",
      service: "Digital Subscription Access",
      plan: "Premium",
      total: "$87.93",
    },
    footer: {
      receipt: "A receipt has been sent to your email.",
      contact: "For questions, contact: info@iptvstore.com",
    },
  };

  // State for translated content
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);
  const [orderInfo, setOrderInfo] = useState({
    orderId: "",
    date: "",
    service: "Digital Subscription Access",
    plan: "",
    total: "",
  });

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        const items = [
          ORIGINAL_TEXTS.title,
          ORIGINAL_TEXTS.subtitle,
          ...Object.values(ORIGINAL_TEXTS.orderDetails),
          ...Object.values(ORIGINAL_TEXTS.orderValues),
          ...Object.values(ORIGINAL_TEXTS.footer),
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const [tTitle, tSubtitle, ...tOrderDetails] = translated;
        const tOrderValues = tOrderDetails.slice(5, 10);
        const tFooter = tOrderDetails.slice(10);

        setTexts({
          title: tTitle,
          subtitle: tSubtitle,
          orderDetails: {
            orderId: tOrderDetails[0],
            date: tOrderDetails[1],
            service: tOrderDetails[2],
            plan: tOrderDetails[3],
            total: tOrderDetails[4],
          },
          orderValues: {
            orderId: ORIGINAL_TEXTS.orderValues.orderId, // Keep original values
            date: ORIGINAL_TEXTS.orderValues.date,
            service: tOrderValues[0],
            plan: tOrderValues[1],
            total: ORIGINAL_TEXTS.orderValues.total,
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

  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem("cs_last_order");
      if (raw) {
        const order = JSON.parse(raw);
        const product = order?.products?.[0] || {};
        setOrderInfo({
          orderId: order?.orderNumber || "",
          date: new Date(order?.createdAt || Date.now()).toLocaleDateString(),
          service: "Digital Subscription Access",
          plan: product?.duration ? `${product.duration} Months` : "Plan",
          total: `$${(order?.totalAmount || 0).toFixed(2)}`,
        });
      }
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-[70] font-secondary">
      <div className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:pm-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto relative border border-[#FFFFFF26]">
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
          <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 tracking-wide">
            {texts.title}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm">{texts.subtitle}</p>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {/* Order ID */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-white/75 text-xs sm:text-sm">
              {texts.orderDetails.orderId}
            </span>
            <span className="text-white text-xs sm:text-sm font-medium">
              {orderInfo.orderId}
            </span>
          </div>

          {/* Date */}
          <div className="flex justify-between items-center pb-3 sm:pb-5 border-b border-[#313131]">
            <span className="text-white/75 text-xs sm:text-sm">
              {texts.orderDetails.date}
            </span>
            <span className="text-white text-xs sm:text-sm font-medium">
              {orderInfo.date}
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

          {/* Plan */}
          <div className="flex justify-between items-center">
            <span className="text-white/75 text-xs sm:text-sm">
              {texts.orderDetails.plan}
            </span>
            <span className="text-white text-xs sm:text-sm font-medium">
              {orderInfo.plan}
            </span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-b border-[#313131] pb-3 sm:pb-5">
            <span className="text-white/75 text-xs sm:text-sm">
              {texts.orderDetails.total}
            </span>
            <span className="text-white text-xs sm:text-sm font-medium">
              {orderInfo.total}
            </span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-white/75 text-xs">{texts.footer.receipt}</p>
          <p className="text-white/75 text-xs">{texts.footer.contact}</p>
        </div>
      </div>
    </div>
  );
}
