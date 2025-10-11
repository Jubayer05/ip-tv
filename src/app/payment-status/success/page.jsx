"use client";
import Button from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Check,
  CheckCircle,
  Download,
  Home,
  Mail,
  Package,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { translate, isLanguageLoaded, language } = useLanguage();
  const [countdown, setCountdown] = useState(10);

  // Get order details from URL params
  const orderNumber = searchParams.get("orderNumber");
  const amount = searchParams.get("amount");
  const method = searchParams.get("method");

  // Redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  // Translation states
  const ORIGINAL_TEXTS = {
    title: "Payment Successful!",
    subtitle: "Your payment has been processed successfully",
    thankYou: "Thank you for your purchase",
    description:
      "Your order has been confirmed and you will receive a confirmation email shortly with your IPTV credentials.",
    orderDetails: {
      orderNumber: "Order Number",
      amount: "Amount Paid",
      paymentMethod: "Payment Method",
      status: "Status",
    },
    features: [
      {
        title: "Email Confirmation",
        description: "Check your email for order details and credentials",
      },
      {
        title: "Instant Access",
        description: "Your IPTV service is now active and ready to use",
      },
      {
        title: "24/7 Support",
        description: "Our support team is here to help you anytime",
      },
    ],
    buttons: {
      viewOrder: "View Order Details",
      dashboard: "Go to Dashboard",
      home: "Back to Home",
    },
    redirect: "Redirecting to dashboard in",
    seconds: "seconds",
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
          ORIGINAL_TEXTS.thankYou,
          ORIGINAL_TEXTS.description,
          ...Object.values(ORIGINAL_TEXTS.orderDetails),
          ...ORIGINAL_TEXTS.features.flatMap((f) => [f.title, f.description]),
          ...Object.values(ORIGINAL_TEXTS.buttons),
          ORIGINAL_TEXTS.redirect,
          ORIGINAL_TEXTS.seconds,
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        setTexts({
          title: translated[0],
          subtitle: translated[1],
          thankYou: translated[2],
          description: translated[3],
          orderDetails: {
            orderNumber: translated[4],
            amount: translated[5],
            paymentMethod: translated[6],
            status: translated[7],
          },
          features: [
            { title: translated[8], description: translated[9] },
            { title: translated[10], description: translated[11] },
            { title: translated[12], description: translated[13] },
          ],
          buttons: {
            viewOrder: translated[14],
            dashboard: translated[15],
            home: translated[16],
          },
          redirect: translated[17],
          seconds: translated[18],
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-6">
              <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600/20 to-green-500/10 border-b border-green-500/20 p-6 sm:p-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {texts.title}
            </h1>
            <p className="text-green-400 text-lg">{texts.subtitle}</p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Thank You Message */}
            <div className="text-center mb-8">
              <p className="text-xl text-gray-300 mb-2">{texts.thankYou}</p>
              <p className="text-gray-400">{texts.description}</p>
            </div>

            {/* Order Details */}
            {orderNumber && (
              <div className="bg-black/30 rounded-xl p-6 mb-8 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-yellow-500" />
                  {texts.orderDetails.orderNumber}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">
                      {texts.orderDetails.orderNumber}
                    </p>
                    <p className="text-white font-semibold">{orderNumber}</p>
                  </div>
                  {amount && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">
                        {texts.orderDetails.amount}
                      </p>
                      <p className="text-white font-semibold">${amount}</p>
                    </div>
                  )}
                  {method && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">
                        {texts.orderDetails.paymentMethod}
                      </p>
                      <p className="text-white font-semibold">{method}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400 text-sm mb-1">
                      {texts.orderDetails.status}
                    </p>
                    <span className="inline-flex items-center gap-1 text-green-500 font-semibold">
                      <Check className="w-4 h-4" />
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {texts.features.map((feature, index) => {
                const icons = [Mail, Shield, Package];
                const Icon = icons[index];
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-center"
                  >
                    <div className="flex justify-center mb-3">
                      <div className="bg-green-500/10 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                    <h4 className="text-white font-semibold mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push(`/dashboard/orders`)}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {texts.buttons.viewOrder}
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-gray-700"
              >
                <Home className="w-5 h-5" />
                {texts.buttons.dashboard}
              </Button>
              <Link
                href="/"
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-gray-700"
              >
                {texts.buttons.home}
              </Link>
            </div>

            {/* Redirect Countdown */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {texts.redirect}{" "}
                <span className="text-green-500 font-bold">{countdown}</span>{" "}
                {texts.seconds}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>
            Need help? Contact us at{" "}
            <span className="text-yellow-500">info@iptvstore.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
