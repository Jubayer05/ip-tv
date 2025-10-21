"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const LanguageManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [defaultLanguage, setDefaultLanguage] = useState("en");

  // Add fallback languages
  const fallbackLanguages = [
    { code: "en", name: "English", flag: "🇬🇧", isActive: true },
    { code: "sv", name: "Swedish", flag: "🇸🇪", isActive: true },
    { code: "no", name: "Norwegian", flag: "🇳🇴", isActive: true },
    { code: "da", name: "Danish", flag: "🇩🇰", isActive: true },
    { code: "fi", name: "Finnish", flag: "🇫🇮", isActive: true },
    { code: "fr", name: "French", flag: "🇫🇷", isActive: true },
    { code: "de", name: "German", flag: "🇩🇪", isActive: true },
    { code: "es", name: "Spanish", flag: "🇪🇸", isActive: true },
    { code: "it", name: "Italian", flag: "🇮🇹", isActive: true },
    { code: "ru", name: "Russian", flag: "🇷🇺", isActive: true },
    { code: "tr", name: "Turkish", flag: "🇹🇷", isActive: true },
    { code: "ar", name: "Arabic", flag: "🇸🇦", isActive: true },
    { code: "hi", name: "Hindi", flag: "🇮🇳", isActive: true },
    { code: "zh", name: "Chinese", flag: "🇨🇳", isActive: true },
  ];

  useEffect(() => {
    fetchLanguageSettings();
  }, []);

  const fetchLanguageSettings = async () => {
    try {
      console.log("Fetching language settings...");
      const response = await fetch("/api/settings/languages");
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("API Response data:", data);

      if (data.success && data.data && data.data.availableLanguages) {
        console.log(
          "Available Languages from API:",
          data.data.availableLanguages
        );
        console.log("Default Language from API:", data.data.defaultLanguage);
        setLanguages(data.data.availableLanguages);
        setDefaultLanguage(data.data.defaultLanguage || "en");
      } else {
        console.warn("API returned no data, using fallback languages");
        setLanguages(fallbackLanguages);
        setDefaultLanguage("en");
      }
    } catch (error) {
      console.error("Error fetching language settings:", error);
      console.warn("Using fallback languages due to error");
      setLanguages(fallbackLanguages);
      setDefaultLanguage("en");
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Could not load language settings from server. Using default languages.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = (languageCode) => {
    setLanguages((prev) =>
      prev.map((lang) =>
        lang.code === languageCode
          ? { ...lang, isActive: !lang.isActive }
          : lang
      )
    );
  };

  const handleDefaultLanguageChange = (languageCode) => {
    setDefaultLanguage(languageCode);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/languages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availableLanguages: languages,
          defaultLanguage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Language settings updated successfully!",
        });
      } else {
        throw new Error(data.error || "Failed to update language settings");
      }
    } catch (error) {
      console.error("Error updating language settings:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update language settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const activeLanguages = languages.filter((lang) => lang.isActive);
  const inactiveLanguages = languages.filter((lang) => !lang.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          Language Management
        </h2>
        <p className="text-gray-400">
          Manage available languages for your website. Users will only see
          active languages in the language selector.
        </p>
      </div>

      {/* Active Languages */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Active Languages ({activeLanguages.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeLanguages.map((language) => (
            <div
              key={language.code}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{language.flag}</span>
                  <div>
                    <div className="text-white font-medium">
                      {language.name}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {language.code.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="defaultLanguage"
                      checked={defaultLanguage === language.code}
                      onChange={() =>
                        handleDefaultLanguageChange(language.code)
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-300">Default</span>
                  </label>
                  <button
                    onClick={() => handleLanguageToggle(language.code)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inactive Languages */}
      {inactiveLanguages.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Inactive Languages ({inactiveLanguages.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveLanguages.map((language) => (
              <div
                key={language.code}
                className="bg-gray-700 rounded-lg p-4 border border-gray-600 opacity-60"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{language.flag}</span>
                    <div>
                      <div className="text-white font-medium">
                        {language.name}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {language.code.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLanguageToggle(language.code)}
                    className="text-green-400 hover:text-green-300 text-sm"
                  >
                    Activate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-400 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-blue-300 font-medium mb-1">Important Notes</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• At least one language must be active</li>
              <li>• The default language must be active</li>
              <li>• Changes will be reflected immediately on the website</li>
              <li>
                • Users will only see active languages in the language selector
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageManagement;
