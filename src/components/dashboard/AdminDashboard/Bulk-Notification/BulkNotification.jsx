"use client";
import RichTextEditor from "@/components/ui/RichTextEditor";
import TableCustom from "@/components/ui/TableCustom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, EyeOff, Mail, Send, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";

const BulkNotification = () => {
  const { hasAdminAccess } = useAuth();
  const { language, translate, isLanguageLoaded } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    guestUsers: 0,
    loggedInUsers: 0,
    purchasedUsers: 0,
    loggedInNoPurchase: 0,
  });

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    targetUsers: "all",
    customFilters: {
      countries: [],
      roles: [],
      minSpent: "",
    },
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [previewUsers, setPreviewUsers] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showPreviewTable, setShowPreviewTable] = useState(false);

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Bulk Notification System",
    subtitle: "Send notifications to multiple users based on various criteria",
    targetUsers: "Target Users",
    allUsers: "All Users",
    guestUsers: "Guest Users",
    loggedInUsers: "Logged In Users",
    purchasedUsers: "Purchased Users",
    loggedInNoPurchase: "Logged In (No Purchase)",
    countries: "Countries (Optional)",
    selectCountries: "Select countries...",
    allCountries: "All Countries",
    roles: "Roles (Optional)",
    selectRoles: "Select roles...",
    user: "User",
    support: "Support",
    admin: "Admin",
    minSpent: "Min Spent $ (Optional)",
    emailSubject: "Email Subject",
    emailMessage: "Email Message",
    showPreview: "Show Preview",
    hidePreview: "Hide Preview",
    preview: "Preview:",
    estimatedRecipients: "Estimated Recipients:",
    users: "users",
    previewUsers: "Preview Users",
    loading: "Loading...",
    userPreview: "User Preview",
    name: "Name",
    email: "Email",
    country: "Country",
    role: "Role",
    totalSpent: "Total Spent",
    sendNotification: "Send Notification",
    sending: "Sending...",
    validationError: "Validation Error",
    fillRequiredFields: "Please fill in both subject and message fields.",
    noRecipients: "No Recipients",
    noUsersMatch: "No users match the selected criteria.",
    sendBulkNotification: "Send Bulk Notification?",
    willSendTo: "This will send the notification to",
    areYouSure: "users. Are you sure?",
    yesSend: "Yes, Send",
    cancel: "Cancel",
    success: "Success!",
    error: "Error",
    failedToSend: "Failed to send bulk notification",
    failedToFetchPreview: "Failed to fetch preview users",
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
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/bulk-message");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setAvailableCountries(data.countries || []);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleInputChange = useCallback((field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  }, []);

  const handleMessageChange = useCallback((value) => {
    setFormData((prev) => ({ ...prev, message: value }));
  }, []);

  const calculateRecipientCount = () => {
    let count = 0;
    switch (formData.targetUsers) {
      case "all":
        count = stats.totalUsers;
        break;
      case "guest":
        count = stats.guestUsers;
        break;
      case "loggedIn":
        count = stats.loggedInUsers;
        break;
      case "purchased":
        count = stats.purchasedUsers;
        break;
      case "loggedInNoPurchase":
        count = stats.loggedInNoPurchase;
        break;
      default:
        count = stats.totalUsers;
    }
    return count;
  };

  // Handler for react-select countries
  const handleCountriesChange = (selectedOptions) => {
    // Check if "All Countries" is selected
    const allCountriesOption = selectedOptions?.find(
      (opt) => opt.value === "all"
    );

    if (allCountriesOption) {
      // If "All Countries" is selected, only keep that
      setFormData((prev) => ({
        ...prev,
        customFilters: {
          ...prev.customFilters,
          countries: ["all"],
        },
      }));
    } else {
      // Otherwise, get all selected country values
      const countries = selectedOptions
        ? selectedOptions.map((opt) => opt.value)
        : [];
      setFormData((prev) => ({
        ...prev,
        customFilters: {
          ...prev.customFilters,
          countries,
        },
      }));
    }
  };

  // Handler for react-select roles
  const handleRolesChange = (selectedOptions) => {
    const roles = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setFormData((prev) => ({
      ...prev,
      customFilters: {
        ...prev.customFilters,
        roles,
      },
    }));
  };

  // Fetch preview of users based on filters
  const fetchPreviewUsers = async () => {
    setLoadingPreview(true);
    try {
      const response = await fetch("/api/admin/bulk-message/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUsers: formData.targetUsers,
          customFilters: formData.customFilters,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPreviewUsers(data.users || []);
        setShowPreviewTable(true);
      }
    } catch (error) {
      console.error("Error fetching preview users:", error);
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: texts.failedToFetchPreview,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      Swal.fire({
        icon: "error",
        title: texts.validationError,
        text: texts.fillRequiredFields,
      });
      return;
    }

    const recipientCount = calculateRecipientCount();
    if (recipientCount === 0) {
      Swal.fire({
        icon: "warning",
        title: texts.noRecipients,
        text: texts.noUsersMatch,
      });
      return;
    }

    // Confirm before sending
    const result = await Swal.fire({
      icon: "question",
      title: texts.sendBulkNotification,
      text: `${texts.willSendTo} ${recipientCount} ${texts.areYouSure}`,
      showCancelButton: true,
      confirmButtonText: texts.yesSend,
      cancelButtonText: texts.cancel,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/bulk-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: texts.success,
          text: data.message,
          confirmButtonColor: "#10b981",
        });

        // Reset form
        setFormData({
          subject: "",
          message: "",
          targetUsers: "all",
          customFilters: {
            countries: [],
            roles: [],
            minSpent: "",
          },
        });
      } else {
        throw new Error(data.error || "Failed to send notification");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: error.message || texts.failedToSend,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare options for react-select
  const countryOptions = [
    { value: "all", label: texts.allCountries },
    ...availableCountries.map((country) => ({
      value: country,
      label: country,
    })),
  ];

  const roleOptions = [
    { value: "user", label: texts.user },
    { value: "support", label: texts.support },
    { value: "admin", label: texts.admin },
  ];

  // Get selected options for react-select
  const selectedCountries = formData.customFilters.countries.includes("all")
    ? [{ value: "all", label: texts.allCountries }]
    : countryOptions.filter((opt) =>
        formData.customFilters.countries.includes(opt.value)
      );

  const selectedRoles = roleOptions.filter((opt) =>
    formData.customFilters.roles.includes(opt.value)
  );

  // Custom styles for react-select to match the dark theme
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#374151",
      borderColor: state.isFocused ? "#06b6d4" : "#4b5563",
      borderWidth: "1px",
      borderRadius: "0.5rem",
      minHeight: "42px",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(6, 182, 212, 0.2)" : "none",
      "&:hover": {
        borderColor: "#06b6d4",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#374151",
      borderRadius: "0.5rem",
      border: "1px solid #4b5563",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#06b6d4"
        : state.isFocused
        ? "#4b5563"
        : "#374151",
      color: "#ffffff",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#0891b2",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "rgba(6, 182, 212, 0.2)",
      borderRadius: "0.25rem",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#67e8f9",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#67e8f9",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "rgba(6, 182, 212, 0.3)",
        color: "#ffffff",
      },
    }),
    input: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
  };

  if (!hasAdminAccess()) {
    return null;
  }

  return (
    <div className="min-h-screen font-secondary bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Mail className="w-8 h-8 text-cyan-400" />
            {texts.heading}
          </h1>
          <p className="text-gray-400">{texts.subtitle}</p>
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Users Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                {texts.targetUsers}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  {
                    value: "all",
                    label: texts.allUsers,
                    count: stats.totalUsers,
                    color: "blue",
                  },
                  {
                    value: "guest",
                    label: texts.guestUsers,
                    count: stats.guestUsers,
                    color: "purple",
                  },
                  {
                    value: "loggedIn",
                    label: texts.loggedInUsers,
                    count: stats.loggedInUsers,
                    color: "green",
                  },
                  {
                    value: "purchased",
                    label: texts.purchasedUsers,
                    count: stats.purchasedUsers,
                    color: "yellow",
                  },
                  {
                    value: "loggedInNoPurchase",
                    label: texts.loggedInNoPurchase,
                    count: stats.loggedInNoPurchase,
                    color: "red",
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      formData.targetUsers === option.value
                        ? `border-${option.color}-500 bg-${option.color}-500/10`
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetUsers"
                      value={option.value}
                      checked={formData.targetUsers === option.value}
                      onChange={(e) =>
                        handleInputChange("targetUsers", e.target.value)
                      }
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold text-${option.color}-400`}
                      >
                        {option.count}
                      </div>
                      <div className="text-sm text-gray-300">
                        {option.label}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Multi-select Countries using react-select */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {texts.countries}
                </label>
                <Select
                  isMulti
                  name="countries"
                  options={countryOptions}
                  value={selectedCountries}
                  onChange={handleCountriesChange}
                  styles={customSelectStyles}
                  placeholder={texts.selectCountries}
                  isDisabled={formData.customFilters.countries.includes("all")}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Multi-select Roles using react-select */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {texts.roles}
                </label>
                <Select
                  isMulti
                  name="roles"
                  options={roleOptions}
                  value={selectedRoles}
                  onChange={handleRolesChange}
                  styles={customSelectStyles}
                  placeholder={texts.selectRoles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Min Spent */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {texts.minSpent}
                </label>
                <input
                  type="number"
                  value={formData.customFilters.minSpent}
                  onChange={(e) =>
                    handleInputChange("customFilters.minSpent", e.target.value)
                  }
                  placeholder="e.g., 100"
                  min="0"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {texts.emailSubject} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="Enter email subject..."
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Message */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  {texts.emailMessage} <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {previewMode ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {previewMode ? texts.hidePreview : texts.showPreview}
                </button>
              </div>

              {!previewMode ? (
                <RichTextEditor
                  value={formData.message}
                  title="Email Message"
                  onDataChange={handleMessageChange}
                />
              ) : (
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">
                    {texts.preview}
                  </div>
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.message }}
                  />
                </div>
              )}
            </div>

            {/* Recipient Count */}
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">
                  {texts.estimatedRecipients}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-cyan-400">
                    {calculateRecipientCount()} {texts.users}
                  </span>
                  <button
                    type="button"
                    onClick={fetchPreviewUsers}
                    disabled={loadingPreview}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingPreview ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {texts.loading}
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        {texts.previewUsers}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Users Table */}
            {showPreviewTable && previewUsers.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    {texts.userPreview} ({previewUsers.length} {texts.users})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPreviewTable(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile scrollable wrapper */}
                <div className="w-full overflow-x-auto">
                  <div className="min-w-full">
                    <TableCustom
                      title=""
                      data={previewUsers}
                      columns={[
                        {
                          title: "#",
                          dataIndex: "index",
                          key: "index",
                          width: "60px",
                          fixed: "left",
                          render: (text, record, index) => (
                            <span className="text-gray-300 text-xs sm:text-sm font-secondary pl-1 sm:pl-2 md:pl-5 break-all">
                              {index + 1}
                            </span>
                          ),
                        },
                        {
                          title: texts.name,
                          dataIndex: "name",
                          key: "name",
                          width: "150px",
                          align: "center",
                          render: (text) => (
                            <span className="text-gray-300 text-xs sm:text-sm font-secondary break-all">
                              {text || "N/A"}
                            </span>
                          ),
                        },
                        {
                          title: texts.email,
                          dataIndex: "email",
                          key: "email",
                          width: "200px",
                          render: (text) => (
                            <span className="text-gray-300 text-xs sm:text-sm font-secondary break-all">
                              {text}
                            </span>
                          ),
                        },
                        {
                          title: texts.country,
                          dataIndex: "country",
                          key: "country",
                          width: "100px",
                          align: "center",
                          render: (text) => (
                            <span className="text-gray-300 text-xs sm:text-sm font-secondary">
                              {text || "N/A"}
                            </span>
                          ),
                        },
                        {
                          title: texts.role,
                          dataIndex: "role",
                          key: "role",
                          width: "120px",
                          align: "center",
                          render: (role) => {
                            const statusClass =
                              role === "admin"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : role === "support"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30";

                            return (
                              <span
                                className={`px-2 sm:px-3 md:px-4 py-1 rounded-full text-xs font-medium font-secondary whitespace-nowrap ${statusClass}`}
                              >
                                {role}
                              </span>
                            );
                          },
                        },
                        {
                          title: texts.totalSpent,
                          dataIndex: "totalSpent",
                          key: "totalSpent",
                          width: "120px",
                          align: "center",
                          render: (amount) => (
                            <span className="text-gray-300 text-xs sm:text-sm font-secondary">
                              ${amount?.toFixed(2) || "0.00"}
                            </span>
                          ),
                        },
                      ]}
                      pageSize={10}
                      showButton={false}
                      showHeader={true}
                      rowKey="_id"
                      // containerClassName="max-w-full min-w-[600px]"
                      scroll={{ x: 600 }}
                      className="overflow-x-auto"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.subject.trim() ||
                  !formData.message.trim()
                }
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {texts.sending}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {texts.sendNotification}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkNotification;
