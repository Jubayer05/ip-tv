"use client";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Send, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const BulkNotification = () => {
  const { user, userRole, hasAdminAccess } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    newUsers: 0,
    inactiveUsers: 0,
  });

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    targetUsers: "all",
    customFilters: {
      country: "",
      role: "",
      minSpent: "",
    },
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);

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
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleInputChange = (field, value) => {
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
  };

  const calculateRecipientCount = () => {
    let count = 0;
    switch (formData.targetUsers) {
      case "all":
        count = stats.totalUsers;
        break;
      case "premium":
        count = stats.premiumUsers;
        break;
      case "new":
        count = stats.newUsers;
        break;
      case "inactive":
        count = stats.inactiveUsers;
        break;
      default:
        count = stats.totalUsers;
    }
    return count;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill in both subject and message fields.",
      });
      return;
    }

    const recipientCount = calculateRecipientCount();
    if (recipientCount === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Recipients",
        text: "No users match the selected criteria.",
      });
      return;
    }

    // Confirm before sending
    const result = await Swal.fire({
      icon: "question",
      title: "Send Bulk Notification?",
      text: `This will send the notification to ${recipientCount} users. Are you sure?`,
      showCancelButton: true,
      confirmButtonText: "Yes, Send",
      cancelButtonText: "Cancel",
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
          title: "Success!",
          text: data.message,
          confirmButtonColor: "#10b981",
        });

        // Reset form
        setFormData({
          subject: "",
          message: "",
          targetUsers: "all",
          customFilters: {
            country: "",
            role: "",
            minSpent: "",
          },
        });
      } else {
        throw new Error(data.error || "Failed to send notification");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to send bulk notification",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
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
            Bulk Notification System
          </h1>
          <p className="text-gray-400">
            Send notifications to multiple users based on various criteria
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Premium Users</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.premiumUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">New Users (30d)</p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.newUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Inactive Users</p>
                <p className="text-2xl font-bold text-red-400">
                  {stats.inactiveUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Users Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Target Users
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    value: "all",
                    label: "All Users",
                    count: stats.totalUsers,
                    color: "blue",
                  },
                  {
                    value: "premium",
                    label: "Premium Users",
                    count: stats.premiumUsers,
                    color: "yellow",
                  },
                  {
                    value: "new",
                    label: "New Users (30d)",
                    count: stats.newUsers,
                    color: "green",
                  },
                  {
                    value: "inactive",
                    label: "Inactive Users",
                    count: stats.inactiveUsers,
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country (Optional)
                </label>
                <input
                  type="text"
                  value={formData.customFilters.country}
                  onChange={(e) =>
                    handleInputChange("customFilters.country", e.target.value)
                  }
                  placeholder="e.g., US, UK, CA"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role (Optional)
                </label>
                <select
                  value={formData.customFilters.role}
                  onChange={(e) =>
                    handleInputChange("customFilters.role", e.target.value)
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="support">Support</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Min Spent $ (Optional)
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
                Email Subject <span className="text-red-400">*</span>
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
                  Email Message <span className="text-red-400">*</span>
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
                  {previewMode ? "Hide Preview" : "Show Preview"}
                </button>
              </div>

              {!previewMode ? (
                <RichTextEditor
                  value={formData.message}
                  onChange={(value) => handleInputChange("message", value)}
                  placeholder="Write your message here... You can use rich text formatting including bold, italic, lists, colors, and more."
                />
              ) : (
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">Preview:</div>
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
                <span className="text-gray-300">Estimated Recipients:</span>
                <span className="text-xl font-bold text-cyan-400">
                  {calculateRecipientCount()} users
                </span>
              </div>
            </div>

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
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Notification
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
