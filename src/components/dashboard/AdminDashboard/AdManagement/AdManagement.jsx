"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Megaphone,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const AdManagement = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
    sortOrder: 0,
  });

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Ad Management",
    description: "Manage advertisements and promotional content",
    addAd: "Add New Ad",
    editAd: "Edit Ad",
    title: "Title",
    description: "Description",
    imageUrl: "Image URL",
    linkUrl: "Link URL",
    status: "Status",
    clicks: "Clicks",
    impressions: "Impressions",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    hide: "Hide",
    show: "Show",
    confirmDelete: "Are you sure you want to delete this ad?",
    adDeleted: "Ad deleted successfully",
    adSaved: "Ad saved successfully",
    error: "An error occurred",
    loading: "Loading...",
    noAds: "No ads found",
    uploadImage: "Upload Image",
    removeImage: "Remove Image",
    changeImage: "Change Image",
    imageRequirements:
      "Image requirements: JPEG, PNG, WebP, or GIF. Max size: 5MB",
    sortOrder: "Sort Order",
  };

  // Ensure labels always render: translate asynchronously with fallback
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!isLanguageLoaded) {
          if (mounted) setTexts(ORIGINAL_TEXTS);
          return;
        }
        const values = Object.values(ORIGINAL_TEXTS);
        const translated = await translate(values);
        const keys = Object.keys(ORIGINAL_TEXTS);
        const result = keys.reduce((acc, key, idx) => {
          acc[key] = translated?.[idx] || ORIGINAL_TEXTS[key];
          return acc;
        }, {});
        if (mounted) setTexts(result);
      } catch {
        if (mounted) setTexts(ORIGINAL_TEXTS);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isLanguageLoaded, language?.code]);

  // Fetch ads
  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ads");
      const data = await response.json();

      if (data.success) {
        setAds(data.data);
      } else {
        console.error("Failed to fetch ads:", data.error);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLanguageLoaded) {
      fetchAds();
    }
  }, [isLanguageLoaded]);

  // Handle image upload
  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append("file", file);

      const response = await fetch("/api/ads/upload-image", {
        method: "POST",
        body: fd,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.data.imageUrl }));
        Swal.fire({
          icon: "success",
          title: "Image uploaded successfully",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        throw new Error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Error",
        text: error.message || "Failed to upload image",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle remove image
  const handleRemoveImage = async () => {
    try {
      if (formData.imageUrl) {
        const response = await fetch(
          `/api/ads/upload-image?imageUrl=${encodeURIComponent(
            formData.imageUrl
          )}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setFormData((prev) => ({ ...prev, imageUrl: "" }));
        }
      }
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingAd ? `/api/ads/${editingAd._id}` : "/api/ads";
      const method = editingAd ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: texts.adSaved,
          showConfirmButton: false,
          timer: 2000,
        });
        setShowModal(false);
        setEditingAd(null);
        resetForm();
        fetchAds();
      } else {
        throw new Error(data.error || "Failed to save ad");
      }
    } catch (error) {
      console.error("Error saving ad:", error);
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: error.message || "Failed to save ad",
      });
    }
  };

  // Handle edit
  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      isActive: ad.isActive,
      sortOrder: ad.sortOrder || 0,
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (adId) => {
    const result = await Swal.fire({
      title: texts.confirmDelete,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: texts.delete,
      cancelButtonText: texts.cancel,
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/ads/${adId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: "success",
            title: texts.adDeleted,
            showConfirmButton: false,
            timer: 2000,
          });
          fetchAds();
        } else {
          throw new Error(data.error || "Failed to delete ad");
        }
      } catch (error) {
        console.error("Error deleting ad:", error);
        Swal.fire({
          icon: "error",
          title: texts.error,
          text: error.message || "Failed to delete ad",
        });
      }
    }
  };

  // Toggle ad status
  const toggleAdStatus = async (ad) => {
    try {
      const response = await fetch(`/api/ads/${ad._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !ad.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: `Ad ${!ad.isActive ? "enabled" : "disabled"} successfully`,
          showConfirmButton: false,
          timer: 2000,
        });
        fetchAds();
      } else {
        throw new Error(data.error || "Failed to update ad status");
      }
    } catch (error) {
      console.error("Error updating ad status:", error);
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: error.message || "Failed to update ad status",
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      isActive: true,
      sortOrder: 0,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">{texts.loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-secondary">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Megaphone className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{texts.heading}</h2>
            <p className="text-gray-400">{texts.description}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingAd(null);
            resetForm();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {texts.addAd}
        </button>
      </div>

      {/* Ads List */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700">
        {ads.length === 0 ? (
          <div className="p-8 text-center">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">{texts.noAds}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    {texts.title}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    {texts.status}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    {texts.clicks}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    {texts.impressions}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    {texts.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {ads.map((ad) => (
                  <tr key={ad._id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {ad.imageUrl && (
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p className="text-white font-medium">{ad.title}</p>
                          <p className="text-gray-400 text-sm">
                            {ad.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAdStatus(ad)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          ad.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {ad.isActive ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {ad.isActive ? texts.active : texts.inactive}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-white">
                      {ad.clickCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {ad.impressionCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(ad)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          title={texts.edit}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ad._id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title={texts.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {ad.linkUrl && (
                          <a
                            href={ad.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-green-400 hover:text-green-300 transition-colors"
                            title="Open Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingAd ? texts.editAd : texts.addAd}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAd(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {texts.title} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {texts.description} *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows="3"
                  required
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {texts.imageUrl} *
                </label>
                {formData.imageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={formData.imageUrl}
                      alt="Ad preview"
                      className="w-32 h-20 object-cover rounded-lg border border-gray-600"
                    />
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                        className="hidden"
                        id="change-image-upload"
                      />
                      <label
                        htmlFor="change-image-upload"
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors cursor-pointer"
                      >
                        {texts.changeImage}
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                      >
                        {texts.removeImage}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-gray-400 text-sm">
                        {uploadingImage ? "Uploading..." : texts.uploadImage}
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      {texts.imageRequirements}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {texts.linkUrl} *
                  </label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, linkUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {texts.sortOrder}
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-gray-300">{texts.active}</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAd(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  {texts.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                >
                  {texts.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdManagement;
