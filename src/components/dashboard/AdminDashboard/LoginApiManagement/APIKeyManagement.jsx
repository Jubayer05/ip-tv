"use client";
import { useApi } from "@/hooks/useApi";
import { Eye, EyeOff, Key, Mail, Tv } from "lucide-react";
import { useEffect, useState } from "react";

const APIKeyManagement = () => {
  const { apiCall } = useApi();
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
  });

  const apiKeyConfigs = [
    {
      key: "smtp",
      label: "SMTP Configuration",
      description: "Email server settings for sending emails",
      icon: Mail,
      color: "text-blue-500",
      fields: [
        {
          key: "host",
          label: "SMTP Host",
          placeholder: "smtp.gmail.com",
          type: "text",
        },
        { key: "port", label: "SMTP Port", placeholder: "587", type: "number" },
        {
          key: "user",
          label: "SMTP User",
          placeholder: "your-email@gmail.com",
          type: "text",
        },
        {
          key: "pass",
          label: "SMTP Password",
          placeholder: "your-app-password",
          type: "password",
        },
        { key: "secure", label: "Use SSL/TLS", type: "checkbox" },
      ],
    },
    {
      key: "iptv",
      label: "IPTV Service",
      description: "IPTV service API configuration",
      icon: Tv,
      color: "text-green-500",
      fields: [
        {
          key: "apiKey",
          label: "API Key",
          placeholder: "your-iptv-api-key",
          type: "text",
        },
        {
          key: "baseUrl",
          label: "Base URL",
          placeholder: "https://api.iptv.com",
          type: "text",
        },
      ],
    },
    {
      key: "jwt",
      label: "JWT Configuration",
      description: "JSON Web Token settings",
      icon: Key,
      color: "text-red-500",
      fields: [
        {
          key: "secret",
          label: "JWT Secret",
          placeholder: "your-jwt-secret",
          type: "password",
        },
        {
          key: "expiresIn",
          label: "Expires In",
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
          setOtherApiKeys(response.data.otherApiKeys);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setError("Failed to load settings");
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
        setError(response.error || "Failed to update API keys");
      }
    } catch (error) {
      console.error("Failed to update API keys:", error);
      setError("Failed to update API keys");
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
        <label className="block text-xs text-gray-300 mb-1">
          {field.label}
        </label>
        <div className="relative">
          <input
            type={isPassword && !showSecret ? "password" : "text"}
            value={fieldValue}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-[#0c171c] border border-[#333] rounded-md text-white text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors pr-10"
            disabled={loading}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => toggleSecretVisibility(section, field.key)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 font-secondary">
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <h2 className="text-3xl text-center font-bold mb-4">
          API Key Management
        </h2>
        <p className="text-gray-300 text-sm mb-6 text-center">
          Manage API keys and configuration for various services. All values are
          stored securely in the database.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {apiKeyConfigs.map((config) => {
              const IconComponent = config.icon;
              const isSmtp = config.key === "smtp";
              const currentData = isSmtp ? smtp : otherApiKeys[config.key];

              return (
                <div
                  key={config.key}
                  className="border border-[#333] rounded-lg p-4 hover:border-[#555] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <IconComponent className={`w-5 h-5 ${config.color}`} />
                    <div>
                      <h3 className="text-white font-semibold text-sm">
                        {config.label}
                      </h3>
                      <p className="text-gray-400 text-xs mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.fields.map((field) => {
                      if (field.type === "checkbox") {
                        return (
                          <div
                            key={field.key}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={currentData[field.key] || false}
                              onChange={(e) =>
                                handleSmtpChange(field.key, e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                              disabled={loading}
                            />
                            <label className="text-xs text-gray-300">
                              {field.label}
                            </label>
                          </div>
                        );
                      }

                      return renderField(
                        config.key,
                        field,
                        currentData[field.key],
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

          {error && <div className="text-sm text-red-400">{error}</div>}
          {saved && (
            <div className="text-sm text-green-400 text-center">
              API keys updated successfully!
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading}
              className="px-4 py-2 border border-[#333] text-white rounded-md hover:bg-[#212121] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refresh
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update API Keys"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default APIKeyManagement;
