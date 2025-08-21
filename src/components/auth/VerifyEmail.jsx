"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmail() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");

  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get only token from URL params
    const token = searchParams.get("token");

    if (token) {
      setVerificationToken(token);
      // Fetch user data using the token
      fetchUserData(token);
    } else {
      router.push("/register");
    }
  }, [searchParams, router]);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`/api/auth/verify/${token}`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setEmail(data.email);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setUserName(data.username);
      } else {
        router.push("/register");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      router.push("/register");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handleVerification = async (e) => {
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

    try {
      const signupResult = await signup(
        email,
        formData.password,
        firstName,
        lastName,
        userName,
        { skipDb: true }
      );

      if (!signupResult.success) {
        throw new Error(signupResult.error);
      }

      // Now create user in your database
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: verificationToken,
          password: formData.password,
          firebaseUid: signupResult.user.uid, // Pass Firebase UID
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to login page since account is created
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(
        error.message ||
          "Network error. Please check your connection and try again."
      );
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
          email,
          firstName,
          lastName,
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

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-secondary">
        <div className="bg-black rounded-3xl p-6 sm:p-8 w-full max-w-lg mx-auto relative border border-[#FFFFFF26]">
          {/* Success Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} className="text-green-400" />
            </div>
            <h1 className="text-white text-xl sm:text-2xl font-bold mb-3 sm:mb-4 tracking-wide">
              ACCOUNT CREATED SUCCESSFULLY!
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Welcome to Cheap Stream! Your account has been verified and
              created.
            </p>
          </div>

          {/* Success Message */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
            <h3 className="text-green-400 text-sm font-semibold mb-2">
              🎉 Welcome aboard!
            </h3>
            <p className="text-gray-300 text-xs leading-relaxed">
              You're now being redirected to login where you can sign in with
              your new account.
            </p>
          </div>

          {/* Redirecting Message */}
          <div className="text-center">
            <p className="text-gray-400 text-xs">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no token, show loading or redirect
  if (!verificationToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-secondary">
        <div className="bg-black rounded-3xl p-6 sm:p-8 w-full max-w-lg mx-auto relative border border-[#FFFFFF26]">
          <div className="text-center">
            <p className="text-gray-300">Loading verification...</p>
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
            VERIFY YOUR EMAIL
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            Complete your registration by setting a password for your account.
          </p>
          {email && (
            <p className="text-white text-sm font-medium mt-2">{email}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleVerification} className="space-y-4 sm:space-y-6">
          {/* Password Input */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              Create Password
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
              Confirm Password
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

          {/* Verify Button */}
          <Button
            type="submit"
            variant="secondary"
            className="w-full transition-all duration-200 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Complete Registration"}
            {!loading && <ArrowRight size={18} />}
          </Button>
        </form>

        {/* Instructions */}
        <div className="space-y-4 mb-6 mt-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-blue-400 text-sm font-semibold mb-2">
              Next Steps:
            </h3>
            <ul className="text-gray-300 text-xs space-y-1">
              <li>• Create a strong password for your account</li>
              <li>• Confirm your password</li>
              <li>• Click verify to complete registration</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleResendEmail}
            disabled={loading}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? "Sending..." : "Resend Verification Email"}
            <Mail size={18} />
          </Button>

          <Link href="/register">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Registration
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
