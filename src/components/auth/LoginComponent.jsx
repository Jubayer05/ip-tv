"use client";
import ErrorNotification from "@/components/common/ErrorNotification";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDeviceLogin } from "@/hooks/useDeviceLogin";
import { generateVisitorId, getDeviceInfo } from "@/lib/fingerprint";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import SocialLogin from "./SocialLogin";
import TwoFactorAuth from "./TwoFactorAuth";

export default function LoginComponent() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [sending2FACode, setSending2FACode] = useState(false);
  const [socialError, setSocialError] = useState("");
  const [visitorId, setVisitorId] = useState(null);

  // Original static texts
  const ORIGINAL_TEXTS = {
    welcomeBack: "Welcome Back",
    signInMessage: "Sign in to your account to continue",
    emailAddress: "Email Address",
    enterEmailPlaceholder: "Enter your email address",
    password: "Password",
    enterPasswordPlaceholder: "Enter your password",
    forgotPassword: "Forgot your password?",
    orContinueWith: "Or continue with",
    signingIn: "Signing in...",
    sending2FACode: "Sending 2FA code...",
    signIn: "Sign In",
    or: "OR",
    dontHaveAccount: "Don't have an account?",
    signUpHere: "Sign up here",
    fillAllFields: "Please fill in all fields",
    completeRecaptcha: "Please complete the reCAPTCHA verification.",
    unexpectedError: "An unexpected error occurred. Please try again.",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  const { login, send2FACode, complete2FALogin } = useAuth();
  const router = useRouter();
  const recaptchaRef = useRef();
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

  // Generate visitor ID on component mount
  useEffect(() => {
    const initVisitorId = async () => {
      try {
        const id = await generateVisitorId();
        setVisitorId(id);

        // Track visitor
        const deviceInfo = getDeviceInfo();
        await fetch("/api/visitors/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId: id,
            deviceInfo,
          }),
        });
      } catch (error) {
        console.error("Visitor ID generation failed:", error);
      }
    };

    initVisitorId();
  }, []);

  useEffect(() => {
    const checkRecaptchaSetting = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.addons) {
          setRecaptchaEnabled(data.data.addons.recaptcha);
          // Store the site key for later use
          if (data.data.apiKeys?.recaptcha?.siteKey) {
            window.RECAPTCHA_SITE_KEY = data.data.apiKeys.recaptcha.siteKey;
          }
        }
      } catch (error) {
        console.error("Failed to check reCAPTCHA setting:", error);
      }
    };

    checkRecaptchaSetting();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError(texts.fillAllFields);
      setLoading(false);
      return;
    }

    // Check if reCAPTCHA is completed only when it's enabled
    if (recaptchaEnabled && !recaptchaToken) {
      setError(texts.completeRecaptcha);
      setLoading(false);
      return;
    }

    try {
      // Pass visitorId to login function
      const result = await login(
        formData.email,
        formData.password,
        recaptchaToken,
        visitorId
      );

      if (result.success) {
        if (result.requires2FA) {
          // For 2FA flow, we'll record after 2FA completion
          setSending2FACode(true);
          const codeResult = await send2FACode(formData.email);

          if (codeResult.success) {
            // Show 2FA component
            setShow2FA(true);
          } else {
            setError(
              `Login successful but failed to send 2FA code: ${codeResult.error}`
            );
          }
          setSending2FACode(false);
        } else {
          // Trusted device - direct login, record device and redirect
          await recordDeviceLogin();
          // router.push("/dashboard");
          window.location.href = "/dashboard";
        }
      } else {
        setError(result.error);
        // Reset reCAPTCHA on error only when it's enabled
        if (recaptchaEnabled) {
          recaptchaRef.current?.reset();
          setRecaptchaToken(null);
        }
      }
    } catch (error) {
      setError(texts.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    setError(""); // Clear any previous errors
  };

  const handleBackToLogin = () => {
    setShow2FA(false);
    setError("");
    // Reset reCAPTCHA if enabled
    if (recaptchaEnabled) {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  const handleSocialSuccess = (data) => {
    // The SocialLogin component now handles AuthContext updates
    // Just redirect to dashboard
    window.location.href = "/dashboard";
  };

  const handleSocialError = (error) => {
    setSocialError(error);
    setTimeout(() => setSocialError(""), 5000);
  };

  // Show 2FA component if needed
  if (show2FA) {
    return (
      <TwoFactorAuth
        email={formData.email}
        onBack={handleBackToLogin}
        visitorId={visitorId}
      />
    );
  }

  return (
    <div className="max-w-[530px] mx-auto bg-black p-4 border border-[#ffffff]/15 rounded-2xl">
      {/* Error Notification */}
      <ErrorNotification error={error} onClose={() => setError("")} />

      <div className=" w-full space-y-8 ">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            {texts.welcomeBack}
          </h2>
          <p className="text-gray-400 text-sm">{texts.signInMessage}</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6 font-secondary">
          {/* Remove the inline error display since we're using SweetAlert */}

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
              value={formData.email}
              onChange={handleInputChange}
              placeholder={texts.enterEmailPlaceholder}
              required
              className="w-full"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {texts.password}
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder={texts.enterPasswordPlaceholder}
                required
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {texts.forgotPassword}
            </Link>
          </div>

          {/* reCAPTCHA */}
          {recaptchaEnabled && (
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={
                  window.RECAPTCHA_SITE_KEY ||
                  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
                }
                onChange={handleRecaptchaChange}
                theme="dark"
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              loading || sending2FACode || (recaptchaEnabled && !recaptchaToken)
            }
            className="w-full flex items-center justify-center gap-2"
          >
            {loading
              ? texts.signingIn
              : sending2FACode
              ? texts.sending2FACode
              : texts.signIn}
            <ArrowRight size={20} />
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-4 text-gray-400 text-sm">{texts.or}</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Social Login */}
        <SocialLogin
          onSuccess={handleSocialSuccess}
          onError={handleSocialError}
          loading={loading || sending2FACode}
        />

        {/* Social Error Notification */}
        <ErrorNotification
          error={socialError}
          onClose={() => setSocialError("")}
        />

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-400 text-sm font-secondary">
            {texts.dontHaveAccount}{" "}
            <Link
              href="/register"
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              {texts.signUpHere}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
