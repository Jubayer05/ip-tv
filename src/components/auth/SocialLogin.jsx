"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDeviceLogin } from "@/hooks/useDeviceLogin";
import { useLoginOptions } from "@/hooks/useLoginOptions";
import {
  signInWithFacebook,
  signInWithGoogle,
  signInWithTwitter,
} from "@/lib/firebase";
import {
  getCustomErrorMessage,
  getFirebaseErrorMessage,
  isFirebaseError,
} from "@/lib/firebaseErrorHandler";
import { Facebook, Twitter } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SocialLogin({ onSuccess, onError, loading = false }) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    facebook: false,
    twitter: false,
  });

  // Original static texts
  const ORIGINAL_TEXTS = {
    orContinueWith: "Or continue with",
    signingIn: "Signing in...",
    continueWithGoogle: "Continue with Google",
    continueWithFacebook: "Continue with Facebook",
    continueWithTwitter: "Continue with Twitter",
    redirecting: "Redirecting...",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  const { generateAuthToken } = useAuth();
  const { loginOptions, loading: optionsLoading } = useLoginOptions();
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

          // Record device login BEFORE redirecting
          await recordDeviceLogin();

          // Redirect to homepage after successful login
          window.location.href = "/";
        } else {
          throw new Error(data.error || "Social login failed");
        }
      }
    } catch (error) {
      console.error(`${providerName} login error:`, error);

      // Use custom error handler for Firebase errors
      const customError = isFirebaseError(error)
        ? getFirebaseErrorMessage(error)
        : getCustomErrorMessage("SOCIAL_LOGIN_FAILED", {
            provider: providerName,
          });

      onError?.(customError);
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
          <span className="px-2 bg-black text-gray-400">
            {texts.orContinueWith}
          </span>
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
            <Image
              src="/logos/google.png"
              alt="Google"
              width={20}
              height={20}
            />
            <span className="font-medium">
              {socialLoading.google
                ? texts.signingIn
                : texts.continueWithGoogle}
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
            <Facebook size={20} className="text-blue-500" />
            <span className="font-medium">
              {socialLoading.facebook
                ? texts.signingIn
                : texts.continueWithFacebook}
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
            <Twitter size={20} className="text-blue-400" />
            <span className="font-medium">
              {socialLoading.twitter
                ? texts.redirecting
                : texts.continueWithTwitter}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
