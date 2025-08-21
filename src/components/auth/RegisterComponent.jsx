"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterComponent() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const { signup } = useAuth();
  const router = useRouter();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check if username is available before submitting
    if (formData.username && !usernameAvailable) {
      setError("Username is not available. Please choose a different one.");
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
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setVerificationEmail(formData.email);
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    }

    setLoading(false);
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
          email: verificationEmail,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setError("Verification email sent again! Please check your inbox.");
      } else {
        setError(data.error || "Failed to resend email. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
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
                <li>• Set your password and complete account setup</li>
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
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y6">
          {/* First Name Input */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              First Name
            </label>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
              disabled={loading}
            />
          </div>

          {/* Last Name Input */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              Last Name
            </label>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
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
            {/* Username availability indicator */}
            {formData.username && (
              <div className="mt-2">
                {usernameChecking ? (
                  <span className="text-yellow-400 text-xs">
                    Checking availability...
                  </span>
                ) : usernameAvailable === true ? (
                  <span className="text-green-400 text-xs">
                    ✓ Username is available
                  </span>
                ) : usernameAvailable === false ? (
                  <span className="text-red-400 text-xs">
                    ✗ Username is already taken
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* Create Account Button */}
          <Button
            type="submit"
            variant="secondary"
            className="w-full transition-all duration-200 flex items-center justify-center gap-2"
            disabled={
              loading || (formData.username && usernameAvailable === false)
            }
          >
            {loading ? "Sending Verification..." : "Create An Account"}
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
