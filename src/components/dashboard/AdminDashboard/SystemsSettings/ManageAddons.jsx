"use client";
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
    tawkTo: { propertyId: "" },
  });

  const addonConfigs = [
    {
      key: "recaptcha",
      label: "Google reCAPTCHA",
      description: "Protect login and registration forms from bots",
      icon: Shield,
      color: "text-blue-500",
      fields: [
        {
          key: "siteKey",
          label: "Site Key",
          placeholder: "Enter reCAPTCHA site key",
        },
        {
          key: "secretKey",
          label: "Secret Key",
          placeholder: "Enter reCAPTCHA secret key",
        },
      ],
    },
    {
      key: "trustPilot",
      label: "Trust Pilot",
      description: "Display customer reviews and ratings",
      icon: Star,
      color: "text-green-500",
      fields: [
        {
          key: "businessId",
          label: "Business ID",
          placeholder: "Enter TrustPilot business ID",
        },
        {
          key: "apiKey",
          label: "API Key",
          placeholder: "Enter TrustPilot API key",
        },
      ],
    },
    {
      key: "googleAnalytics",
      label: "Google Analytics",
      description: "Track website traffic and user behavior",
      icon: BarChart3,
      color: "text-orange-500",
      fields: [
        {
          key: "measurementId",
          label: "Measurement ID",
          placeholder: "Enter Google Analytics measurement ID",
        },
      ],
    },
    {
      key: "microsoftClarity",
      label: "Microsoft Clarity",
      description: "Heatmaps and user session recordings",
      icon: Eye,
      color: "text-purple-500",
      fields: [
        {
          key: "projectId",
          label: "Project ID",
          placeholder: "Enter Microsoft Clarity project ID",
        },
      ],
    },
    {
      key: "cloudflare",
      label: "Cloudflare",
      description: "CDN, security, and performance optimization",
      icon: Cloud,
      color: "text-yellow-500",
      fields: [
        { key: "token", label: "Token", placeholder: "Enter Cloudflare token" },
      ],
    },
    {
      key: "getButton",
      label: "GetButton.io",
      description: "Live chat and customer support widget",
      icon: MessageCircle,
      color: "text-pink-500",
      fields: [
        {
          key: "widgetId",
          label: "Widget ID",
          placeholder: "Enter GetButton widget ID",
        },
      ],
    },
    {
      key: "tawkTo",
      label: "Tawk.to",
      description: "Free live chat for customer support",
      icon: MessageCircle,
      color: "text-indigo-500",
      fields: [
        {
          key: "propertyId",
          label: "Property ID",
          placeholder: "Enter Tawk.to property ID",
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
      setError("Failed to load settings");
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
        setError(response.error || "Failed to update addons");
      }
    } catch (error) {
      console.error("Failed to update addons:", error);
      setError("Failed to update addons");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-secondary">
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <h2 className="text-3xl text-center font-bold mb-4">
          Addons Management
        </h2>
        <p className="text-gray-300 text-sm mb-6 text-center">
          Enable or disable various third-party services and integrations for
          your website. Configure API keys for enabled services.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addonConfigs.map((addon) => {
              const IconComponent = addon.icon;
              const isEnabled = addons[addon.key];

              return (
                <div
                  key={addon.key}
                  className="border border-[#333] rounded-lg p-4 hover:border-[#555] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${addon.color}`} />
                      <div>
                        <h3 className="text-white font-semibold text-sm">
                          {addon.label}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
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
                      <div className="w-11 h-6 bg-[#333] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* API Key Fields - Only show when addon is enabled */}
                  {isEnabled && addon.fields && (
                    <div className="mt-4 space-y-3 border-t border-[#333] pt-3">
                      <p className="text-xs text-gray-400 font-medium">
                        Configuration:
                      </p>
                      {addon.fields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs text-gray-300 mb-1">
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
                            className="w-full px-3 py-2 bg-[#0c171c] border border-[#333] rounded-md text-white text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
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

          {error && <div className="text-sm text-red-400">{error}</div>}
          {saved && (
            <div className="text-sm text-green-400 text-center">
              Addons updated successfully!
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
              {loading ? "Updating..." : "Update Addons"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageAddons;
