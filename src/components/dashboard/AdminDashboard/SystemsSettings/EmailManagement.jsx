// src/components/dashboard/AdminDashboard/SystemsSettings/EmailManagement.jsx
"use client";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useLanguage } from "@/contexts/LanguageContext";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const EmailManagement = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState("");

  // Original text constants
  const ORIGINAL_TEXTS = {
    title: "Email Content Management",
    subtitle: "Manage IPTV guides and instructions for emails and dashboard",
    contentLabel: "IPTV Setup Guide Content",
    contentPlaceholder:
      "Enter comprehensive IPTV setup instructions and guides...",
    saveButton: "Save Changes",
    savingButton: "Saving...",
    successMessage: "Email content updated successfully!",
    errorMessage: "Failed to update email content",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        const items = [
          ORIGINAL_TEXTS.title,
          ORIGINAL_TEXTS.subtitle,
          ORIGINAL_TEXTS.contentLabel,
          ORIGINAL_TEXTS.contentPlaceholder,
          ORIGINAL_TEXTS.saveButton,
          ORIGINAL_TEXTS.savingButton,
          ORIGINAL_TEXTS.successMessage,
          ORIGINAL_TEXTS.errorMessage,
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        setTexts({
          title: translated[0],
          subtitle: translated[1],
          contentLabel: translated[2],
          contentPlaceholder: translated[3],
          saveButton: translated[4],
          savingButton: translated[5],
          successMessage: translated[6],
          errorMessage: translated[7],
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  useEffect(() => {
    loadEmailContent();
  }, []);

  const loadEmailContent = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings/email-content", {
        cache: "no-store",
      });
      const data = await response.json();

      if (data.success) {
        setContent(data.data.content || "");
      }
    } catch (error) {
      console.error("Error loading email content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/admin/settings/email-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (data.success) {
        await loadEmailContent();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: texts.successMessage,
          confirmButtonColor: "#00b877",
        });
      } else {
        throw new Error(data.error || texts.errorMessage);
      }
    } catch (error) {
      console.error("Error saving email content:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || texts.errorMessage,
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading email content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{texts.title}</h2>
        <p className="text-gray-400">{texts.subtitle}</p>
      </div>

      <div className="bg-black border border-[#212121] rounded-lg p-6">
        <div className="space-y-6">
          {/* Single Content Section */}
          <div>
            <label className="block text-white font-medium mb-3">
              {texts.contentLabel}
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              onDataChange={setContent}
              placeholder={texts.contentPlaceholder}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/80 text-black px-6 py-3 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  {texts.savingButton}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {texts.saveButton}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailManagement;
