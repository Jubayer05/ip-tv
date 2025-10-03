"use client";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const TermsConditionsManagement = () => {
  const { hasAdminAccess } = useAuth();
  const { language, translate, isLanguageLoaded } = useLanguage();
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Terms & Conditions Management",
    subtitle:
      "Create and manage your terms and conditions with rich text editing",
    loading: "Loading...",
    termsTitle: "Terms Title",
    enterTermsTitle: "Enter terms title...",
    termsContent: "Terms Content",
    reset: "Reset",
    saving: "Saving...",
    saveTerms: "Save Terms",
    lastUpdated: "Last updated:",
    success: "Success",
    termsUpdatedSuccess: "Terms and conditions updated successfully!",
    error: "Error",
    failedToFetchSettings: "Failed to fetch settings",
    failedToSaveTerms: "Failed to save terms and conditions",
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
    if (!hasAdminAccess()) {
      router.push("/dashboard");
      return;
    }
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setContent(
          data.settings.legalContent?.termsAndConditions?.content || ""
        );
        setTitle(
          data.settings.legalContent?.termsAndConditions?.title ||
            texts.termsTitle
        );
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: texts.failedToFetchSettings,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTerms = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/settings/legal-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "termsAndConditions", title, content }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || texts.failedToSaveTerms);
      Swal.fire({
        icon: "success",
        title: texts.success,
        text: texts.termsUpdatedSuccess,
      });
      fetchSettings();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: e.message || texts.failedToSaveTerms,
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (hasAdminAccess()) fetchSettings();
  }, []);

  if (!hasAdminAccess()) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">{texts.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen border-1 border-gray-700 rounded-lg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {texts.heading}
          </h1>
          <p className="text-gray-400">{texts.subtitle}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              {texts.termsTitle}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder={texts.enterTermsTitle}
            />
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              {texts.termsContent}
            </label>
            <RichTextEditor
              value={content}
              title={texts.termsContent}
              onDataChange={setContent}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setContent(
                  settings.legalContent?.termsAndConditions?.content || ""
                );
                setTitle(
                  settings.legalContent?.termsAndConditions?.title ||
                    texts.termsTitle
                );
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {texts.reset}
            </button>
            <button
              onClick={saveTerms}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? texts.saving : texts.saveTerms}
            </button>
          </div>
        </div>

        {settings?.legalContent?.termsAndConditions?.lastUpdated && (
          <div className="mt-4 text-sm text-gray-400">
            {texts.lastUpdated}{" "}
            {new Date(
              settings.legalContent.termsAndConditions.lastUpdated
            ).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsConditionsManagement;
