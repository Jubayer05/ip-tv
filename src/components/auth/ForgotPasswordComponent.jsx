"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCustomErrorMessage } from "@/lib/firebaseErrorHandler";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ForgotPasswordComponent() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Original static texts
  const ORIGINAL_TEXTS = {
    resetPassword: "Reset Password",
    enterEmailMessage:
      "Enter your email address and we'll send you a link to reset your password",
    checkYourEmail: "Check Your Email",
    emailSentMessage: "We've sent a password reset link to",
    noEmailMessage:
      "Didn't receive the email? Check your spam folder or try again.",
    resendEmail: "Resend Email",
    backToLogin: "Back to Login",
    backToSignIn: "Back to Sign In",
    emailAddress: "Email Address",
    enterEmailPlaceholder: "Enter your email address",
    sending: "Sending...",
    sendResetLink: "Send Reset Link",
    pleaseEnterEmail: "Please enter your email address",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  const router = useRouter();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!email) {
      setError(texts.pleaseEnterEmail);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || getCustomErrorMessage("PASSWORD_RESET_FAILED"));
      }
    } catch (error) {
      setError(getCustomErrorMessage("NETWORK_ERROR"));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="font-secondary max-w-[530px] mx-auto bg-black p-4 border border-[#ffffff]/15 rounded-2xl">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            {texts.resetPassword}
          </h2>
          <p className="text-gray-400 text-sm">{texts.enterEmailMessage}</p>
        </div>

        {success ? (
          /* Success Message */
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-green-400" />
              </div>
              <h3 className="text-green-400 text-lg font-semibold mb-2">
                {texts.checkYourEmail}
              </h3>
              <p className="text-gray-300 text-sm">
                {texts.emailSentMessage}{" "}
                <span className="text-white font-medium">{email}</span>
              </p>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-400 text-sm">{texts.noEmailMessage}</p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <Mail size={20} />
                  {texts.resendEmail}
                </Button>

                <Button
                  onClick={handleBackToLogin}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} />
                  {texts.backToLogin}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Reset Password Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                {texts.emailAddress}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={texts.enterEmailPlaceholder}
                required
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? texts.sending : texts.sendResetLink}
              <ArrowRight size={20} />
            </Button>
          </form>
        )}

        {/* Back to Login Link */}
        {!success && (
          <div className="text-center">
            <button
              onClick={handleBackToLogin}
              className="text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft size={16} />
              {texts.backToSignIn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
