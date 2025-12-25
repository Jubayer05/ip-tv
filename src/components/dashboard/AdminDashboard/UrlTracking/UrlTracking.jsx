"use client";
import TableCustom from "@/components/ui/TableCustom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BarChart3,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import EditModalUrlTracking from "./EditModalUrlTracking";
import ShowModalUrlTracking from "./ShowModalUrlTracking";

const UrlTracking = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user } = useAuth();
  const [urlTrackings, setUrlTrackings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUrlTrackingId, setSelectedUrlTrackingId] = useState(null);
  const [editingUrl, setEditingUrl] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    slug: "",
    isActive: true,
    pageType: "non-existing",
  });
  const [slugValidation, setSlugValidation] = useState({
    isValid: null, // null = not checked, true = valid, false = invalid
    message: "",
  });

  // List of valid internal routes (must match API)
  const validInternalRoutes = [
    // General public routes
    "about-us",
    "affiliate",
    "blogs",
    "explore",
    "guest-login",
    "knowledge-base",
    "notifications",
    "packages",
    "privacy-policy",
    "reviews",
    "terms-of-use",
    // Auth routes
    "login",
    "register",
    "forgot-password",
    "reset-password",
    "verify-email",
    // Other public routes
    "cart",
    "deposit",
    "deposit/crypto",
    "support",
    "support/contact",
    "support/faq",
    "payment-status",
    "payment-status/failed",
    "payment-status/success",
    "payment-success",
    "payment-cancel",
    "sandbox-payment",
  ];

  // Validate slug against valid routes
  const validateSlug = (slug, pageType) => {
    if (pageType !== "existing" || !slug) {
      setSlugValidation({ isValid: null, message: "" });
      return;
    }

    const normalizedSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-");

    // Check if slug matches any valid route or is a dynamic route pattern
    const isValidRoute =
      validInternalRoutes.includes(normalizedSlug) ||
      normalizedSlug.startsWith("blogs/") ||
      normalizedSlug.startsWith("notifications/") ||
      normalizedSlug.startsWith("payment-status/");

    if (isValidRoute) {
      setSlugValidation({
        isValid: true,
        message: "✓ This slug matches an existing page in the application",
      });
    } else {
      setSlugValidation({
        isValid: false,
        message:
          "✗ This slug does not match any existing page. Please select 'Non-existing page' or use a valid internal route.",
      });
    }
  };

  // Validate slug when it changes or pageType changes
  useEffect(() => {
    validateSlug(formData.slug, formData.pageType);
  }, [formData.slug, formData.pageType]);

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "URL Tracking",
    description: "Manage and track URL clicks and analytics",
    addUrl: "Add New URL",
    editUrl: "Edit URL",
    title: "Title",
    description: "Description",
    url: "URL",
    shortCode: "Short Code",
    status: "Status",
    clicks: "Clicks",
    lastAccessed: "Last Accessed",
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
    confirmDelete: "Are you sure you want to delete this URL?",
    urlDeleted: "URL deleted successfully",
    urlSaved: "URL saved successfully",
    error: "An error occurred",
    loading: "Loading...",
    noUrls: "No URLs found",
    copyLink: "Copy Link",
    linkCopied: "Link copied to clipboard!",
    pageType: "Page Type",
    existingPage: "Existing Page",
    nonExistingPage: "Non-existing Page",
    pageTypeDescription: "Select whether this page exists in the application",
    slugValid: "This slug matches an existing page in the application",
    slugInvalid:
      "This slug does not match any existing page. Please select 'Non-existing page' or use a valid internal route.",
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

  // Fetch URL trackings
  const fetchUrlTrackings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/url-tracking");
      const data = await response.json();

      if (data.success) {
        setUrlTrackings(data.data);
      } else {
        console.error("Failed to fetch URL trackings:", data.error);
      }
    } catch (error) {
      console.error("Error fetching URL trackings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLanguageLoaded) {
      fetchUrlTrackings();
    }
  }, [isLanguageLoaded]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate slug if pageType is existing
    if (formData.pageType === "existing" && formData.slug) {
      const normalizedSlug = formData.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-");

      const isValidRoute =
        validInternalRoutes.includes(normalizedSlug) ||
        normalizedSlug.startsWith("blogs/") ||
        normalizedSlug.startsWith("notifications/") ||
        normalizedSlug.startsWith("payment-status/");

      if (!isValidRoute) {
        Swal.fire({
          icon: "error",
          title: texts.error,
          text: "The slug does not match any existing page in the application. Please select 'Non-existing page' or use a valid internal route.",
        });
        return;
      }
    }

    try {
      const url = editingUrl
        ? `/api/url-tracking/${editingUrl._id}`
        : "/api/url-tracking";
      const method = editingUrl ? "PUT" : "POST";

      // Normalize slug
      const normalizedSlug = formData.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-");

      // Generate URL from slug
      const generatedUrl = `https://www.cheapstreamtv.com/${normalizedSlug}`;

      // Ensure slug is included and normalized - explicitly include pageType
      const payload = {
        title: formData.title,
        description: formData.description,
        url: generatedUrl,
        slug: normalizedSlug,
        isActive: formData.isActive,
        pageType: formData.pageType || "non-existing", // Explicitly include pageType
        userId: user._id,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: texts.urlSaved,
          showConfirmButton: false,
          timer: 2000,
        });
        setShowModal(false);
        setEditingUrl(null);
        resetForm();
        fetchUrlTrackings();
      } else {
        throw new Error(data.error || "Failed to save URL");
      }
    } catch (error) {
      console.error("Error saving URL:", error);
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: error.message || "Failed to save URL",
      });
    }
  };

  const handleEdit = (urlTracking) => {
    setEditingUrl(urlTracking);
    setFormData({
      title: urlTracking.title,
      description: urlTracking.description || "",
      url: urlTracking.url, // Keep for display, but will be regenerated on save
      slug: urlTracking.slug || "",
      isActive: urlTracking.isActive,
      pageType: urlTracking.pageType || "non-existing", // Add this
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (urlId) => {
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
        const response = await fetch(`/api/url-tracking/${urlId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: "success",
            title: texts.urlDeleted,
            showConfirmButton: false,
            timer: 2000,
          });
          fetchUrlTrackings();
        } else {
          throw new Error(data.error || "Failed to delete URL");
        }
      } catch (error) {
        console.error("Error deleting URL:", error);
        Swal.fire({
          icon: "error",
          title: texts.error,
          text: error.message || "Failed to delete URL",
        });
      }
    }
  };

  // Toggle URL status
  const toggleUrlStatus = async (urlTracking) => {
    try {
      const response = await fetch(`/api/url-tracking/${urlTracking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !urlTracking.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: `URL ${
            !urlTracking.isActive ? "enabled" : "disabled"
          } successfully`,
          showConfirmButton: false,
          timer: 2000,
        });
        fetchUrlTrackings();
      } else {
        throw new Error(data.error || "Failed to update URL status");
      }
    } catch (error) {
      console.error("Error updating URL status:", error);
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: error.message || "Failed to update URL status",
      });
    }
  };

  const copyTrackingLink = (urlTracking) => {
    const trackingUrl = `${window.location.origin}/${urlTracking.slug}`;
    navigator.clipboard.writeText(trackingUrl);
    Swal.fire({
      icon: "success",
      title: texts.linkCopied,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      url: "",
      slug: "",
      isActive: true,
      pageType: "non-existing", // Add this
    });
    setSlugValidation({ isValid: null, message: "" });
  };

  const columns = [
    {
      title: texts.title,
      dataIndex: "title",
      width: 200,
      key: "title",
      align: "center",
      render: (text, record) => (
        <div className="text-left pl-2">
          <p className="text-white font-medium">{text}</p>
          {record.description && (
            <p className="text-gray-400 text-sm">{record.description}</p>
          )}
        </div>
      ),
    },

    {
      title: "Tracking Link",
      dataIndex: "slug",
      width: 200,
      key: "slug",
      align: "center",
      render: (text, record) => (
        <div className="text-left">
          <a
            href={`/${text}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300"
          >
            {typeof window !== "undefined" ? window.location.origin : ""}/{text}
          </a>
        </div>
      ),
    },
    {
      title: "Clicks",
      dataIndex: "clickCount",
      width: 100,
      key: "clickCount",
      align: "center",
      render: (text, record) => (
        <div className="text-center">
          <span className="text-white font-semibold">{text || 0}</span>
          <p className="text-gray-400 text-xs">
            {record.uniqueClickCount || 0} unique
          </p>
        </div>
      ),
    },

    {
      title: "Page Type",
      dataIndex: "pageType",
      width: 150,
      key: "pageType",
      align: "center",
      render: (pageType, record) => (
        <div className="flex items-center justify-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              pageType === "existing"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {pageType === "existing"
              ? texts.existingPage
              : texts.nonExistingPage}
          </span>
        </div>
      ),
    },

    {
      title: texts.status,
      dataIndex: "isActive",
      width: "100px",
      key: "status",
      render: (isActive, record) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => toggleUrlStatus(record)}
            className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs ${
              isActive
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {isActive ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
            {isActive ? texts.active : texts.inactive}
          </button>
        </div>
      ),
    },
    {
      title: texts.actions,
      width: "280px", // Increased width to accommodate all buttons
      key: "actions",
      render: (_, record) => (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleEdit(record)}
            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
            title={texts.edit}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(record._id)}
            className="p-1 text-red-400 hover:text-red-300 transition-colors"
            title={texts.delete}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => copyTrackingLink(record)}
            className="p-1 text-green-400 hover:text-green-300 transition-colors"
            title={texts.copyLink}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedUrlTrackingId(record._id);
              setShowDetailsModal(true);
            }}
            className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
            title="Show Details"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <a
            href={record.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            title="Open URL"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">{texts.loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-secondary">
      Header
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <LinkIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {texts.heading}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              {texts.description}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingUrl(null);
            resetForm();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          {texts.addUrl}
        </button>
      </div>
      {/* Table */}
      <div className="w-full">
        <TableCustom
          title={texts.heading}
          data={urlTrackings}
          columns={columns}
          pageSize={10}
          showButton={false}
          rowKey="_id"
          className="overflow-x-auto"
          containerClassName="overflow-x-auto 2xl:w-[975px]"
        />
      </div>
      {/* Modal */}
      <EditModalUrlTracking
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUrl(null);
          resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        editingUrl={editingUrl}
        texts={texts}
        slugValidation={slugValidation}
      />
      <ShowModalUrlTracking
        urlTrackingId={selectedUrlTrackingId}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedUrlTrackingId(null);
        }}
      />
    </div>
  );
};

export default UrlTracking;
