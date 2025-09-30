"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import { Clock, Mail, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ContactInfo = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { apiCall } = useApi();
  const [contactInfo, setContactInfo] = useState({
    phoneNumber: "+123 456 789 012",
    emailAddress: "help@cheapstream.com",
    businessHours: "Mon-Fri (09:00 AM - 5:00 PM)",
  });
  const [loading, setLoading] = useState(true);
  const [textsLoaded, setTextsLoaded] = useState(false);
  const fetchedRef = useRef(false);

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
      },
      emailUs: {
        label: "Email Us",
      },
      businessHours: {
        label: "Business Hours",
      },
    },
  };

  // State for translated content
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  // Fetch contact info from backend (run once, guard against Strict Mode double-invoke)
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        setLoading(true);
        const response = await apiCall("/api/admin/settings", "GET");
        if (response.success && response.data.contactInfo) {
          setContactInfo({
            phoneNumber:
              response.data.contactInfo.phoneNumber || "+123 456 789 012",
            emailAddress:
              response.data.contactInfo.emailAddress || "help@cheapstream.com",
            businessHours:
              response.data.contactInfo.businessHours ||
              "Mon-Fri (09:00 AM - 5:00 PM)",
          });
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Translation effect - only run once when language changes
  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") {
      setTextsLoaded(true);
      return;
    }

    let isMounted = true;

    const translateTexts = async () => {
      try {
        const items = [
          ORIGINAL_TEXTS.header.title,
          ORIGINAL_TEXTS.header.subtitle,
          ORIGINAL_TEXTS.contactInfo.callUs.label,
          ORIGINAL_TEXTS.contactInfo.emailUs.label,
          ORIGINAL_TEXTS.contactInfo.businessHours.label,
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const [
          tTitle,
          tSubtitle,
          tCallUsLabel,
          tEmailUsLabel,
          tBusinessHoursLabel,
        ] = translated;

        setTexts({
          header: {
            title: tTitle,
            subtitle: tSubtitle,
          },
          contactInfo: {
            callUs: {
              label: tCallUsLabel,
            },
            emailUs: {
              label: tEmailUsLabel,
            },
            businessHours: {
              label: tBusinessHoursLabel,
            },
          },
        });
        setTextsLoaded(true);
      } catch (error) {
        console.error("Translation error:", error);
        setTextsLoaded(true);
      }
    };

    translateTexts();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  if (loading || !textsLoaded) {
    return (
      <div className="text-white p-4 sm:p-6 md:p-8 rounded-lg font-secondary w-full lg:w-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-5 h-5 bg-gray-700 rounded"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-700 rounded w-32"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-5 h-5 bg-gray-700 rounded"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-700 rounded w-40"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-5 h-5 bg-gray-700 rounded"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-700 rounded w-36"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              {contactInfo.phoneNumber}
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
              {contactInfo.emailAddress}
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
              {contactInfo.businessHours}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
