"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterComponent() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const result = await signup(
      formData.email,
      formData.password,
      formData.fullName
    );

    if (result.success) {
      setSuccess(true);
      setVerificationEmail(formData.email);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setError("");

    const result = await signup(
      verificationEmail,
      formData.password,
      formData.fullName
    );

    if (result.success) {
      setError("Verification email sent again!");
    } else {
      setError(result.error);
    }

    setLoading(false);
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
              CHECK YOUR EMAIL
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              We've sent a verification link to{" "}
              <span className="text-white font-medium">
                {verificationEmail}
              </span>
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-blue-400 text-sm font-semibold mb-2">
                Next Steps:
              </h3>
              <ul className="text-gray-300 text-xs space-y-1">
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the verification link in the email</li>
                <li>• Return here and sign in with your account</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? "Sending..." : "Resend Verification Email"}
              <Mail size={18} />
            </Button>

            <Link href="/login">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                Go to Sign In
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-xs">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
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
            NEW HERE? CREATE AN ACCOUNT
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            Join Cheap Stream in just a few clicks and unlock instant access to
            movies, shows, and live TV.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Full Name Input */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              Full Name
            </label>
            <Input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          {/* Email Address Input */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              Email Address
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
              disabled={loading}
            />
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              Username
            </label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              Confirm your Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Create Account Button */}
          <Button
            type="submit"
            variant="secondary"
            className="w-full transition-all duration-200 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create An Account"}
            {!loading && <ArrowRight size={18} />}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-4 sm:my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-3 sm:px-4 text-gray-400 text-xs sm:text-sm">
            OR
          </span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-300 text-xs sm:text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
