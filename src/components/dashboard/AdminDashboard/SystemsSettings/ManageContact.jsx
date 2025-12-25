"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import { Clock, Mail, MessageSquare, Phone, Save } from "lucide-react";
import { useEffect, useState } from "react";

const ManageContact = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phoneNumber: "",
    emailAddress: "",
    businessHours: "Mon–Fri (09:00 AM – 5:00 PM)",
    message:
      "If you have any questions about your order, please describe it and include your Order ID in the message (example: zxxxx.xxxx.xxx).",
    supportTicketButtonText: "Submit Request",
    supportTicketSuccessMessage:
      "Your contact request has been submitted successfully. We'll get back to you soon!",
  });

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Contact Information Management",
    subtitle:
      "Manage your contact information that will be displayed in the footer and contact form.",
    contactDetails: "Contact Details",
    businessHours: "Business Hours",
    supportMessage: "Support Message",
    supportTicketSettings: "Support Ticket Settings",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    businessHoursLabel: "Business Hours",
    helpMessage: "Help Message",
    buttonText: "Button Text",
    successMessage: "Success Message",
    phoneNumberPlaceholder: "Enter phone number",
    emailAddressPlaceholder: "Enter email address",
    businessHoursPlaceholder: "e.g., Mon–Fri (09:00 AM – 5:00 PM)",
    businessHoursNote: "This will be displayed in the footer",
    helpMessagePlaceholder: "Enter help message for users",
    helpMessageNote: "This message will be shown above the contact form",
    buttonTextPlaceholder: "e.g., Submit Request",
    buttonTextNote: "Text for the submit button on contact form",
    successMessagePlaceholder: "Enter success message",
    successMessageNote: "Message shown after successful form submission",
    refresh: "Refresh",
    saving: "Saving...",
    saveChanges: "Save Changes",
    settingsSavedSuccess: "Settings saved successfully!",
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
        setContactInfo({
          phoneNumber: response.data.contactInfo?.phoneNumber || "",
          emailAddress: response.data.contactInfo?.emailAddress || "",
          businessHours:
            response.data.contactInfo?.businessHours ||
            "Mon–Fri (09:00 AM – 5:00 PM)",
          message:
            response.data.contactInfo?.message ||
            "If you have any questions about your order, please describe it and include your Order ID in the message (example: zxxxx.xxxx.xxx).",
          supportTicketButtonText:
            response.data.contactInfo?.supportTicketButtonText ||
            "Submit Request",
          supportTicketSuccessMessage:
            response.data.contactInfo?.supportTicketSuccessMessage ||
            "Your contact request has been submitted successfully. We'll get back to you soon!",
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setError(texts.failedToLoadSettings);
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
      setError(texts.failedToUpdateSettings);
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
        <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6">
          {texts.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Contact Information Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
              {texts.contactDetails}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span>{texts.phoneNumber}</span>
                </label>
                <input
                  type="tel"
                  value={contactInfo.phoneNumber}
                  onChange={(e) =>
                    handleContactChange("phoneNumber", e.target.value)
                  }
                  placeholder={texts.phoneNumberPlaceholder}
                  className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span>{texts.emailAddress}</span>
                </label>
                <input
                  type="email"
                  value={contactInfo.emailAddress}
                  onChange={(e) =>
                    handleContactChange("emailAddress", e.target.value)
                  }
                  placeholder={texts.emailAddressPlaceholder}
                  className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Business Hours Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
              {texts.businessHours}
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <span>{texts.businessHoursLabel}</span>
              </label>
              <input
                type="text"
                value={contactInfo.businessHours}
                onChange={(e) =>
                  handleContactChange("businessHours", e.target.value)
                }
                placeholder={texts.businessHoursPlaceholder}
                className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-xs sm:text-sm"
              />
              <p className="text-[10px] sm:text-xs text-gray-500">
                {texts.businessHoursNote}
              </p>
            </div>
          </div>

          {/* Support Message Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
              {texts.supportMessage}
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <span>{texts.helpMessage}</span>
              </label>
              <textarea
                value={contactInfo.message}
                onChange={(e) => handleContactChange("message", e.target.value)}
                placeholder={texts.helpMessagePlaceholder}
                rows={3}
                className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 resize-none text-xs sm:text-sm"
              />
              <p className="text-[10px] sm:text-xs text-gray-500">
                {texts.helpMessageNote}
              </p>
            </div>
          </div>

          {/* Support Ticket Settings Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
              {texts.supportTicketSettings}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-gray-300">
                  {texts.buttonText}
                </label>
                <input
                  type="text"
                  value={contactInfo.supportTicketButtonText}
                  onChange={(e) =>
                    handleContactChange(
                      "supportTicketButtonText",
                      e.target.value
                    )
                  }
                  placeholder={texts.buttonTextPlaceholder}
                  className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-xs sm:text-sm"
                />
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {texts.buttonTextNote}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-gray-300">
                  {texts.successMessage}
                </label>
                <textarea
                  value={contactInfo.supportTicketSuccessMessage}
                  onChange={(e) =>
                    handleContactChange(
                      "supportTicketSuccessMessage",
                      e.target.value
                    )
                  }
                  placeholder={texts.successMessagePlaceholder}
                  rows={2}
                  className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 resize-none text-xs sm:text-sm"
                />
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {texts.successMessageNote}
                </p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-red-400">{error}</p>
            </div>
          )}
          {saved && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-green-400">
                {texts.settingsSavedSuccess}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-[#333] text-white rounded-md hover:bg-[#212121] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {texts.refresh}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
              {loading ? texts.saving : texts.saveChanges}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageContact;
