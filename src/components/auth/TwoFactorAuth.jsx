"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TwoFactorAuth({ email, onBack }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const { verify2FACode, complete2FALogin, send2FACode } = useAuth();
  const router = useRouter();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!code) {
      setError("Please enter the verification code");
      setLoading(false);
      return;
    }

    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    const result = await verify2FACode(email, code);

    if (result.success) {
      // Complete the login process
      const loginResult = await complete2FALogin(email);
      if (loginResult.success) {
        router.push("/dashboard");
      } else {
        setError(
          "Login completed but failed to set session. Please try again."
        );
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
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
            Two-Factor Authentication
          </h2>
          <p className="text-gray-400 text-sm">
            Enter the 6-digit code sent to your email
          </p>
          <p className="text-cyan-400 text-sm mt-2">{email}</p>
          <p className="text-gray-500 text-xs mt-1">
            For your security, 2FA is required for all logins
          </p>
        </div>

        {/* 2FA Form */}
        <form onSubmit={handleSubmit} className="space-y-6 font-secondary">
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
              Verification Code
            </label>
            <Input
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={handleInputChange}
              placeholder="Enter 6-digit code"
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
            {loading ? "Verifying..." : "Verify & Sign In"}
            <ArrowRight size={20} />
          </Button>
        </form>

        {/* Resend Code Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-400 text-sm">
              Didn't receive the code?
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
                    Sending...
                  </>
                ) : (
                  "Resend Code"
                )}
              </button>
            ) : (
              <span className="text-gray-500 text-sm">
                Resend in {countdown}s
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
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
