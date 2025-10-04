"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";
import { FaFacebook, FaTwitter } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const LoginOptionManagement = () => {
  const { apiCall } = useApi();
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loginOptions, setLoginOptions] = useState({
    google: false,
    facebook: false,
    twitter: false,
  });

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Login Options Management",
    subtitle: "Enable or disable social login options for your website.",
    googleLogin: "Google Login",
    googleDescription: "Allow users to sign in with Google accounts",
    facebookLogin: "Facebook Login",
    facebookDescription: "Allow users to sign in with Facebook accounts",
    twitterLogin: "Twitter Login",
    twitterDescription: "Allow users to sign in with Twitter accounts",
    failedToLoadSettings: "Failed to load settings",
    failedToUpdateLoginOptions: "Failed to update login options",
    loginOptionsUpdatedSuccess: "Login options updated successfully!",
    refresh: "Refresh",
    updating: "Updating...",
    updateLoginOptions: "Update Login Options",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  // Translate texts when language changes
  useEffect(() => {
    if (!isLanguageLoaded || !language) return;

    const translateTexts = async () => {
      const keys = Object.keys(ORIGINAL_TEXTS);
      const values = Object.values(ORIGINAL_TEXTS);

      try {
        const translatedValues = await translate(values);
        const translatedTexts = {};

        keys.forEach((key, index) => {
          translatedTexts[key] = translatedValues[index] || values[index];
        });

        setTexts(translatedTexts);
      } catch (error) {
        console.error("Translation error:", error);
        setTexts(ORIGINAL_TEXTS);
      }
    };

    translateTexts();
  }, [language, isLanguageLoaded, translate]);

  const loginOptionConfigs = [
    {
      key: "google",
      label: texts.googleLogin,
      description: texts.googleDescription,
      icon: FcGoogle,
      color: "text-blue-500",
    },
    {
      key: "facebook",
      label: texts.facebookLogin,
      description: texts.facebookDescription,
      icon: FaFacebook,
      color: "text-blue-600",
    },
    {
      key: "twitter",
      label: texts.twitterLogin,
      description: texts.twitterDescription,
      icon: FaTwitter,
      color: "text-blue-400",
    },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/api/admin/settings", "GET");
      if (response.success) {
        if (response.data.loginOptions) {
          setLoginOptions(response.data.loginOptions);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setError(texts.failedToLoadSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOptionToggle = (optionKey, value) => {
    setLoginOptions((prev) => ({
      ...prev,
      [optionKey]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const response = await apiCall("/api/admin/settings", "PUT", {
        loginOptions: loginOptions,
      });

      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } else {
        setError(response.error || texts.failedToUpdateLoginOptions);
      }
    } catch (error) {
      console.error("Failed to update login options:", error);
      setError(texts.failedToUpdateLoginOptions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-secondary px-4 sm:px-6 lg:px-8">
      <div className="bg-black border border-[#212121] rounded-lg p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl md:text-3xl text-center font-bold mb-3 sm:mb-4">
          {texts.heading}
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6 text-center">
          {texts.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {loginOptionConfigs.map((option) => {
              const IconComponent = option.icon;
              const isEnabled = loginOptions[option.key];

              return (
                <div
                  key={option.key}
                  className="border border-[#333] rounded-lg p-3 sm:p-4 hover:border-[#555] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <IconComponent
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${option.color}`}
                      />
                      <div>
                        <h3 className="text-white font-semibold text-xs sm:text-sm">
                          {option.label}
                        </h3>
                        <p className="text-gray-400 text-[10px] sm:text-xs mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) =>
                          handleLoginOptionToggle(option.key, e.target.checked)
                        }
                        className="sr-only peer"
                        disabled={loading}
                      />
                      <div className="w-9 h-5 sm:w-11 sm:h-6 bg-[#333] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="text-xs sm:text-sm text-red-400">{error}</div>
          )}
          {saved && (
            <div className="text-xs sm:text-sm text-green-400 text-center">
              {texts.loginOptionsUpdatedSuccess}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 border border-[#333] text-white rounded-md hover:bg-[#212121] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {texts.refresh}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {loading ? texts.updating : texts.updateLoginOptions}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginOptionManagement;
