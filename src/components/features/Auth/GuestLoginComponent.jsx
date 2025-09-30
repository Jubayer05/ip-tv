"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Mail, MessageCircle, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import GuestOrderHistory from "./GuestOrderHistory";
import GuestSupportTicket from "./GuestSupportTicket";

export default function GuestLoginComponent() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email"); // "email", "otp", "orders", "support"
  const [loading, setLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [orders, setOrders] = useState([]);

  // Check localStorage on component mount
  useEffect(() => {
    const savedGuestData = localStorage.getItem("guest_login_data");
    if (savedGuestData) {
      try {
        const data = JSON.parse(savedGuestData);
        setVerifiedEmail(data.email);
        setEmail(data.email);
        setOrders(data.orders || []);
        setStep("orders");
      } catch (error) {
        console.error("Error parsing saved guest data:", error);
        localStorage.removeItem("guest_login_data");
      }
    }
  }, []);

  // Original text constants
  const ORIGINAL_TEXTS = {
    title: "Guest Login",
    subtitle: "Enter your email to view your order history and support tickets",
    emailPlaceholder: "Enter your email address",
    otpPlaceholder: "Enter OTP code",
    sendOtpButton: "Send OTP",
    verifyOtpButton: "Verify OTP",
    resendOtpButton: "Resend OTP",
    backButton: "Back",
    supportTicketsButton: "Support Tickets",
    emailStep: {
      title: "Enter Your Email",
      subtitle: "We'll send a verification code to your email address",
    },
    otpStep: {
      title: "Enter Verification Code",
      subtitle: "Check your email and enter the 6-digit code",
    },
    ordersStep: {
      title: "Your Orders",
      subtitle: "View your order history and IPTV credentials",
    },
    errors: {
      invalidEmail: "Please enter a valid email address",
      otpRequired: "Please enter the OTP code",
      otpInvalid: "Invalid OTP code. Please try again.",
      otpExpired: "OTP code has expired. Please request a new one.",
      noOrders: "No orders found for this email address",
    },
    success: {
      otpSent: "OTP sent successfully! Check your email.",
      otpVerified: "Email verified successfully!",
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
          ORIGINAL_TEXTS.emailPlaceholder,
          ORIGINAL_TEXTS.otpPlaceholder,
          ORIGINAL_TEXTS.sendOtpButton,
          ORIGINAL_TEXTS.verifyOtpButton,
          ORIGINAL_TEXTS.resendOtpButton,
          ORIGINAL_TEXTS.backButton,
          ORIGINAL_TEXTS.supportTicketsButton,
          ...Object.values(ORIGINAL_TEXTS.emailStep),
          ...Object.values(ORIGINAL_TEXTS.otpStep),
          ...Object.values(ORIGINAL_TEXTS.ordersStep),
          ...Object.values(ORIGINAL_TEXTS.errors),
          ...Object.values(ORIGINAL_TEXTS.success),
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        setTexts({
          title: translated[0],
          subtitle: translated[1],
          emailPlaceholder: translated[2],
          otpPlaceholder: translated[3],
          sendOtpButton: translated[4],
          verifyOtpButton: translated[5],
          resendOtpButton: translated[6],
          backButton: translated[7],
          supportTicketsButton: translated[8],
          emailStep: {
            title: translated[9],
            subtitle: translated[10],
          },
          otpStep: {
            title: translated[11],
            subtitle: translated[12],
          },
          ordersStep: {
            title: translated[13],
            subtitle: translated[14],
          },
          errors: {
            invalidEmail: translated[15],
            otpRequired: translated[16],
            otpInvalid: translated[17],
            otpExpired: translated[18],
            noOrders: translated[19],
          },
          success: {
            otpSent: translated[20],
            otpVerified: translated[21],
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: texts.errors.invalidEmail,
        confirmButtonColor: "#00b877",
      });
      return;
    }

    if (!validateEmail(email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: texts.errors.invalidEmail,
        confirmButtonColor: "#00b877",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/guest-login/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: texts.success.otpSent,
          confirmButtonColor: "#00b877",
        });
        setStep("otp");
      } else {
        throw new Error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to send OTP. Please try again.",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Swal.fire({
        icon: "warning",
        title: "OTP Required",
        text: texts.errors.otpRequired,
        confirmButtonColor: "#00b877",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/guest-login/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerifiedEmail(email);
        setOrders(data.orders || []);
        setStep("orders");

        // Save to localStorage
        localStorage.setItem(
          "guest_login_data",
          JSON.stringify({
            email: email,
            orders: data.orders || [],
            timestamp: Date.now(),
          })
        );

        Swal.fire({
          icon: "success",
          title: "Verified!",
          text: texts.success.otpVerified,
          confirmButtonColor: "#00b877",
        });
      } else {
        if (data.error?.includes("expired")) {
          throw new Error(texts.errors.otpExpired);
        } else {
          throw new Error(texts.errors.otpInvalid);
        }
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to verify OTP. Please try again.",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/guest-login/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "OTP Resent!",
          text: texts.success.otpSent,
          confirmButtonColor: "#00b877",
        });
      } else {
        throw new Error(data.error || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to resend OTP. Please try again.",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("email");
      setOtp("");
    } else if (step === "orders") {
      setStep("otp");
      setOtp("");
    } else if (step === "support") {
      setStep("orders");
    }
  };

  const handleLogout = () => {
    setEmail("");
    setOtp("");
    setStep("email");
    setVerifiedEmail("");
    setOrders([]);
    // Clear localStorage
    localStorage.removeItem("guest_login_data");
  };

  const handleSupportTickets = () => {
    setStep("support");
  };

  return (
    <div className="bg-black rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full border border-[#FFFFFF26] font-secondary">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-cyan-400 rounded-full w-16 h-16 flex items-center justify-center">
            <User size={32} className="text-black" strokeWidth={2} />
          </div>
        </div>
        <h1 className="text-white text-2xl font-bold mb-2 tracking-wide">
          {texts.title}
        </h1>
        <p className="text-gray-300 text-sm leading-relaxed">
          {texts.subtitle}
        </p>
      </div>

      {/* Email Step */}
      {step === "email" && (
        <div className="space-y-6 max-w-md mx-auto">
          <div className="text-center">
            <h2 className="text-white text-lg font-semibold mb-2">
              {texts.emailStep.title}
            </h2>
            <p className="text-gray-400 text-sm">{texts.emailStep.subtitle}</p>
          </div>

          <div className="">
            <label className="block text-white text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={texts.emailPlaceholder}
                className="w-full pl-10 pr-4 py-3 bg-[#0c171c] border border-[#FFFFFF26] rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
                autoComplete="email"
              />
            </div>
          </div>

          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full bg-cyan-400 text-black py-3 rounded-full font-semibold hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                Sending...
              </>
            ) : (
              <>
                {texts.sendOtpButton}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      )}

      {/* OTP Step */}
      {step === "otp" && (
        <div className="space-y-6 max-w-md mx-auto">
          <div className="text-center">
            <h2 className="text-white text-lg font-semibold mb-2">
              {texts.otpStep.title}
            </h2>
            <p className="text-gray-400 text-sm">{texts.otpStep.subtitle}</p>
            <p className="text-cyan-400 text-sm mt-2 font-medium">{email}</p>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder={texts.otpPlaceholder}
              className="w-full px-4 py-3 bg-[#0c171c] border border-[#FFFFFF26] rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full bg-cyan-400 text-black py-3 rounded-full font-semibold hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Verifying...
                </>
              ) : (
                <>
                  {texts.verifyOtpButton}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 bg-transparent border-2 border-gray-600 text-gray-300 py-3 rounded-full font-semibold hover:border-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <X size={16} />
                {texts.backButton}
              </button>
              <button
                onClick={handleResendOtp}
                disabled={loading}
                className="flex-1 bg-transparent border-2 border-cyan-400 text-cyan-400 py-3 rounded-full font-semibold hover:bg-cyan-400 hover:text-black transition-colors disabled:opacity-60"
              >
                {texts.resendOtpButton}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Step */}
      {step === "orders" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-white text-lg font-semibold mb-2">
              {texts.ordersStep.title}
            </h2>
            <p className="text-gray-400 text-sm">{texts.ordersStep.subtitle}</p>
            <p className="text-cyan-400 text-sm mt-2 font-medium">
              {verifiedEmail}
            </p>
          </div>

          <GuestOrderHistory orders={orders} />

          <div className="space-y-3">
            <button
              onClick={handleSupportTickets}
              className="w-full bg-transparent border-2 border-cyan-400 text-cyan-400 py-3 rounded-full font-semibold hover:bg-cyan-400 hover:text-black transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              {texts.supportTicketsButton}
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-transparent border-2 border-gray-600 text-gray-300 py-3 rounded-full font-semibold hover:border-gray-500 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Support Tickets Step */}
      {step === "support" && (
        <div className="space-y-6">
          <GuestSupportTicket
            verifiedEmail={verifiedEmail}
            onBack={handleBack}
          />
        </div>
      )}
    </div>
  );
}
