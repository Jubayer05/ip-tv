"use client";
import { useApi } from "@/hooks/useApi";
import { Clock, Mail, MessageSquare, Phone, Save } from "lucide-react";
import { useEffect, useState } from "react";

const ManageContact = () => {
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phoneNumber: "",
    emailAddress: "",
    businessHours: "Mon–Fri (09:00 AM – 5:00 PM)",
    message: "If you have any questions about your order, please describe it and include your Order ID in the message (example: zxxxx.xxxx.xxx).",
    supportTicketButtonText: "Submit Request",
    supportTicketSuccessMessage: "Your contact request has been submitted successfully. We'll get back to you soon!",
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
        setContactInfo({
          phoneNumber: response.data.contactInfo?.phoneNumber || "",
          emailAddress: response.data.contactInfo?.emailAddress || "",
          businessHours: response.data.contactInfo?.businessHours || "Mon–Fri (09:00 AM – 5:00 PM)",
          message: response.data.contactInfo?.message || "If you have any questions about your order, please describe it and include your Order ID in the message (example: zxxxx.xxxx.xxx).",
          supportTicketButtonText: response.data.contactInfo?.supportTicketButtonText || "Submit Request",
          supportTicketSuccessMessage: response.data.contactInfo?.supportTicketSuccessMessage || "Your contact request has been submitted successfully. We'll get back to you soon!",
        });
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
          Manage your contact information that will be displayed in the footer and contact form.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
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

          {/* Business Hours Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Business Hours
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Business Hours</span>
              </label>
              <input
                type="text"
                value={contactInfo.businessHours}
                onChange={(e) =>
                  handleContactChange("businessHours", e.target.value)
                }
                placeholder="e.g., Mon–Fri (09:00 AM – 5:00 PM)"
                className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-500">
                This will be displayed in the footer
              </p>
            </div>
          </div>

          {/* Support Message Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Support Message
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span>Help Message</span>
              </label>
              <textarea
                value={contactInfo.message}
                onChange={(e) =>
                  handleContactChange("message", e.target.value)
                }
                placeholder="Enter help message for users"
                rows={3}
                className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 resize-none"
              />
              <p className="text-xs text-gray-500">
                This message will be shown above the contact form
              </p>
            </div>
          </div>

          {/* Support Ticket Settings Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Support Ticket Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">
                  Button Text
                </label>
                <input
                  type="text"
                  value={contactInfo.supportTicketButtonText}
                  onChange={(e) =>
                    handleContactChange("supportTicketButtonText", e.target.value)
                  }
                  placeholder="e.g., Submit Request"
                  className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-500">
                  Text for the submit button on contact form
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">
                  Success Message
                </label>
                <textarea
                  value={contactInfo.supportTicketSuccessMessage}
                  onChange={(e) =>
                    handleContactChange("supportTicketSuccessMessage", e.target.value)
                  }
                  placeholder="Enter success message"
                  rows={2}
                  className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 resize-none"
                />
                <p className="text-xs text-gray-500">
                  Message shown after successful form submission
                </p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {saved && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-sm text-green-400">Settings saved successfully!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-[#333] text-white rounded-md hover:bg-[#212121] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refresh
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageContact;
