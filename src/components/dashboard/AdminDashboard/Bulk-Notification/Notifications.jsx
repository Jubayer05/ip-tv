"use client";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bell, Calendar, Edit, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";

const Notifications = () => {
  const { user, userRole, hasAdminAccess } = useAuth();
  const { language, translate, isLanguageLoaded } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    search: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Website Notifications Management",
    subtitle: "Manage website notifications for users",
    total: "Total",
    active: "Active",
    expired: "Expired",
    allTypes: "All Types",
    info: "Info",
    discount: "Discount",
    promotions: "Promotions",
    notice: "Notice",
    allStatus: "All Status",
    inactive: "Inactive",
    searchPlaceholder: "Search notifications...",
    addNotification: "Add Notification",
    loadingNotifications: "Loading notifications...",
    noNotificationsFound: "No notifications found",
    validFrom: "Valid from:",
    validUntil: "Valid until:",
    edit: "Edit",
    delete: "Delete",
    editNotification: "Edit Notification",
    addNewNotification: "Add New Notification",
    title: "Title",
    type: "Type",
    message: "Message",
    notificationTitle: "Notification title",
    selectDateAndTime: "Select date and time",
    writeNotificationMessage: "Write your notification message here...",
    cancel: "Cancel",
    saving: "Saving...",
    update: "Update",
    create: "Create",
    notification: "Notification",
    validationError: "Validation Error",
    fillRequiredFields: "Please fill in all required fields.",
    success: "Success!",
    error: "Error",
    failedToSaveNotification: "Failed to save notification",
    deleteNotification: "Delete Notification?",
    cannotBeUndone: "This action cannot be undone.",
    yesDelete: "Yes, Delete",
    deleted: "Deleted!",
    failedToDeleteNotification: "Failed to delete notification",
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

  // Check admin access
  useEffect(() => {
    if (!hasAdminAccess()) {
      router.push("/dashboard");
      return;
    }
    fetchNotifications();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/admin/notifications?${params}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper function to check if rich text content is empty
  const isRichTextEmpty = (html) => {
    if (!html) return true;
    // Remove HTML tags and check if there's actual text content
    const text = html.replace(/<[^>]*>/g, "").trim();
    return text.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || isRichTextEmpty(formData.message)) {
      Swal.fire({
        icon: "error",
        title: texts.validationError,
        text: texts.fillRequiredFields,
      });
      return;
    }

    setLoading(true);
    try {
      const url = editingId
        ? `/api/admin/notifications/${editingId}`
        : "/api/admin/notifications";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // No need to add createdBy anymore
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: texts.success,
          text: data.message,
          confirmButtonColor: "#10b981",
        });

        resetForm();
        fetchNotifications();
        fetchStats();
      } else {
        throw new Error(data.error || texts.failedToSaveNotification);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: error.message || texts.failedToSaveNotification,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notification) => {
    setEditingId(notification._id);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      validFrom: new Date(notification.validFrom),
      validUntil: new Date(notification.validUntil),
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: texts.deleteNotification,
      text: texts.cannotBeUndone,
      showCancelButton: true,
      confirmButtonText: texts.yesDelete,
      cancelButtonText: texts.cancel,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: texts.deleted,
          text: data.message,
          confirmButtonColor: "#10b981",
        });
        fetchNotifications();
        fetchStats();
      } else {
        throw new Error(data.error || texts.failedToDeleteNotification);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: error.message || texts.failedToDeleteNotification,
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (!hasAdminAccess()) {
    return null;
  }

  return (
    <div className="min-h-screen font-secondary bg-gray-900 text-white p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
            {texts.heading}
          </h1>
          <p className="text-sm sm:text-base text-gray-400">{texts.subtitle}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {texts.total}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-white">
                  {stats.total}
                </p>
              </div>
              <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 sm:p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {texts.active}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-green-400">
                  {stats.active}
                </p>
              </div>
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 sm:p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {texts.expired}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-red-400">
                  {stats.expired}
                </p>
              </div>
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2 sm:gap-4 w-full lg:w-auto">
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">{texts.allTypes}</option>
                <option value="info">{texts.info}</option>
                <option value="discount">{texts.discount}</option>
                <option value="promotions">{texts.promotions}</option>
                <option value="notice">{texts.notice}</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">{texts.allStatus}</option>
                <option value="active">{texts.active}</option>
                <option value="inactive">{texts.inactive}</option>
                <option value="expired">{texts.expired}</option>
              </select>

              <input
                type="text"
                placeholder={texts.searchPlaceholder}
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex cursor-pointer items-center gap-2 px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              {texts.addNotification}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 sm:p-6">
          {loading ? (
            <div className="text-center py-6 sm:py-8">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-400 mt-2 text-sm sm:text-base">
                {texts.loadingNotifications}
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-400 text-sm sm:text-base">
                {texts.noNotificationsFound}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="bg-gray-700 rounded-lg p-3 sm:p-4 border border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                          {notification.title}
                        </h3>
                        <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded-full whitespace-nowrap">
                          {notification.type}
                        </span>
                      </div>

                      <p className="text-gray-300 mb-2 sm:mb-3 text-sm sm:text-base line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs sm:text-sm text-gray-400">
                        <span>
                          {texts.validFrom}{" "}
                          {new Date(
                            notification.validFrom
                          ).toLocaleDateString()}
                        </span>
                        <span>
                          {texts.validUntil}{" "}
                          {new Date(
                            notification.validUntil
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(notification)}
                        className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                        title={texts.edit}
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        title={texts.delete}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-4 sm:mt-6">
              <div className="flex gap-1 sm:gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setPagination({ ...pagination, page })}
                      className={`px-2 sm:px-3 cursor-pointer py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${
                        page === pagination.page
                          ? "bg-cyan-500 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  {editingId
                    ? texts.editNotification
                    : texts.addNewNotification}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 cursor-pointer hover:text-white transition-colors text-lg sm:text-xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      {texts.title} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder={texts.notificationTitle}
                      required
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      {texts.type}
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        handleInputChange("type", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="info">{texts.info}</option>
                      <option value="discount">{texts.discount}</option>
                      <option value="promotions">{texts.promotions}</option>
                      <option value="notice">{texts.notice}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      {texts.validFrom}
                    </label>
                    <DatePicker
                      selected={formData.validFrom}
                      onChange={(date) => handleInputChange("validFrom", date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholderText={texts.selectDateAndTime}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      {texts.validUntil} <span className="text-red-400">*</span>
                    </label>
                    <DatePicker
                      selected={formData.validUntil}
                      onChange={(date) => handleInputChange("validUntil", date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={formData.validFrom}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholderText={texts.selectDateAndTime}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    {texts.message} <span className="text-red-400">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.message}
                    onDataChange={(value) =>
                      handleInputChange("message", value)
                    }
                    placeholder={texts.writeNotificationMessage}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-600">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 sm:px-6 py-2 text-gray-300 cursor-pointer hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {texts.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer flex items-center gap-2 px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {texts.saving}
                      </>
                    ) : (
                      <>
                        {editingId ? texts.update : texts.create}{" "}
                        {texts.notification}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
