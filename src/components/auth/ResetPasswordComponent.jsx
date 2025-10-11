"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCustomErrorMessage } from "@/lib/firebaseErrorHandler";
import { ArrowRight, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPasswordComponent() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Original static texts
  const ORIGINAL_TEXTS = {
    resetPassword: "Reset Password",
    enterNewPassword: "Enter your new password below",
    passwordReset: "Password Reset Successfully!",
    passwordResetMessage:
      "Your password has been reset. You can now login with your new password.",
    goToLogin: "Go to Login",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    enterPassword: "Enter your password",
    confirmYourPassword: "Confirm your password",
    resetting: "Resetting...",
    resetMyPassword: "Reset My Password",
    invalidToken: "Invalid or expired reset link",
    passwordsDontMatch: "Passwords don't match",
    passwordTooShort: "Password must be at least 6 characters",
    pleaseEnterPassword: "Please enter your password",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (!tokenParam || !emailParam) {
      setError("Invalid reset link");
    } else {
      setToken(tokenParam);
      setEmail(emailParam);
    }
  }, [searchParams]);

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

    // Validation
    if (!password) {
      setError(texts.pleaseEnterPassword);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(texts.passwordTooShort);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(texts.passwordsDontMatch);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.error || getCustomErrorMessage("PASSWORD_RESET_FAILED"));
      }
    } catch (error) {
      setError(getCustomErrorMessage("NETWORK_ERROR"));
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="font-secondary max-w-[530px] mx-auto bg-black p-4 border border-[#ffffff]/15 rounded-2xl">
        <div className="w-full space-y-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <p className="text-red-400 text-sm">{texts.invalidToken}</p>
          </div>
          <div className="text-center">
            <Button onClick={() => router.push("/forgot-password")}>
              Request New Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-secondary max-w-[530px] mx-auto bg-black p-4 border border-[#ffffff]/15 rounded-2xl">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            {texts.resetPassword}
          </h2>
          <p className="text-gray-400 text-sm">{texts.enterNewPassword}</p>
        </div>

        {success ? (
          /* Success Message */
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-green-400" />
              </div>
              <h3 className="text-green-400 text-lg font-semibold mb-2">
                {texts.passwordReset}
              </h3>
              <p className="text-gray-300 text-sm">
                {texts.passwordResetMessage}
              </p>
            </div>

            <div className="text-center">
              <Button
                onClick={() => router.push("/login")}
                className="flex items-center justify-center gap-2 mx-auto"
              >
                {texts.goToLogin}
                <ArrowRight size={20} />
              </Button>
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

            {/* New Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                {texts.newPassword}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={texts.enterPassword}
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                {texts.confirmPassword}
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={texts.confirmYourPassword}
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div
                    className={`h-2 flex-1 rounded ${
                      password.length >= 6 ? "bg-green-500" : "bg-gray-600"
                    }`}
                  />
                  <div
                    className={`h-2 flex-1 rounded ${
                      password.length >= 8 ? "bg-green-500" : "bg-gray-600"
                    }`}
                  />
                  <div
                    className={`h-2 flex-1 rounded ${
                      password.length >= 10 &&
                      /[A-Z]/.test(password) &&
                      /[0-9]/.test(password)
                        ? "bg-green-500"
                        : "bg-gray-600"
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {password.length < 6
                    ? "Weak password"
                    : password.length < 8
                    ? "Fair password"
                    : "Strong password"}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              <Lock size={20} />
              {loading ? texts.resetting : texts.resetMyPassword}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
