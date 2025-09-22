"use client";
import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";
import { FaFacebook, FaTwitter } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const LoginOptionManagement = () => {
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loginOptions, setLoginOptions] = useState({
    google: false,
    facebook: false,
    twitter: false,
  });

  const loginOptionConfigs = [
    {
      key: "google",
      label: "Google Login",
      description: "Allow users to sign in with Google accounts",
      icon: FcGoogle,
      color: "text-blue-500",
    },
    {
      key: "facebook",
      label: "Facebook Login",
      description: "Allow users to sign in with Facebook accounts",
      icon: FaFacebook,
      color: "text-blue-600",
    },
    {
      key: "twitter",
      label: "Twitter Login",
      description: "Allow users to sign in with Twitter accounts",
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
      setError("Failed to load settings");
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
        setError(response.error || "Failed to update login options");
      }
    } catch (error) {
      console.error("Failed to update login options:", error);
      setError("Failed to update login options");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-secondary">
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <h2 className="text-3xl text-center font-bold mb-4">
          Login Options Management
        </h2>
        <p className="text-gray-300 text-sm mb-6 text-center">
          Enable or disable social login options for your website.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loginOptionConfigs.map((option) => {
              const IconComponent = option.icon;
              const isEnabled = loginOptions[option.key];

              return (
                <div
                  key={option.key}
                  className="border border-[#333] rounded-lg p-4 hover:border-[#555] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${option.color}`} />
                      <div>
                        <h3 className="text-white font-semibold text-sm">
                          {option.label}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
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
                      <div className="w-11 h-6 bg-[#333] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}
          {saved && (
            <div className="text-sm text-green-400 text-center">
              Login options updated successfully!
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
              {loading ? "Updating..." : "Update Login Options"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginOptionManagement;
