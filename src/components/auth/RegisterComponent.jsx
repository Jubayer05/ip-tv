"use client";
import ErrorNotification from "@/components/common/ErrorNotification";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDeviceLogin } from "@/hooks/useDeviceLogin";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Select from "react-select";
import countryList from "react-select-country-list";
import SocialLogin from "./SocialLogin";

export default function RegisterComponent({ referralCode = "" }) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    country: "",
    countryCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false);
  const [socialError, setSocialError] = useState("");

  // Original static texts
  const ORIGINAL_TEXTS = {
    newHereTitle: "NEW HERE? CREATE AN ACCOUNT",
    newHereMessage:
      "Join Cheap Stream in just a few clicks and unlock instant access to movies, shows, and live TV.",
    checkYourEmail: "CHECK YOUR EMAIL",
    emailSentMessage: "We've sent a verification link to",
    nextSteps: "Next Steps:",
    checkEmailInbox: "Check your email inbox (and spam folder)",
    clickVerificationLink: "Click the verification link in the email",
    setPasswordComplete: "Set your password and complete account setup",
    resendVerificationEmail: "Resend Verification Email",
    goToSignIn: "Go to Sign In",
    didntReceiveEmail:
      "Didn't receive the email? Check your spam folder or try resending.",
    verifyYourEmail: "VERIFY YOUR EMAIL",
    completeRegistrationMessage:
      "Complete your registration by setting a password for your account.",
    createPassword: "Create Password",
    confirmPassword: "Confirm Password",
    creatingAccount: "Creating Account...",
    completeRegistration: "Complete Registration",
    nextStepsInstructions: "Next Steps:",
    createStrongPassword: "Create a strong password for your account",
    confirmYourPassword: "Confirm your password",
    clickVerify: "Click verify to complete registration",
    resendVerificationEmailAgain: "Resend Verification Email",
    backToRegistration: "Back to Registration",
    firstName: "First Name",
    enterFirstName: "Enter your first name",
    lastName: "Last Name",
    enterLastName: "Enter your last name",
    emailAddress: "Email Address",
    enterEmailAddress: "Enter your email address",
    username: "Username",
    enterUsername: "Enter your username",
    country: "Country",
    selectCountry: "Select your country",
    checkingAvailability: "Checking availability...",
    usernameAvailable: "✓ Username is available",
    usernameTaken: "✗ Username is already taken",
    createAnAccount: "Create An Account",
    sendingVerification: "Sending Verification...",
    or: "OR",
    alreadyHaveAccount: "Already have an account?",
    logIn: "Log In",
    completeRecaptcha: "Please complete the reCAPTCHA verification.",
    registrationFailed: "Registration failed. Please try again.",
    networkError: "Network error. Please check your connection and try again.",
    failedToResend: "Failed to resend email. Please try again.",
    accountCreatedSuccessfully: "ACCOUNT CREATED SUCCESSFULLY!",
    welcomeToCheapStream:
      "Welcome to Cheap Stream! Your account has been verified and created.",
    welcomeAboard: "Welcome aboard!",
    redirectingMessage:
      "You're now being redirected to your dashboard where you can start exploring our services.",
    redirectingToDashboard: "Redirecting to dashboard...",
    loadingVerification: "Loading verification...",
    passwordsDoNotMatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters long",
    verificationFailed: "Verification failed. Please try again.",
    sending: "Sending...",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  const recaptchaRef = useRef();
  const countryOptions = useMemo(() => countryList().getData(), []);
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

  // Normalize referral code to uppercase
  const normalizedReferralCode = referralCode
    ? String(referralCode).toUpperCase()
    : "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types

    // Check username availability when username field changes
    if (name === "username" && value.trim()) {
      checkUsernameAvailability(value.trim());
    } else if (name === "username") {
      setUsernameAvailable(null);
    }
  };

  const handleCountryChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      country: selectedOption ? selectedOption.label : "",
      countryCode: selectedOption ? selectedOption.value : "",
    }));
    setError(""); // Clear error when user selects country
  };

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameChecking(true);
    try {
      const response = await fetch(
        `/api/users/check-username?username=${encodeURIComponent(username)}`
      );
      const data = await response.json();

      if (response.ok) {
        setUsernameAvailable(data.available);
      } else {
        setUsernameAvailable(null);
      }
    } catch (error) {
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    setError(""); // Clear any previous errors
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check if reCAPTCHA is completed only when it's enabled
    if (recaptchaEnabled && !recaptchaToken) {
      setError(texts.completeRecaptcha);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          referralCode: normalizedReferralCode || null,
          recaptchaToken: recaptchaToken,
          country: formData.country,
          countryCode: formData.countryCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setVerificationEmail(formData.email);
      } else {
        setError(data.error || texts.registrationFailed);
      }
    } catch (error) {
      setError(texts.networkError);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          referralCode: normalizedReferralCode || null,
          recaptchaToken: recaptchaToken,
          country: formData.country,
          countryCode: formData.countryCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setVerificationEmail(formData.email);
      } else {
        setError(data.error || texts.failedToResend);
      }
    } catch (error) {
      setError(texts.networkError);
    }

    setLoading(false);
  };

  const handleSocialSuccess = (data) => {
    // Store token and user data
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect to dashboard
    // Assuming you have a router object available, otherwise use window.location.href
    // For now, we'll just show a success message or redirect manually if no router
    // If you're using Next.js, you might need to use next/router or similar
    // For now, we'll just show a success message
    alert("Social login successful!");
    // Example: window.location.href = '/dashboard';
  };

  const handleSocialError = (error) => {
    setSocialError(error);
    setTimeout(() => setSocialError(""), 5000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-secondary">
        <div className="bg-black rounded-3xl p-6 sm:p-8 w-full max-w-lg mx-auto relative border border-[#FFFFFF26]">
          {/* Success Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-green-400" />
            </div>
            <h1 className="text-white text-xl sm:text-2xl font-bold mb-3 sm:mb-4 tracking-wide">
              {texts.checkYourEmail}
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              {texts.emailSentMessage}{" "}
              <span className="text-white font-medium">
                {verificationEmail}
              </span>
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-blue-400 text-sm font-semibold mb-2">
                {texts.nextSteps}
              </h3>
              <ul className="text-gray-300 text-xs space-y-1">
                <li>• {texts.checkEmailInbox}</li>
                <li>• {texts.clickVerificationLink}</li>
                <li>• {texts.setPasswordComplete}</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mb-2"
            >
              {loading ? texts.sending : texts.resendVerificationEmail}
              <Mail size={18} />
            </Button>

            <Link href="/login">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                {texts.goToSignIn}
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-xs">{texts.didntReceiveEmail}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-secondary">
      <div className="bg-black rounded-3xl p-6 sm:p-8 w-full max-w-lg mx-auto relative border border-[#FFFFFF26]">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-white text-xl sm:text-2xl font-bold mb-3 sm:mb-4 tracking-wide">
            {texts.newHereTitle}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            {texts.newHereMessage}
          </p>
        </div>

        {/* Error Notification */}
        <ErrorNotification error={error} onClose={() => setError("")} />

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6">
          {/* First Name Input */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              {texts.firstName}
            </label>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder={texts.enterFirstName}
              required
              disabled={loading}
            />
          </div>

          {/* Last Name Input */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              {texts.lastName}
            </label>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder={texts.enterLastName}
              required
              disabled={loading}
            />
          </div>

          {/* Email Address Input */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              {texts.emailAddress}
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={texts.enterEmailAddress}
              required
              disabled={loading}
            />
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              {texts.username}
            </label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={texts.enterUsername}
              required
              disabled={loading}
            />
            {/* Username availability indicator */}
            {formData.username && (
              <div className="mt-2">
                {usernameChecking ? (
                  <span className="text-yellow-400 text-xs">
                    {texts.checkingAvailability}
                  </span>
                ) : usernameAvailable === true ? (
                  <span className="text-green-400 text-xs">
                    {texts.usernameAvailable}
                  </span>
                ) : usernameAvailable === false ? (
                  <span className="text-red-400 text-xs">
                    {texts.usernameTaken}
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* Country Selection */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              {texts.country}
            </label>
            <Select
              options={countryOptions}
              value={countryOptions.find(
                (option) => option.value === formData.countryCode
              )}
              onChange={handleCountryChange}
              placeholder={texts.selectCountry}
              isDisabled={loading}
              className="text-black"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "#0C171C",
                  borderColor: "#374151",
                  "&:hover": {
                    borderColor: "#6b7280",
                  },
                  borderRadius: "35px",
                  padding: "5px 10px",
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? "#10b981"
                    : state.isFocused
                    ? "#374151"
                    : "#1f2937",
                  color: state.isSelected ? "#000" : "#fff",
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "#fff",
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: "#9ca3af",
                }),
                input: (provided) => ({
                  ...provided,
                  color: "#fff",
                }),
              }}
            />
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

          {/* Create Account Button */}
          <Button
            type="submit"
            variant="secondary"
            className="w-full transition-all duration-200 flex items-center justify-center gap-2"
            disabled={
              loading ||
              (formData.username && usernameAvailable === false) ||
              (recaptchaEnabled && !recaptchaToken) ||
              !formData.country ||
              !formData.countryCode
            }
          >
            {loading ? (
              texts.sendingVerification
            ) : (
              <>
                {texts.createAnAccount}
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-4 sm:my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-3 sm:px-4 text-gray-400 text-xs sm:text-sm">
            {texts.or}
          </span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Social Login */}
        <SocialLogin
          onSuccess={handleSocialSuccess}
          onError={handleSocialError}
          loading={loading}
        />

        {/* Social Error Notification */}
        <ErrorNotification
          error={socialError}
          onClose={() => setSocialError("")}
        />

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-300 text-xs sm:text-sm">
            {texts.alreadyHaveAccount}{" "}
            <Link
              href="/login"
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
            >
              {texts.logIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
