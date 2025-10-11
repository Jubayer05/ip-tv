"use client";
import Button from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertCircle,
  CreditCard,
  HelpCircle,
  Home,
  Mail,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { translate, isLanguageLoaded, language } = useLanguage();

  // Get error details from URL params
  const errorMessage =
    searchParams.get("error") || "Payment could not be processed";
  const orderNumber = searchParams.get("orderNumber");
  const amount = searchParams.get("amount");

  // Translation states
  const ORIGINAL_TEXTS = {
    title: "Payment Failed",
    subtitle: "We couldn't process your payment",
    sorry: "We're sorry, but your payment could not be completed",
    description:
      "Your payment was unsuccessful. Please try again or use a different payment method.",
    errorDetails: "Error Details",
    possibleReasons: {
      title: "Possible Reasons",
      reasons: [
        "Insufficient funds in your account",
        "Incorrect card details or expired card",
        "Payment declined by your bank",
        "Network or connection issues",
      ],
    },
    whatNext: {
      title: "What can you do next?",
      options: [
        {
          title: "Try Again",
          description: "Retry your payment with the same or different method",
        },
        {
          title: "Contact Support",
          description: "Get help from our support team",
        },
        {
          title: "Check Details",
          description: "Verify your payment information and try again",
        },
      ],
    },
    buttons: {
      tryAgain: "Try Payment Again",
      contactSupport: "Contact Support",
      home: "Back to Home",
      pricing: "View Pricing",
    },
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        const items = [
          ORIGINAL_TEXTS.title,
          ORIGINAL_TEXTS.subtitle,
          ORIGINAL_TEXTS.sorry,
          ORIGINAL_TEXTS.description,
          ORIGINAL_TEXTS.errorDetails,
          ORIGINAL_TEXTS.possibleReasons.title,
          ...ORIGINAL_TEXTS.possibleReasons.reasons,
          ORIGINAL_TEXTS.whatNext.title,
          ...ORIGINAL_TEXTS.whatNext.options.flatMap((o) => [
            o.title,
            o.description,
          ]),
          ...Object.values(ORIGINAL_TEXTS.buttons),
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        setTexts({
          title: translated[0],
          subtitle: translated[1],
          sorry: translated[2],
          description: translated[3],
          errorDetails: translated[4],
          possibleReasons: {
            title: translated[5],
            reasons: [
              translated[6],
              translated[7],
              translated[8],
              translated[9],
            ],
          },
          whatNext: {
            title: translated[10],
            options: [
              { title: translated[11], description: translated[12] },
              { title: translated[13], description: translated[14] },
              { title: translated[15], description: translated[16] },
            ],
          },
          buttons: {
            tryAgain: translated[17],
            contactSupport: translated[18],
            home: translated[19],
            pricing: translated[20],
          },
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded]);

  return (
    <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-red-500 to-red-600 rounded-full p-6">
              <XCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600/20 to-red-500/10 border-b border-red-500/20 p-6 sm:p-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {texts.title}
            </h1>
            <p className="text-red-400 text-lg">{texts.subtitle}</p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Sorry Message */}
            <div className="text-center mb-8">
              <p className="text-xl text-gray-300 mb-2">{texts.sorry}</p>
              <p className="text-gray-400">{texts.description}</p>
            </div>

            {/* Error Details */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-400 font-semibold mb-1">
                    {texts.errorDetails}
                  </h4>
                  <p className="text-gray-300 text-sm">{errorMessage}</p>
                  {orderNumber && (
                    <p className="text-gray-400 text-sm mt-2">
                      Order Reference:{" "}
                      <span className="text-white">{orderNumber}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Possible Reasons */}
            <div className="bg-black/30 rounded-xl p-6 mb-8 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-yellow-500" />
                {texts.possibleReasons.title}
              </h3>
              <ul className="space-y-2">
                {texts.possibleReasons.reasons.map((reason, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-300"
                  >
                    <span className="text-yellow-500 mt-1">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* What Next Grid */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                {texts.whatNext.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {texts.whatNext.options.map((option, index) => {
                  const icons = [RefreshCw, Mail, CreditCard];
                  const Icon = icons[index];
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-center"
                    >
                      <div className="flex justify-center mb-3">
                        <div className="bg-yellow-500/10 p-3 rounded-lg">
                          <Icon className="w-6 h-6 text-yellow-500" />
                        </div>
                      </div>
                      <h4 className="text-white font-semibold mb-1">
                        {option.title}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {option.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push("/packages")}
                className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                {texts.buttons.tryAgain}
              </Button>
              <Link
                href="/support/contact"
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-gray-700 text-center"
              >
                <Mail className="w-5 h-5" />
                {texts.buttons.contactSupport}
              </Link>
            </div>

            <div className="flex gap-3 mt-3">
              <Link
                href="/"
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-gray-700 text-center"
              >
                <Home className="w-5 h-5" />
                {texts.buttons.home}
              </Link>
              <Link
                href="/packages"
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-gray-700 text-center"
              >
                <CreditCard className="w-5 h-5" />
                {texts.buttons.pricing}
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>
            Need immediate assistance? Contact us at{" "}
            <span className="text-yellow-500">info@iptvstore.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
