"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDeviceLogin } from "@/hooks/useDeviceLogin";
import { getDeviceInfo } from "@/lib/fingerprint";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TwoFactorAuth({ email, onBack, visitorId }) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Original static texts
  const ORIGINAL_TEXTS = {
    twoFactorAuth: "Two-Factor Authentication",
    enterCodeMessage: "Enter the 6-digit code sent to your email",
    trustedDeviceMessage: "This device will be trusted for future logins",
    verificationCode: "Verification Code",
    enterCodePlaceholder: "Enter 6-digit code",
    verifying: "Verifying...",
    verifySignIn: "Verify & Sign In",
    didntReceiveCode: "Didn't receive the code?",
    resendCode: "Resend Code",
    resendIn: "Resend in",
    backToLogin: "Back to Login",
    pleaseEnterCode: "Please enter the verification code",
    validSixDigitCode: "Please enter a valid 6-digit code",
    unexpectedError: "An unexpected error occurred. Please try again.",
    sending: "Sending...",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  const { verify2FACode, complete2FALogin, send2FACode } = useAuth();
  const router = useRouter();
  const { recordDeviceLogin } = useDeviceLogin();

  // Translate texts
  useEffect(() => {
    if (!isLanguageLoaded || language?.code === "en") {
      setTexts(ORIGINAL_TEXTS);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const items = Object.values(ORIGINAL_TEXTS);
        const translated = await translate(items);
        if (!isMounted) return;

        const translatedTexts = {};
        Object.keys(ORIGINAL_TEXTS).forEach((key, index) => {
          translatedTexts[key] = translated[index];
        });
        setTexts(translatedTexts);
      } catch (error) {
        console.error("Translation error:", error);
        setTexts(ORIGINAL_TEXTS);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language?.code, translate, isLanguageLoaded]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    // Start countdown when component mounts
    setCountdown(30);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!code) {
      setError(texts.pleaseEnterCode);
      setLoading(false);
      return;
    }

    if (code.length !== 6) {
      setError(texts.validSixDigitCode);
      setLoading(false);
      return;
    }

    // Get device info for trust
    const deviceInfo = getDeviceInfo();

    try {
      const result = await verify2FACode(email, code, visitorId, deviceInfo);

      if (result.success) {
        // Record device login BEFORE completing 2FA login
        await recordDeviceLogin();

        const loginResult = await complete2FALogin(email);
        if (loginResult.success) {
          // Redirect to homepage after successful 2FA login
          router.push("/");
        } else {
          setError(loginResult.error);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(texts.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setSendingCode(true);
    setError("");

    const result = await send2FACode(email);

    if (result.success) {
      setCountdown(30);
      setCanResend(false);
      setCode("");
      setError("");
    } else {
      setError(result.error);
    }

    setSendingCode(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setError(""); // Clear error when user types
  };

  return (
    <div className="max-w-[530px] mx-auto bg-black p-4 border border-[#ffffff]/15 rounded-2xl">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            {texts.twoFactorAuth}
          </h2>
          <p className="text-gray-400 text-sm">{texts.enterCodeMessage}</p>
          <p className="text-cyan-400 text-sm mt-2">{email}</p>
          <p className="text-gray-500 text-xs mt-1">
            {texts.trustedDeviceMessage}
          </p>
        </div>

        {/* 2FA Form */}
        <form onSubmit={handleVerify} className="space-y-6 font-secondary">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Code Input */}
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {texts.verificationCode}
            </label>
            <Input
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={handleInputChange}
              placeholder={texts.enterCodePlaceholder}
              maxLength={6}
              required
              className="w-full text-center text-2xl tracking-widest"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? texts.verifying : texts.verifySignIn}
            <ArrowRight size={20} />
          </Button>
        </form>

        {/* Resend Code Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-400 text-sm">
              {texts.didntReceiveCode}
            </span>
            {canResend ? (
              <button
                onClick={handleResendCode}
                disabled={sendingCode}
                className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {sendingCode ? (
                  <>
                    <RefreshCw size={16} className="animate-spin inline mr-1" />
                    {texts.sending}
                  </>
                ) : (
                  texts.resendCode
                )}
              </button>
            ) : (
              <span className="text-gray-500 text-sm">
                {texts.resendIn} {countdown}s
              </span>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            {texts.backToLogin}
          </button>
        </div>
      </div>
    </div>
  );
}
