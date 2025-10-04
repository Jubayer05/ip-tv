"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import { Eye, EyeOff, Globe, Key, Languages, Mail, Tv } from "lucide-react";
import { useEffect, useState } from "react";

const APIKeyManagement = () => {
  const { apiCall } = useApi();
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});

  const [smtp, setSmtp] = useState({
    host: "",
    port: 587,
    user: "",
    pass: "",
    secure: false,
  });

  const [otherApiKeys, setOtherApiKeys] = useState({
    iptv: {
      apiKey: "",
      baseUrl: "",
    },
    jwt: {
      secret: "",
      expiresIn: "7d",
    },
    deepl: {
      apiKey: "",
      baseUrl: "https://api-free.deepl.com",
    },
    googleTranslate: {
      apiKey: "",
      baseUrl: "https://translation.googleapis.com",
    },
  });

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "API Key Management",
    subtitle:
      "Manage API keys and configuration for various services. All values are stored securely in the database.",
    smtpConfiguration: "SMTP Configuration",
    smtpDescription: "Email server settings for sending emails",
    smtpHost: "SMTP Host",
    smtpPort: "SMTP Port",
    smtpUser: "SMTP User",
    smtpPassword: "SMTP Password",
    useSSLTLS: "Use SSL/TLS",
    iptvService: "IPTV Service",
    iptvDescription: "IPTV service API configuration",
    apiKey: "API Key",
    baseUrl: "Base URL",
    deeplTranslation: "DeepL Translation",
    deeplDescription:
      "DeepL API for high-quality translations (Swedish, Norwegian, Danish, Finnish, French, German, Spanish, Italian, Russian, Turkish)",
    deeplApiKey: "DeepL API Key",
    deeplBaseUrl: "DeepL Base URL",
    googleTranslate: "Google Translate",
    googleTranslateDescription:
      "Google Translate API for additional languages (Arabic, Hindi, Chinese)",
    googleApiKey: "Google API Key",
    googleTranslateBaseUrl: "Google Translate Base URL",
    jwtConfiguration: "JWT Configuration",
    jwtDescription: "JSON Web Token settings",
    jwtSecret: "JWT Secret",
    expiresIn: "Expires In",
    failedToLoadSettings: "Failed to load settings",
    failedToUpdateApiKeys: "Failed to update API keys",
    apiKeysUpdatedSuccess: "API keys updated successfully!",
    refresh: "Refresh",
    updating: "Updating...",
    updateApiKeys: "Update API Keys",
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

  const apiKeyConfigs = [
    {
      key: "smtp",
      label: texts.smtpConfiguration,
      description: texts.smtpDescription,
      icon: Mail,
      color: "text-blue-500",
      fields: [
        {
          key: "host",
          label: texts.smtpHost,
          placeholder: "smtp.gmail.com",
          type: "text",
        },
        {
          key: "port",
          label: texts.smtpPort,
          placeholder: "587",
          type: "number",
        },
        {
          key: "user",
          label: texts.smtpUser,
          placeholder: "your-email@gmail.com",
          type: "text",
        },
        {
          key: "pass",
          label: texts.smtpPassword,
          placeholder: "your-app-password",
          type: "password",
        },
        { key: "secure", label: texts.useSSLTLS, type: "checkbox" },
      ],
    },
    {
      key: "iptv",
      label: texts.iptvService,
      description: texts.iptvDescription,
      icon: Tv,
      color: "text-green-500",
      fields: [
        {
          key: "apiKey",
          label: texts.apiKey,
          placeholder: "your-iptv-api-key",
          type: "text",
        },
        {
          key: "baseUrl",
          label: texts.baseUrl,
          placeholder: "https://api.iptv.com",
          type: "text",
        },
      ],
    },
    {
      key: "deepl",
      label: texts.deeplTranslation,
      description: texts.deeplDescription,
      icon: Globe,
      color: "text-purple-500",
      fields: [
        {
          key: "apiKey",
          label: texts.deeplApiKey,
          placeholder: "your-deepl-api-key",
          type: "password",
        },
        {
          key: "baseUrl",
          label: texts.deeplBaseUrl,
          placeholder: "https://api-free.deepl.com",
          type: "text",
        },
      ],
    },
    {
      key: "googleTranslate",
      label: texts.googleTranslate,
      description: texts.googleTranslateDescription,
      icon: Languages,
      color: "text-orange-500",
      fields: [
        {
          key: "apiKey",
          label: texts.googleApiKey,
          placeholder: "your-google-translate-api-key",
          type: "password",
        },
        {
          key: "baseUrl",
          label: texts.googleTranslateBaseUrl,
          placeholder: "https://translation.googleapis.com",
          type: "text",
        },
      ],
    },
    {
      key: "jwt",
      label: texts.jwtConfiguration,
      description: texts.jwtDescription,
      icon: Key,
      color: "text-red-500",
      fields: [
        {
          key: "secret",
          label: texts.jwtSecret,
          placeholder: "your-jwt-secret",
          type: "password",
        },
        {
          key: "expiresIn",
          label: texts.expiresIn,
          placeholder: "7d",
          type: "text",
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
        if (response.data.smtp) {
          setSmtp(response.data.smtp);
        }
        if (response.data.otherApiKeys) {
          // Merge with default values to ensure all sections exist
          setOtherApiKeys((prev) => ({
            ...prev,
            ...response.data.otherApiKeys,
            deepl: {
              ...prev.deepl,
              ...response.data.otherApiKeys.deepl,
            },
            googleTranslate: {
              ...prev.googleTranslate,
              ...response.data.otherApiKeys.googleTranslate,
            },
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setError(texts.failedToLoadSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleSmtpChange = (field, value) => {
    setSmtp((prev) => ({
      ...prev,
      [field]:
        field === "port"
          ? parseInt(value) || 587
          : field === "secure"
          ? Boolean(value)
          : value,
    }));
  };

  const handleApiKeyChange = (section, field, value) => {
    setOtherApiKeys((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const toggleSecretVisibility = (section, field) => {
    const key = `${section}_${field}`;
    setShowSecrets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const response = await apiCall("/api/admin/settings", "PUT", {
        smtp: smtp,
        otherApiKeys: otherApiKeys,
      });

      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } else {
        setError(response.error || texts.failedToUpdateApiKeys);
      }
    } catch (error) {
      console.error("Failed to update API keys:", error);
      setError(texts.failedToUpdateApiKeys);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (
    section,
    field,
    value,
    onChange,
    placeholder,
    type = "text"
  ) => {
    const isPassword = type === "password";
    const showSecret = showSecrets[`${section}_${field.key}`];
    const fieldValue = value || "";

    return (
      <div key={field.key}>
        <label className="block text-[10px] sm:text-xs text-gray-300 mb-1">
          {field.label}
        </label>
        <div className="relative">
          <input
            type={isPassword && !showSecret ? "password" : "text"}
            value={fieldValue}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={placeholder}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-[#0c171c] border border-[#333] rounded-md text-white text-[10px] sm:text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors pr-8 sm:pr-10"
            disabled={loading}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => toggleSecretVisibility(section, field.key)}
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showSecret ? (
                <EyeOff size={12} className="sm:w-4 sm:h-4" />
              ) : (
                <Eye size={12} className="sm:w-4 sm:h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    );
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
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {apiKeyConfigs.map((config) => {
              const IconComponent = config.icon;
              const isSmtp = config.key === "smtp";
              const currentData = isSmtp ? smtp : otherApiKeys[config.key];

              return (
                <div
                  key={config.key}
                  className="border border-[#333] rounded-lg p-3 sm:p-4 hover:border-[#555] transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <IconComponent
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${config.color}`}
                    />
                    <div>
                      <h3 className="text-white font-semibold text-xs sm:text-sm">
                        {config.label}
                      </h3>
                      <p className="text-gray-400 text-[10px] sm:text-xs mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {config.fields.map((field) => {
                      if (field.type === "checkbox") {
                        return (
                          <div
                            key={field.key}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={currentData?.[field.key] || false}
                              onChange={(e) =>
                                handleSmtpChange(field.key, e.target.checked)
                              }
                              className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                              disabled={loading}
                            />
                            <label className="text-[10px] sm:text-xs text-gray-300">
                              {field.label}
                            </label>
                          </div>
                        );
                      }

                      return renderField(
                        config.key,
                        field,
                        currentData?.[field.key],
                        isSmtp
                          ? handleSmtpChange
                          : (field, value) =>
                              handleApiKeyChange(config.key, field, value),
                        field.placeholder,
                        field.type
                      );
                    })}
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
              {texts.apiKeysUpdatedSuccess}
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
              {loading ? texts.updating : texts.updateApiKeys}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default APIKeyManagement;
