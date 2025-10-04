"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const MetaManagement = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState("home");

  const pages = [
    { id: "home", label: "Home" },
    { id: "about", label: "About Us" },
    { id: "affiliate", label: "Affiliate" },
    { id: "blogs", label: "Blogs" },
    { id: "explore", label: "Explore" },
    { id: "knowledge", label: "Knowledge Base" },
    { id: "packages", label: "Packages" },
    { id: "privacy", label: "Privacy Policy" },
    { id: "terms", label: "Terms of Use" },
    { id: "contact", label: "Contact" },
    { id: "faq", label: "FAQ" },
  ];

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Meta Management",
    saving: "Saving...",
    saveChanges: "Save Changes",
    loading: "Loading...",
    noMetaSettingsFound: "No meta settings found",
    metaSettingsFor: "Meta Settings for",
    pageTitle: "Page Title",
    metaDescription: "Meta Description",
    keywords: "Keywords",
    openGraphSettings: "Open Graph Settings",
    openGraphTitle: "Open Graph Title",
    openGraphDescription: "Open Graph Description",
    enterPageTitle: "Enter page title",
    enterMetaDescription: "Enter meta description",
    enterKeywords: "Enter keywords (comma separated)",
    enterOpenGraphTitle: "Enter Open Graph title",
    enterOpenGraphDescription: "Enter Open Graph description",
    success: "Success!",
    metaSettingsSavedSuccess: "Meta settings saved successfully!",
    ok: "OK",
    error: "Error!",
    failedToSaveMetaSettings: "Failed to save meta settings",
    failedToSaveMetaSettingsTryAgain:
      "Failed to save meta settings. Please try again.",
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
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (!settings) return;

    setSettings((prev) => ({
      ...prev,
      metaManagement: {
        ...prev.metaManagement,
        [activePage]: {
          ...prev.metaManagement[activePage],
          [field]: value,
        },
      },
    }));
  };

  const handleOpenGraphChange = (field, value) => {
    if (!settings) return;

    setSettings((prev) => ({
      ...prev,
      metaManagement: {
        ...prev.metaManagement,
        [activePage]: {
          ...prev.metaManagement[activePage],
          openGraph: {
            ...prev.metaManagement[activePage].openGraph,
            [field]: value,
          },
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metaManagement: settings.metaManagement,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Success notification with SweetAlert2
        Swal.fire({
          title: texts.success,
          text: texts.metaSettingsSavedSuccess,
          icon: "success",
          confirmButtonText: texts.ok,
          confirmButtonColor: "#10b981", // Green color
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        // Error notification with SweetAlert2
        Swal.fire({
          title: texts.error,
          text: texts.failedToSaveMetaSettings,
          icon: "error",
          confirmButtonText: texts.ok,
          confirmButtonColor: "#ef4444", // Red color
        });
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Error notification with SweetAlert2
      Swal.fire({
        title: texts.error,
        text: texts.failedToSaveMetaSettingsTryAgain,
        icon: "error",
        confirmButtonText: texts.ok,
        confirmButtonColor: "#ef4444", // Red color
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">{texts.loading}</div>;
  }

  if (!settings?.metaManagement) {
    return <div className="text-center py-8">{texts.noMetaSettingsFound}</div>;
  }

  const currentPageMeta = settings.metaManagement[activePage] || {};

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          {texts.heading}
        </h3>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? texts.saving : texts.saveChanges}
        </Button>
      </div>

      {/* Page Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={`p-2 sm:p-3 text-xs sm:text-sm rounded-md border-2 cursor-pointer transition-colors ${
              activePage === page.id
                ? "border-blue-500 bg-blue-500/10 text-blue-400"
                : "border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300"
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {/* Meta Fields */}
      <div className="space-y-4 sm:space-y-6 bg-gray-900/50 p-4 sm:p-6 rounded-lg">
        <h4 className="text-xl sm:text-2xl font-medium text-white font-secondary">
          {texts.metaSettingsFor}{" "}
          <span className="text-blue-500">
            {pages.find((p) => p.id === activePage)?.label}
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Title */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              {texts.pageTitle}
            </label>
            <Input
              value={currentPageMeta.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder={texts.enterPageTitle}
              className="w-full text-xs sm:text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              {texts.metaDescription}
            </label>
            <Input
              value={currentPageMeta.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={texts.enterMetaDescription}
              className="w-full text-xs sm:text-sm"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              {texts.keywords}
            </label>
            <Input
              value={currentPageMeta.keywords || ""}
              onChange={(e) => handleInputChange("keywords", e.target.value)}
              placeholder={texts.enterKeywords}
              className="w-full text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Open Graph Section */}
        <div className="border-t border-gray-700 pt-4 sm:pt-6">
          <h5 className="text-sm sm:text-md font-medium text-white mb-3 sm:mb-4">
            {texts.openGraphSettings}
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                {texts.openGraphTitle}
              </label>
              <Input
                value={currentPageMeta.openGraph?.title || ""}
                onChange={(e) => handleOpenGraphChange("title", e.target.value)}
                placeholder={texts.enterOpenGraphTitle}
                className="w-full text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                {texts.openGraphDescription}
              </label>
              <Input
                value={currentPageMeta.openGraph?.description || ""}
                onChange={(e) =>
                  handleOpenGraphChange("description", e.target.value)
                }
                placeholder={texts.enterOpenGraphDescription}
                className="w-full text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaManagement;
