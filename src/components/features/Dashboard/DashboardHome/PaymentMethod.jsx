"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { useEffect, useState } from "react";

const PaymentMethodCard = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const ORIGINAL_HEADING = "PAYMENT METHOD";
  const ORIGINAL_SUBTITLE = "Change how you pay for your plan";
  const ORIGINAL_VISA = "VISA";
  const ORIGINAL_VISA_ENDING = "Billgang";
  const ORIGINAL_EXPIRED = "Expired 02/2026";
  const ORIGINAL_EDIT = "Edit";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [subtitle, setSubtitle] = useState(ORIGINAL_SUBTITLE);
  const [visa, setVisa] = useState(ORIGINAL_VISA);
  const [visaEnding, setVisaEnding] = useState(ORIGINAL_VISA_ENDING);
  const [expired, setExpired] = useState(ORIGINAL_EXPIRED);
  const [edit, setEdit] = useState(ORIGINAL_EDIT);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_HEADING,
        ORIGINAL_SUBTITLE,
        ORIGINAL_VISA,
        ORIGINAL_VISA_ENDING,
        ORIGINAL_EXPIRED,
        ORIGINAL_EDIT,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [tHeading, tSubtitle, tVisa, tVisaEnding, tExpired, tEdit] =
        translated;

      setHeading(tHeading);
      setSubtitle(tSubtitle);
      setVisa(tVisa);
      setVisaEnding(tVisaEnding);
      setExpired(tExpired);
      setEdit(tEdit);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  return (
    <div className="border border-[#212121] bg-black rounded-[15px] p-4 sm:p-6 md:p-8 w-full font-secondary">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-white text-base sm:text-lg font-semibold mb-2">
          {heading}
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm">{subtitle}</p>
      </div>

      {/* Payment Method Details */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Visa Card Icon */}
          <div className="bg-white rounded-lg p-2 w-10 h-6 sm:w-12 sm:h-8 flex items-center justify-center flex-shrink-0">
            <div className="text-blue-600 font-bold text-xs sm:text-sm">
              <Image
                src="/icons/billgang.jpeg"
                alt="Billgang"
                width={20}
                height={20}
              />
            </div>
          </div>

          {/* Card Details */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm sm:text-base font-medium mb-1 truncate">
              {visaEnding}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mb-1">{expired}</p>
            <div className="flex items-center gap-1">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-gray-400 text-xs sm:text-sm truncate">
                vipstore@gmail.com
              </span>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button className="bg-cyan-400 text-gray-900 px-4 sm:px-6 py-2 rounded-full font-medium text-xs sm:text-sm hover:bg-cyan-300 transition-colors w-full sm:w-auto flex-shrink-0">
          {edit}
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodCard;
