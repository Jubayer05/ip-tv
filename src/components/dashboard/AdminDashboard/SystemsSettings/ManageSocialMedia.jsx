"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { useEffect, useState } from "react";

const ManageSocialMedia = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [socialMedia, setSocialMedia] = useState({
    x: "",
    linkedin: "",
    instagram: "",
    youtube: "",
  });

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Social Media Management",
    subtitle:
      "Manage your social media links that will be displayed in the footer.",
    socialMediaLinks: "Social Media Links",
    xTwitter: "X (Twitter)",
    linkedin: "LinkedIn",
    instagram: "Instagram",
    youtube: "YouTube",
    enterXUrl: "Enter X (Twitter) URL",
    enterLinkedinUrl: "Enter LinkedIn URL",
    enterInstagramUrl: "Enter Instagram URL",
    enterYoutubeUrl: "Enter YouTube URL",
    refresh: "Refresh",
    saving: "Saving...",
    save: "Save",
    settingsSaved: "Settings saved",
    failedToLoadSettings: "Failed to load settings",
    failedToUpdateSettings: "Failed to update settings",
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/api/admin/settings?nocache=true", "GET");
      if (response.success) {
        setSocialMedia(response.data.socialMedia || socialMedia);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setError(texts.failedToLoadSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialMediaChange = (platform, value) => {
    setSocialMedia((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const response = await apiCall("/api/admin/settings", "PUT", {
        socialMedia: socialMedia,
      });
      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      setError(texts.failedToUpdateSettings);
    } finally {
      setLoading(false);
    }
  };

  const socialPlatforms = [
    { key: "x", label: texts.xTwitter, icon: Twitter, color: "text-white" },
    {
      key: "linkedin",
      label: texts.linkedin,
      icon: Linkedin,
      color: "text-blue-400",
    },
    {
      key: "instagram",
      label: texts.instagram,
      icon: Instagram,
      color: "text-pink-400",
    },
    {
      key: "youtube",
      label: texts.youtube,
      icon: Youtube,
      color: "text-red-400",
    },
  ];

  return (
    <div className="flex flex-col gap-3 sm:gap-4 font-secondary">
      <div className="bg-black border border-[#212121] rounded-lg p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl lg:text-3xl text-center font-bold mb-3 sm:mb-4">
          {texts.heading}
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6 text-center sm:text-left">
          {texts.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Social Media Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
              {texts.socialMediaLinks}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {socialPlatforms.map((platform) => {
                const IconComponent = platform.icon;
                const placeholderMap = {
                  x: texts.enterXUrl,
                  linkedin: texts.enterLinkedinUrl,
                  instagram: texts.enterInstagramUrl,
                  youtube: texts.enterYoutubeUrl,
                };
                return (
                  <div key={platform.key} className="space-y-2">
                    <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300">
                      <IconComponent
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${platform.color}`}
                      />
                      <span>{platform.label}</span>
                    </label>
                    <input
                      type="url"
                      value={socialMedia[platform.key]}
                      onChange={(e) =>
                        handleSocialMediaChange(platform.key, e.target.value)
                      }
                      placeholder={placeholderMap[platform.key]}
                      className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-xs sm:text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="text-xs sm:text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}
          {saved && (
            <div className="text-xs sm:text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              {texts.settingsSaved}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading}
              className="px-4 py-2 border border-[#333] text-white rounded-md hover:bg-[#212121] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
            >
              {texts.refresh}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
            >
              {loading ? texts.saving : texts.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageSocialMedia;
