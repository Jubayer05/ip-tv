"use client";
import { Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function ManageLogo() {
  const [logos, setLogos] = useState({
    mainLogo: "",
    cheapStreamLogo: "",
    favicon: "",
  });
  const [uploadingLogo, setUploadingLogo] = useState({
    mainLogo: false,
    cheapStreamLogo: false,
    favicon: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings/logos");
      const data = await response.json();

      if (data.success) {
        setLogos(data.data);
      }
    } catch (error) {
      console.error("Error fetching logos:", error);
      Swal.fire("Error", "Failed to fetch logos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e, logoType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/x-icon",
    ];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire(
        "Error",
        "Invalid file type. Only JPEG, PNG, WebP, and ICO are allowed.",
        "error"
      );
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      Swal.fire("Error", "File size too large. Maximum size is 5MB.", "error");
      return;
    }

    setUploadingLogo((prev) => ({ ...prev, [logoType]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("logoType", logoType);

      const response = await fetch("/api/admin/settings/logos/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setLogos((prev) => ({
          ...prev,
          [logoType]: data.url,
        }));
        Swal.fire("Success", "Logo uploaded successfully!", "success");
      } else {
        Swal.fire("Error", data.error || "Logo upload failed", "error");
      }
    } catch (error) {
      console.error("Logo upload error:", error);
      Swal.fire("Error", "Logo upload failed", "error");
    } finally {
      setUploadingLogo((prev) => ({ ...prev, [logoType]: false }));
    }
  };

  const handleRemoveLogo = async (logoType) => {
    if (!logos[logoType]) return;

    try {
      const response = await fetch(
        `/api/admin/settings/logos/upload?imageUrl=${encodeURIComponent(
          logos[logoType]
        )}&logoType=${logoType}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        // Reset to default logo
        const defaultLogos = {
          mainLogo: "/logos/logo.png",
          cheapStreamLogo: "/logos/cheap_stream_logo.png",
          favicon: "/favicon.ico",
        };

        setLogos((prev) => ({
          ...prev,
          [logoType]: defaultLogos[logoType],
        }));

        Swal.fire("Success", "Logo removed successfully!", "success");
      } else {
        Swal.fire("Error", data.error || "Logo removal failed", "error");
      }
    } catch (error) {
      console.error("Logo delete error:", error);
      Swal.fire("Error", "Logo removal failed", "error");
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/admin/settings/logos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logos),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire("Success", "Logos updated successfully!", "success");
      } else {
        Swal.fire("Error", data.error || "Failed to update logos", "error");
      }
    } catch (error) {
      console.error("Error saving logos:", error);
      Swal.fire("Error", "Failed to update logos", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-800">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Logo Management
        </h2>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Logo */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold text-white">Main Logo</h3>
          <p className="text-xs text-gray-400">
            Used in the navbar and header (Recommended: 100x100px)
          </p>

          {logos.mainLogo && (
            <div className="relative bg-white p-4 rounded-lg">
              <img
                src={logos.mainLogo}
                alt="Main Logo"
                className="w-24 h-24 object-contain mx-auto"
              />
              <button
                type="button"
                onClick={() => handleRemoveLogo("mainLogo")}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <label className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm">
            <Upload className="w-4 h-4" />
            {uploadingLogo.mainLogo ? "Uploading..." : "Upload Main Logo"}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleLogoUpload(e, "mainLogo")}
              className="hidden"
              disabled={uploadingLogo.mainLogo}
            />
          </label>
        </div>

        {/* Cheap Stream Logo */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Cheap Stream Logo
          </h3>
          <p className="text-xs text-gray-400">
            Alternative brand logo (Recommended: 200x80px)
          </p>

          {logos.cheapStreamLogo && (
            <div className="relative bg-white p-4 rounded-lg">
              <img
                src={logos.cheapStreamLogo}
                alt="Cheap Stream Logo"
                className="w-32 h-24 object-contain mx-auto"
              />
              <button
                type="button"
                onClick={() => handleRemoveLogo("cheapStreamLogo")}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <label className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm">
            <Upload className="w-4 h-4" />
            {uploadingLogo.cheapStreamLogo
              ? "Uploading..."
              : "Upload Brand Logo"}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleLogoUpload(e, "cheapStreamLogo")}
              className="hidden"
              disabled={uploadingLogo.cheapStreamLogo}
            />
          </label>
        </div>

        {/* Favicon */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold text-white">Favicon</h3>
          <p className="text-xs text-gray-400">
            Browser tab icon (Recommended: 32x32px, .ico or .png)
          </p>

          {logos.favicon && (
            <div className="relative bg-white p-4 rounded-lg">
              <img
                src={logos.favicon}
                alt="Favicon"
                className="w-16 h-16 object-contain mx-auto"
              />
              <button
                type="button"
                onClick={() => handleRemoveLogo("favicon")}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <label className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm">
            <Upload className="w-4 h-4" />
            {uploadingLogo.favicon ? "Uploading..." : "Upload Favicon"}
            <input
              type="file"
              accept="image/x-icon,image/png"
              onChange={(e) => handleLogoUpload(e, "favicon")}
              className="hidden"
              disabled={uploadingLogo.favicon}
            />
          </label>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">
          Important Notes:
        </h4>
        <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
          <li>Logos are stored on the VPS</li>
          <li>Supported formats: JPEG, PNG, WebP, ICO</li>
          <li>Maximum file size: 5MB</li>
          <li>Changes will reflect across the entire website</li>
          <li>Use transparent backgrounds for better integration</li>
        </ul>
      </div>
    </div>
  );
}
