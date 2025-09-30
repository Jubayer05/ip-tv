"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ErrorNotification from "@/components/common/ErrorNotification";
import { getCustomErrorMessage } from "@/lib/firebaseErrorHandler";

export default function ForgotPasswordComponent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address");
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
        setError(data.error || getCustomErrorMessage('PASSWORD_RESET_FAILED'));
      }
    } catch (error) {
      setError(getCustomErrorMessage('NETWORK_ERROR'));
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
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-400 text-sm">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        {success ? (
          /* Success Message */
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-green-400" />
              </div>
              <h3 className="text-green-400 text-lg font-semibold mb-2">
                Check Your Email
              </h3>
              <p className="text-gray-300 text-sm">
                We've sent a password reset link to{" "}
                <span className="text-white font-medium">{email}</span>
              </p>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-400 text-sm">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <Mail size={20} />
                  Resend Email
                </Button>

                <Button
                  onClick={handleBackToLogin}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Back to Login
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
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
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
              {loading ? "Sending..." : "Send Reset Link"}
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
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
