"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GuestCheckoutPopup({
  isOpen,
  onClose,
  setShowRegisterForm,
}) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const router = useRouter();

  // Original text constants
  const ORIGINAL_TEXTS = {
    title: "CHOOSE YOUR CHECKOUT OPTION",
    subtitle: "Select how you'd like to proceed with your order",
    buttons: {
      quickBuy: "Quick Buy Keep Going as a Guest",
      register: "Register to unlock full features",
    },
    features: {
      title: "Registration Benefits:",
      list: [
        "Order History & Tracking",
        "Ranks & Loyalty System",
        "Affiliate Program Access",
        "Exclusive Discounts",
        "Priority Support",
      ],
    },
    footer: {
      secure: "Your payment information is secure with guest checkout",
      privacy: "We respect your privacy and data protection",
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
          ORIGINAL_TEXTS.features.title,
          ...ORIGINAL_TEXTS.features.list,
          ...Object.values(ORIGINAL_TEXTS.footer),
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const [
          tTitle,
          tSubtitle,
          tQuickBuy,
          tRegister,
          tFeaturesTitle,
          ...tFeatures
        ] = translated;
        const tFooter = tFeatures.slice(5);

        setTexts({
          title: tTitle,
          subtitle: tSubtitle,
          buttons: {
            quickBuy: tQuickBuy,
            register: tRegister,
          },
          features: {
            title: tFeaturesTitle,
            list: tFeatures.slice(0, 5),
          },
          footer: {
            secure: tFooter[0],
            privacy: tFooter[1],
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

  const handleQuickBuy = () => {
    setShowRegisterForm(true);
    onClose();
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const closeRegisterForm = () => {
    setShowRegisterForm(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 font-secondary">
        <div className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto relative border border-[#FFFFFF26]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white hover:text-gray-300 transition-colors"
            aria-label="Close guest checkout popup"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-cyan-400 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
                <User
                  size={24}
                  className="text-black font-bold sm:w-8 sm:h-8 md:w-8 md:h-8"
                  strokeWidth={2}
                />
              </div>
            </div>
            <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 tracking-wide">
              {texts.title}
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              {texts.subtitle}
            </p>
          </div>

          {/* Features List */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-white text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-center">
              {texts.features.title}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {texts.features.list.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-300 text-xs sm:text-sm">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3 sm:space-y-4">
            {/* Quick Buy Button */}
            <button
              onClick={handleQuickBuy}
              className="w-full bg-cyan-400 text-black py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
              {texts.buttons.quickBuy}
            </button>

            {/* Register Button */}
            <button
              onClick={handleRegister}
              className="w-full bg-transparent border-2 border-cyan-400 text-cyan-400 py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-400 hover:text-black transition-colors flex items-center justify-center gap-2"
            >
              <User size={16} className="sm:w-5 sm:h-5" />
              {texts.buttons.register}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 sm:mt-8 space-y-2">
            <p className="text-gray-300 text-xs">{texts.footer.secure}</p>
            <p className="text-gray-400 text-xs">{texts.footer.privacy}</p>
          </div>
        </div>
      </div>
    </>
  );
}
