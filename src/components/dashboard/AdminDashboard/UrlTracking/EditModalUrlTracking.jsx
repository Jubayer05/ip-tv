"use client";
import { CheckCircle, X, XCircle } from "lucide-react";

const EditModalUrlTracking = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  editingUrl,
  texts,
  slugValidation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[10000]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {editingUrl ? texts.editUrl : texts.addUrl}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
              {texts.description}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {texts.url} *
            </label>
            <input
              type="url"
              value={
                formData.slug
                  ? `https://www.cheapstreamtv.com/${formData.slug
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9-]/g, "-")}`
                  : ""
              }
              disabled
              readOnly
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
              placeholder="Auto-generated from slug"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL is automatically generated from the slug
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "-"),
                })
              }
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                slugValidation.isValid === false
                  ? "border-red-500 focus:ring-red-500"
                  : slugValidation.isValid === true
                  ? "border-green-500 focus:ring-green-500"
                  : "border-gray-600 focus:ring-cyan-500"
              }`}
              placeholder="facebook"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Tracking URL will be:{" "}
              {typeof window !== "undefined" && window.location.origin}/
              {formData.slug || "slug"}
            </p>
            {/* Validation message */}
            {formData.pageType === "existing" &&
              slugValidation.isValid !== null &&
              slugValidation.message && (
                <div
                  className={`flex items-center gap-2 mt-2 text-xs ${
                    slugValidation.isValid ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {slugValidation.isValid ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>{slugValidation.message}</span>
                </div>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {texts.pageType} *
            </label>
            <p className="text-xs text-gray-500 mb-3">
              {texts.pageTypeDescription}
            </p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pageType"
                  value="existing"
                  checked={formData.pageType === "existing"}
                  onChange={(e) =>
                    setFormData({ ...formData, pageType: e.target.value })
                  }
                  className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500"
                />
                <span className="text-gray-300">{texts.existingPage}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pageType"
                  value="non-existing"
                  checked={formData.pageType === "non-existing"}
                  onChange={(e) =>
                    setFormData({ ...formData, pageType: e.target.value })
                  }
                  className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500"
                />
                <span className="text-gray-300">{texts.nonExistingPage}</span>
              </label>
            </div>
            {formData.pageType === "existing" && (
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ The slug must match an existing page route in the application
              </p>
            )}
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

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors w-full sm:w-auto"
            >
              {texts.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors w-full sm:w-auto"
            >
              {texts.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModalUrlTracking;
