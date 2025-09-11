"use client";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const GuideManagement = () => {
  const { hasAdminAccess } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

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
        setContent(data.settings.legalContent?.userGuide?.content || "");
        setTitle(data.settings.legalContent?.userGuide?.title || "User Guide");
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveGuide = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/settings/legal-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "userGuide", title, content }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save guide");
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "User guide updated successfully!",
      });
      fetchSettings();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: e.message || "Failed to save user guide",
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
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen border-1 border-gray-700 rounded-lg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            User Guide Management
          </h1>
          <p className="text-gray-400">
            Create and manage your user guide content with rich text editing
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Guide Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter guide title..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Guide Content
            </label>
            <RichTextEditor
              value={content}
              title="Guide Content"
              onDataChange={setContent}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setContent(settings.legalContent?.userGuide?.content || "");
                setTitle(
                  settings.legalContent?.userGuide?.title || "User Guide"
                );
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={saveGuide}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Guide"}
            </button>
          </div>
        </div>

        {settings?.legalContent?.userGuide?.lastUpdated && (
          <div className="mt-4 text-sm text-gray-400">
            Last updated:{" "}
            {new Date(
              settings.legalContent.userGuide.lastUpdated
            ).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideManagement;
