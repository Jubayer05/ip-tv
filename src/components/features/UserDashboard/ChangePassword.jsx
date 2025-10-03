"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { auth } from "@/lib/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function ChangePassword() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const ORIGINAL_TEXTS = {
    heading: "Change Password",
    subtitle: "Update your account password for better security",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    enterCurrentPassword: "Enter your current password",
    enterNewPassword: "Enter your new password",
    confirmNewPassword: "Confirm your new password",
    changePassword: "Change Password",
    changing: "Changing Password...",
    passwordChanged: "Password Changed!",
    passwordUpdatedSuccessfully: "Your password has been updated successfully.",
    error: "Error",
    invalidCurrentPassword: "Invalid current password. Please try again.",
    passwordsDoNotMatch: "New passwords do not match.",
    weakPassword: "Password should be at least 6 characters long.",
    samePassword: "New password must be different from current password.",
    failedToUpdatePassword: "Failed to update password. Please try again.",
    networkError: "Network error. Please check your connection and try again.",
    currentPasswordRequired: "Current password is required",
    newPasswordRequired: "New password is required",
    confirmPasswordRequired: "Please confirm your new password",
    passwordRequirements: "Password Requirements:",
    minLength: "At least 6 characters long",
    differentFromCurrent: "Different from current password",
    passwordsMatch: "Passwords must match",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = Object.values(ORIGINAL_TEXTS);
      const translated = await translate(items);
      if (!isMounted) return;

      const translatedTexts = {};
      Object.keys(ORIGINAL_TEXTS).forEach((key, index) => {
        translatedTexts[key] = translated[index];
      });
      setTexts(translatedTexts);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = texts.currentPasswordRequired;
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = texts.newPasswordRequired;
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = texts.weakPassword;
    } else if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = texts.samePassword;
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = texts.confirmPasswordRequired;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = texts.passwordsDoNotMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const user = auth.currentUser;

      if (!user || !user.email) {
        throw new Error("No authenticated user found");
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, formData.newPassword);

      // Success
      Swal.fire({
        icon: "success",
        title: texts.passwordChanged,
        text: texts.passwordUpdatedSuccessfully,
        confirmButtonColor: "#44dcf3",
        timer: 3000,
        showConfirmButton: false,
      });

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);

      let errorMessage = texts.failedToUpdatePassword;

      if (error.code === "auth/wrong-password") {
        errorMessage = texts.invalidCurrentPassword;
        setErrors({ currentPassword: texts.invalidCurrentPassword });
      } else if (error.code === "auth/weak-password") {
        errorMessage = texts.weakPassword;
        setErrors({ newPassword: texts.weakPassword });
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = texts.invalidCurrentPassword;
        setErrors({ currentPassword: texts.invalidCurrentPassword });
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = texts.networkError;
      }

      Swal.fire({
        icon: "error",
        title: texts.error,
        text: errorMessage,
        confirmButtonColor: "#44dcf3",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <div className="space-y-6 font-secondary">
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-900/20 rounded-lg">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{texts.heading}</h2>
            <p className="text-gray-400 text-sm">{texts.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {texts.currentPassword} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                placeholder={texts.enterCurrentPassword}
                className={`w-full pl-10 pr-12 py-3 bg-[#0c171c] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.currentPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-[#212121] hover:border-gray-600"
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPasswords.current ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-400">
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {texts.newPassword} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                placeholder={texts.enterNewPassword}
                className={`w-full pl-10 pr-12 py-3 bg-[#0c171c] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.newPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-[#212121] hover:border-gray-600"
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-400">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {texts.confirmPassword} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder={texts.confirmNewPassword}
                className={`w-full pl-10 pr-12 py-3 bg-[#0c171c] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-[#212121] hover:border-gray-600"
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-300 mb-2">
              {texts.passwordRequirements}
            </h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    formData.newPassword.length >= 6
                      ? "bg-green-400"
                      : "bg-gray-500"
                  }`}
                ></div>
                {texts.minLength}
              </li>
              <li className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    formData.currentPassword !== formData.newPassword &&
                    formData.newPassword
                      ? "bg-green-400"
                      : "bg-gray-500"
                  }`}
                ></div>
                {texts.differentFromCurrent}
              </li>
              <li className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    formData.newPassword === formData.confirmPassword &&
                    formData.confirmPassword
                      ? "bg-green-400"
                      : "bg-gray-500"
                  }`}
                ></div>
                {texts.passwordsMatch}
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {texts.changing}
                </>
              ) : (
                texts.changePassword
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
