"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import {
  BarChart3,
  Cloud,
  Eye,
  MessageCircle,
  Shield,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";

const ManageAddons = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [addons, setAddons] = useState({
    recaptcha: false,
    trustPilot: false,
    googleAnalytics: false,
    microsoftClarity: false,
    cloudflare: false,
    getButton: false,
    tawkTo: false,
  });

  const [apiKeys, setApiKeys] = useState({
    recaptcha: { siteKey: "", secretKey: "" },
    trustPilot: { businessId: "", apiKey: "" },
    googleAnalytics: { measurementId: "" },
    microsoftClarity: { projectId: "" },
    cloudflare: { token: "" },
    getButton: { widgetId: "" },
    tawkTo: { propertyId: "", widgetId: "" }, // Add widgetId
  });

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Addons Management",
    subtitle:
      "Enable or disable various third-party services and integrations for your website. Configure API keys for enabled services.",
    configuration: "Configuration:",
    refresh: "Refresh",
    updating: "Updating...",
    updateAddons: "Update Addons",
    addonsUpdatedSuccess: "Addons updated successfully!",
    failedToLoadSettings: "Failed to load settings",
    failedToUpdateAddons: "Failed to update addons",
    // Addon labels and descriptions
    recaptchaLabel: "Google reCAPTCHA",
    recaptchaDescription: "Protect login and registration forms from bots",
    trustPilotLabel: "Trust Pilot",
    trustPilotDescription: "Display customer reviews and ratings",
    googleAnalyticsLabel: "Google Analytics",
    googleAnalyticsDescription: "Track website traffic and user behavior",
    microsoftClarityLabel: "Microsoft Clarity",
    microsoftClarityDescription: "Heatmaps and user session recordings",
    cloudflareLabel: "Cloudflare",
    cloudflareDescription: "CDN, security, and performance optimization",
    getButtonLabel: "GetButton.io",
    getButtonDescription: "Live chat and customer support widget",
    tawkToLabel: "Tawk.to",
    tawkToDescription: "Free live chat for customer support",
    // Field labels and placeholders
    siteKeyLabel: "Site Key",
    siteKeyPlaceholder: "Enter reCAPTCHA site key",
    secretKeyLabel: "Secret Key",
    secretKeyPlaceholder: "Enter reCAPTCHA secret key",
    businessIdLabel: "Business ID",
    businessIdPlaceholder: "Enter TrustPilot business ID",
    apiKeyLabel: "API Key",
    apiKeyPlaceholder: "Enter TrustPilot API key",
    measurementIdLabel: "Measurement ID",
    measurementIdPlaceholder: "Enter Google Analytics measurement ID",
    projectIdLabel: "Project ID",
    projectIdPlaceholder: "Enter Microsoft Clarity project ID",
    tokenLabel: "Token",
    tokenPlaceholder: "Enter Cloudflare token",
    widgetIdLabel: "Widget ID",
    widgetIdPlaceholder: "Enter GetButton widget ID",
    propertyIdLabel: "Property ID",
    propertyIdPlaceholder: "Enter Tawk.to property ID",
    tawkToWidgetIdPlaceholder: "Enter Tawk.to widget ID",
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

  const addonConfigs = [
    {
      key: "recaptcha",
      label: texts.recaptchaLabel,
      description: texts.recaptchaDescription,
      icon: Shield,
      color: "text-blue-500",
      fields: [
        {
          key: "siteKey",
          label: texts.siteKeyLabel,
          placeholder: texts.siteKeyPlaceholder,
        },
        {
          key: "secretKey",
          label: texts.secretKeyLabel,
          placeholder: texts.secretKeyPlaceholder,
        },
      ],
    },
    {
      key: "trustPilot",
      label: texts.trustPilotLabel,
      description: texts.trustPilotDescription,
      icon: Star,
      color: "text-green-500",
      fields: [
        {
          key: "businessId",
          label: texts.businessIdLabel,
          placeholder: texts.businessIdPlaceholder,
        },
        {
          key: "apiKey",
          label: texts.apiKeyLabel,
          placeholder: texts.apiKeyPlaceholder,
        },
      ],
    },
    {
      key: "googleAnalytics",
      label: texts.googleAnalyticsLabel,
      description: texts.googleAnalyticsDescription,
      icon: BarChart3,
      color: "text-orange-500",
      fields: [
        {
          key: "measurementId",
          label: texts.measurementIdLabel,
          placeholder: texts.measurementIdPlaceholder,
        },
      ],
    },
    {
      key: "microsoftClarity",
      label: texts.microsoftClarityLabel,
      description: texts.microsoftClarityDescription,
      icon: Eye,
      color: "text-purple-500",
      fields: [
        {
          key: "projectId",
          label: texts.projectIdLabel,
          placeholder: texts.projectIdPlaceholder,
        },
      ],
    },
    {
      key: "cloudflare",
      label: texts.cloudflareLabel,
      description: texts.cloudflareDescription,
      icon: Cloud,
      color: "text-yellow-500",
      fields: [
        {
          key: "token",
          label: texts.tokenLabel,
          placeholder: texts.tokenPlaceholder,
        },
      ],
    },
    {
      key: "getButton",
      label: texts.getButtonLabel,
      description: texts.getButtonDescription,
      icon: MessageCircle,
      color: "text-pink-500",
      fields: [
        {
          key: "widgetId",
          label: texts.widgetIdLabel,
          placeholder: texts.widgetIdPlaceholder,
        },
      ],
    },
    {
      key: "tawkTo",
      label: texts.tawkToLabel,
      description: texts.tawkToDescription,
      icon: MessageCircle,
      color: "text-indigo-500",
      fields: [
        {
          key: "propertyId",
          label: texts.propertyIdLabel,
          placeholder: texts.propertyIdPlaceholder,
        },
        {
          key: "widgetId",
          label: texts.widgetIdLabel,
          placeholder: texts.tawkToWidgetIdPlaceholder,
        },
      ],
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
        if (response.data.addons) {
          setAddons(response.data.addons);
        }
        if (response.data.apiKeys) {
          setApiKeys(response.data.apiKeys);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setError(texts.failedToLoadSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleAddonToggle = (addonKey, value) => {
    setAddons((prev) => ({
      ...prev,
      [addonKey]: value,
    }));
  };

  const handleApiKeyChange = (addonKey, fieldKey, value) => {
    setApiKeys((prev) => ({
      ...prev,
      [addonKey]: {
        ...prev[addonKey],
        [fieldKey]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const response = await apiCall("/api/admin/settings", "PUT", {
        addons: addons,
        apiKeys: apiKeys,
      });

      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } else {
        setError(response.error || texts.failedToUpdateAddons);
      }
    } catch (error) {
      console.error("Failed to update addons:", error);
      setError(texts.failedToUpdateAddons);
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
            {addonConfigs.map((addon) => {
              const IconComponent = addon.icon;
              const isEnabled = addons[addon.key];

              return (
                <div
                  key={addon.key}
                  className="border border-[#333] rounded-lg p-3 sm:p-4 hover:border-[#555] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <IconComponent
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${addon.color}`}
                      />
                      <div>
                        <h3 className="text-white font-semibold text-xs sm:text-sm">
                          {addon.label}
                        </h3>
                        <p className="text-gray-400 text-[10px] sm:text-xs mt-1">
                          {addon.description}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) =>
                          handleAddonToggle(addon.key, e.target.checked)
                        }
                        className="sr-only peer"
                        disabled={loading}
                      />
                      <div className="w-9 h-5 sm:w-11 sm:h-6 bg-[#333] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* API Key Fields - Only show when addon is enabled */}
                  {isEnabled && addon.fields && (
                    <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 border-t border-[#333] pt-2 sm:pt-3">
                      <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                        {texts.configuration}
                      </p>
                      {addon.fields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-[10px] sm:text-xs text-gray-300 mb-1">
                            {field.label}
                          </label>
                          <input
                            type="text"
                            value={apiKeys[addon.key]?.[field.key] || ""}
                            onChange={(e) =>
                              handleApiKeyChange(
                                addon.key,
                                field.key,
                                e.target.value
                              )
                            }
                            placeholder={field.placeholder}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-[#0c171c] border border-[#333] rounded-md text-white text-[10px] sm:text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                            disabled={loading}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="text-xs sm:text-sm text-red-400">{error}</div>
          )}
          {saved && (
            <div className="text-xs sm:text-sm text-green-400 text-center">
              {texts.addonsUpdatedSuccess}
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
              {loading ? texts.updating : texts.updateAddons}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageAddons;
