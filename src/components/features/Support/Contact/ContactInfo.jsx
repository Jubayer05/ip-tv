"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";

const ContactInfo = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original text constants
  const ORIGINAL_TEXTS = {
    header: {
      title: "SUBMIT A SUPPORT TICKET",
      subtitle:
        "Thank you for choosing Cheap Stream—where great entertainment meets unbeatable value. We look forward to assisting you!",
    },
    contactInfo: {
      callUs: {
        label: "Call Us",
        value: "+123 456 789 012",
      },
      emailUs: {
        label: "Email Us",
        value: "help@cheapstream.com",
      },
      businessHours: {
        label: "Business Hours",
        value: "Mon-Fri (09:00 AM - 5:00 PM)",
      },
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
          ORIGINAL_TEXTS.header.title,
          ORIGINAL_TEXTS.header.subtitle,
          ORIGINAL_TEXTS.contactInfo.callUs.label,
          ORIGINAL_TEXTS.contactInfo.emailUs.label,
          ORIGINAL_TEXTS.contactInfo.businessHours.label,
          ORIGINAL_TEXTS.contactInfo.businessHours.value,
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const [
          tTitle,
          tSubtitle,
          tCallUsLabel,
          tEmailUsLabel,
          tBusinessHoursLabel,
          tBusinessHoursValue,
        ] = translated;

        setTexts({
          header: {
            title: tTitle,
            subtitle: tSubtitle,
          },
          contactInfo: {
            callUs: {
              label: tCallUsLabel,
              value: ORIGINAL_TEXTS.contactInfo.callUs.value, // Keep phone number unchanged
            },
            emailUs: {
              label: tEmailUsLabel,
              value: ORIGINAL_TEXTS.contactInfo.emailUs.value, // Keep email unchanged
            },
            businessHours: {
              label: tBusinessHoursLabel,
              value: tBusinessHoursValue,
            },
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

  return (
    <div className="text-white p-4 sm:p-6 md:p-8 rounded-lg font-secondary w-full lg:w-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 tracking-wide">
          {texts.header.title}
        </h1>
        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
          {texts.header.subtitle} <br className="hidden sm:block" />
        </p>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 sm:space-y-6">
        {/* Call Us */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <p className="text-white/60 text-xs sm:text-sm mb-1">
              {texts.contactInfo.callUs.label}
            </p>
            <p className="text-white font-medium text-sm sm:text-base md:text-lg">
              {texts.contactInfo.callUs.value}
            </p>
          </div>
        </div>

        {/* Email Us */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <p className="text-white/60 text-xs sm:text-sm mb-1">
              {texts.contactInfo.emailUs.label}
            </p>
            <p className="text-white font-medium text-sm sm:text-base md:text-lg break-all">
              {texts.contactInfo.emailUs.value}
            </p>
          </div>
        </div>

        {/* Business Hours */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <p className="text-white/60 text-xs sm:text-sm mb-1">
              {texts.contactInfo.businessHours.label}
            </p>
            <p className="text-white font-medium text-sm sm:text-base md:text-lg">
              {texts.contactInfo.businessHours.value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
