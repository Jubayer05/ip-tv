"use client";
import { useApi } from "@/hooks/useApi";
import { Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";

const ManageContact = () => {
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phoneNumber: "",
    emailAddress: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/api/admin/settings", "GET");
      if (response.success) {
        setContactInfo(response.data.contactInfo || contactInfo);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleContactChange = (field, value) => {
    setContactInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const response = await apiCall("/api/admin/settings", "PUT", {
        contactInfo: contactInfo,
      });
      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      setError("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-secondary">
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <h2 className="text-3xl text-center font-bold mb-4">
          Contact Information Management
        </h2>
        <p className="text-gray-300 text-sm mb-6">
          Manage your contact information that will be displayed in the footer.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-300">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={contactInfo.phoneNumber}
                  onChange={(e) =>
                    handleContactChange("phoneNumber", e.target.value)
                  }
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-300">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={contactInfo.emailAddress}
                  onChange={(e) =>
                    handleContactChange("emailAddress", e.target.value)
                  }
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}
          {saved && (
            <div className="text-sm text-green-400">Settings saved</div>
          )}

          <div className="flex gap-3">
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
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageContact;
