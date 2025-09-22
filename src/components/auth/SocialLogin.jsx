"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginOptions } from "@/hooks/useLoginOptions";
import {
  signInWithFacebook,
  signInWithGoogle,
  signInWithTwitter,
} from "@/lib/firebase";
import { useState } from "react";
import { FaFacebook, FaTwitter } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function SocialLogin({ onSuccess, onError, loading = false }) {
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    facebook: false,
    twitter: false,
  });
  const { generateAuthToken } = useAuth();
  const { loginOptions, loading: optionsLoading } = useLoginOptions();

  const handleSocialLogin = async (providerName) => {
    try {
      setSocialLoading((prev) => ({ ...prev, [providerName]: true }));

      let result;
      if (providerName === "google") {
        result = await signInWithGoogle();
      } else if (providerName === "facebook") {
        result = await signInWithFacebook();
      } else if (providerName === "twitter") {
        result = await signInWithTwitter();
        return; // Twitter uses redirect, so we return early
      }

      if (result && result.user) {
        // Send user data to backend to create/update user in database
        const response = await fetch("/api/auth/social-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            provider: providerName,
            emailVerified: result.user.emailVerified,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store token in localStorage for persistence
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          // Generate auth token
          await generateAuthToken(data.user);

          // Force page reload to trigger AuthContext re-initialization
          window.location.href = "/dashboard";
        } else {
          throw new Error(data.error || "Social login failed");
        }
      }
    } catch (error) {
      console.error(`${providerName} login error:`, error);
      onError?.(error.message || `${providerName} login failed`);
    } finally {
      setSocialLoading((prev) => ({ ...prev, [providerName]: false }));
    }
  };

  // Don't render anything if options are still loading
  if (optionsLoading) {
    return null;
  }

  // Don't render if no login options are enabled
  if (!loginOptions.google && !loginOptions.facebook && !loginOptions.twitter) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-black text-gray-400">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Google Login - Only show if enabled */}
        {loginOptions.google && (
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            disabled={loading || socialLoading.google}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-700 rounded-lg text-white hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle size={20} />
            <span className="font-medium">
              {socialLoading.google ? "Signing in..." : "Continue with Google"}
            </span>
          </button>
        )}

        {/* Facebook Login - Only show if enabled */}
        {loginOptions.facebook && (
          <button
            type="button"
            onClick={() => handleSocialLogin("facebook")}
            disabled={loading || socialLoading.facebook}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-700 rounded-lg text-white hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaFacebook size={20} className="text-blue-500" />
            <span className="font-medium">
              {socialLoading.facebook
                ? "Signing in..."
                : "Continue with Facebook"}
            </span>
          </button>
        )}

        {/* Twitter Login - Only show if enabled */}
        {loginOptions.twitter && (
          <button
            type="button"
            onClick={() => handleSocialLogin("twitter")}
            disabled={loading || socialLoading.twitter}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-700 rounded-lg text-white hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTwitter size={20} className="text-blue-400" />
            <span className="font-medium">
              {socialLoading.twitter
                ? "Redirecting..."
                : "Continue with Twitter"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
