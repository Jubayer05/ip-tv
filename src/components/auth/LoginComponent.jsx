"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import TwoFactorAuth from "./TwoFactorAuth";

export default function LoginComponent() {
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
  const [pendingUser, setPendingUser] = useState(null);
  const [sending2FACode, setSending2FACode] = useState(false);

  const { login, send2FACode } = useAuth();
  const router = useRouter();
  const recaptchaRef = useRef();

  useEffect(() => {
    const checkRecaptchaSetting = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.addons) {
          setRecaptchaEnabled(data.data.addons.recaptcha);
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
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Check if reCAPTCHA is completed only when it's enabled
    if (recaptchaEnabled && !recaptchaToken) {
      setError("Please complete the reCAPTCHA verification.");
      setLoading(false);
      return;
    }

    const result = await login(
      formData.email,
      formData.password,
      recaptchaToken
    );

    if (result.success) {
      if (result.requires2FA) {
        // Automatically send 2FA code when 2FA is required
        setSending2FACode(true);
        const codeResult = await send2FACode(formData.email);

        if (codeResult.success) {
          // Show 2FA component
          setPendingUser(result.user);
          setShow2FA(true);
        } else {
          setError(
            `Login successful but failed to send 2FA code: ${codeResult.error}`
          );
        }
        setSending2FACode(false);
      } else {
        // Direct login success
        router.push("/dashboard");
      }
    } else {
      setError(result.error);
      // Reset reCAPTCHA on error only when it's enabled
      if (recaptchaEnabled) {
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      }
    }

    setLoading(false);
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
    setPendingUser(null);
    setError("");
    // Reset reCAPTCHA if enabled
    if (recaptchaEnabled) {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  // Show 2FA component if needed
  if (show2FA) {
    return <TwoFactorAuth email={formData.email} onBack={handleBackToLogin} />;
  }

  return (
    <div className="max-w-[530px] mx-auto bg-black p-4 border border-[#ffffff]/15 rounded-2xl">
      <div className=" w-full space-y-8 ">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6 font-secondary">
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
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
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
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
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
              Forgot your password?
            </Link>
          </div>

          {/* reCAPTCHA */}
          {recaptchaEnabled && (
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                // sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                sitekey="6LdAb78rAAAAAORlKEBeprNUhjmE8L_TxaWSpKkH"
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
              ? "Signing in..."
              : sending2FACode
              ? "Sending 2FA code..."
              : "Sign In"}
            <ArrowRight size={20} />
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-4 text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-400 text-sm font-secondary">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
