"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const MetaManagement = () => {
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
          title: "Success!",
          text: "Meta settings saved successfully!",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#10b981", // Green color
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        // Error notification with SweetAlert2
        Swal.fire({
          title: "Error!",
          text: "Failed to save meta settings",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#ef4444", // Red color
        });
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Error notification with SweetAlert2
      Swal.fire({
        title: "Error!",
        text: "Failed to save meta settings. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444", // Red color
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!settings?.metaManagement) {
    return <div className="text-center py-8">No meta settings found</div>;
  }

  const currentPageMeta = settings.metaManagement[activePage] || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Meta Management</h3>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Page Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={`p-3 text-sm rounded-md border-2 cursor-pointer transition-colors ${
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
      <div className="space-y-6 bg-gray-900/50 p-6 rounded-lg">
        <h4 className="text-2xl font-medium text-white font-secondary">
          Meta Settings for{" "}
          <span className="text-blue-500">
            {pages.find((p) => p.id === activePage)?.label}
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Page Title
            </label>
            <Input
              value={currentPageMeta.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter page title"
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meta Description
            </label>
            <Input
              value={currentPageMeta.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter meta description"
              className="w-full"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Keywords
            </label>
            <Input
              value={currentPageMeta.keywords || ""}
              onChange={(e) => handleInputChange("keywords", e.target.value)}
              placeholder="Enter keywords (comma separated)"
              className="w-full"
            />
          </div>
        </div>

        {/* Open Graph Section */}
        <div className="border-t border-gray-700 pt-6">
          <h5 className="text-md font-medium text-white mb-4">
            Open Graph Settings
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Open Graph Title
              </label>
              <Input
                value={currentPageMeta.openGraph?.title || ""}
                onChange={(e) => handleOpenGraphChange("title", e.target.value)}
                placeholder="Enter Open Graph title"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Open Graph Description
              </label>
              <Input
                value={currentPageMeta.openGraph?.description || ""}
                onChange={(e) =>
                  handleOpenGraphChange("description", e.target.value)
                }
                placeholder="Enter Open Graph description"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaManagement;
