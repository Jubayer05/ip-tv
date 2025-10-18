"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const SiteStatusManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteStatus, setSiteStatus] = useState({
    isActive: true,
    maintenanceMessage:
      "We're currently performing maintenance. Please check back later.",
  });

  useEffect(() => {
    fetchSiteStatus();
  }, []);

  const fetchSiteStatus = async () => {
    try {
      const response = await fetch("/api/settings/site-status");
      const data = await response.json();

      if (data.success) {
        setSiteStatus(data.data);
      } else {
        console.error("Failed to fetch site status:", data.error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load site status settings",
        });
      }
    } catch (error) {
      console.error("Error fetching site status:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshMaintenanceStatus = async () => {
    try {
      await fetch(`/maintenance-status.json?ts=${Date.now()}`, {
        cache: "no-store",
      });
    } catch {
      // ignore
    }
  };

  const handleStatusToggle = async () => {
    setSaving(true);
    try {
      const newStatus = !siteStatus.isActive;
      const response = await fetch("/api/settings/site-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: newStatus,
          maintenanceMessage: siteStatus.maintenanceMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSiteStatus({ ...siteStatus, isActive: newStatus });

        Swal.fire({
          icon: "success",
          title: "Status Updated!",
          text: `Site is now ${newStatus ? "active" : "under maintenance"}. ${
            !newStatus
              ? "All public pages will show maintenance message."
              : "Site is now accessible to users."
          }`,
          timer: 3000,
          showConfirmButton: false,
        });

        await refreshMaintenanceStatus();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.error || "Failed to update site status",
        });
      }
    } catch (error) {
      console.error("Error updating site status:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMessageChange = async (newMessage) => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/site-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: siteStatus.isActive,
          maintenanceMessage: newMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSiteStatus({ ...siteStatus, maintenanceMessage: newMessage });
        Swal.fire({
          icon: "success",
          title: "Message Updated!",
          text: "Maintenance message has been updated",
          timer: 2000,
          showConfirmButton: false,
        });

        await refreshMaintenanceStatus();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.error || "Failed to update maintenance message",
        });
      }
    } catch (error) {
      console.error("Error updating maintenance message:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b877]"></div>
          <p className="text-gray-400 mt-4">Loading site status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-[#212121] bg-black rounded-[15px] p-6">
        <h3 className="text-white font-semibold text-lg mb-6">
          Site Status Management
        </h3>

        {/* Current Status Display */}
        <div className="bg-[#0c171c] rounded-lg border border-[#212121] p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">Current Status</h4>
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  siteStatus.isActive
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {siteStatus.isActive ? "Active" : "Under Maintenance"}
              </span>
            </div>
          </div>

          <p className="text-gray-300 text-sm">
            {siteStatus.isActive
              ? "Your website is currently active and accessible to all users."
              : "Your website is currently under maintenance and not accessible to regular users."}
          </p>
        </div>

        {/* Status Toggle */}
        <div className="bg-[#0c171c] rounded-lg border border-[#212121] p-4 mb-6">
          <h4 className="text-white font-medium mb-4">Toggle Site Status</h4>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm mb-1">
                {siteStatus.isActive
                  ? "Put site under maintenance"
                  : "Activate site"}
              </p>
              <p className="text-gray-400 text-xs">
                {siteStatus.isActive
                  ? "This will make your site inaccessible to users"
                  : "This will make your site accessible to users"}
              </p>
            </div>

            <button
              onClick={handleStatusToggle}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                siteStatus.isActive
                  ? "bg-red-600 focus:ring-red-500"
                  : "bg-green-600 focus:ring-green-500"
              } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  siteStatus.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Maintenance Message */}
        <div className="bg-[#0c171c] rounded-lg border border-[#212121] p-4">
          <h4 className="text-white font-medium mb-4">Maintenance Message</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message to display during maintenance
              </label>
              <textarea
                value={siteStatus.maintenanceMessage}
                onChange={(e) =>
                  setSiteStatus({
                    ...siteStatus,
                    maintenanceMessage: e.target.value,
                  })
                }
                rows="3"
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none text-sm"
                placeholder="Enter maintenance message..."
              />
            </div>

            <button
              onClick={() => handleMessageChange(siteStatus.maintenanceMessage)}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {saving ? "Saving..." : "Update Message"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteStatusManagement;
