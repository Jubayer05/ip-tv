"use client";
import TableCustom from "@/components/ui/TableCustom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDeviceLogin } from "@/hooks/useDeviceLogin";
import { Shield, ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const DeviceLoginTable = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { deviceLogins, loading, error, suspendDevice, fetchDeviceLogins } =
    useDeviceLogin();
  const { isAuthenticated, user } = useAuth();

  const ORIGINAL_LOADING = "Loading device data...";
  const ORIGINAL_TITLE = "Latest LOGIN";
  const ORIGINAL_COLUMNS = {
    device: "Device",
    loginDate: "Login Date",
    country: "Location",
    lastActivity: "Last Activity",
    status: "Status",
    actions: "Actions",
  };
  const ORIGINAL_STATUSES = {
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
  };

  const [title, setTitle] = useState(ORIGINAL_TITLE);
  const [columns, setColumns] = useState(ORIGINAL_COLUMNS);
  const [statuses, setStatuses] = useState(ORIGINAL_STATUSES);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_LOADING,
        ORIGINAL_TITLE,
        ORIGINAL_COLUMNS.device,
        ORIGINAL_COLUMNS.loginDate,
        ORIGINAL_COLUMNS.country,
        ORIGINAL_COLUMNS.lastActivity,
        ORIGINAL_COLUMNS.status,
        ORIGINAL_COLUMNS.actions,
        ORIGINAL_STATUSES.active,
        ORIGINAL_STATUSES.inactive,
        ORIGINAL_STATUSES.suspended,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tLoading,
        tTitle,
        tDevice,
        tLoginDate,
        tCountry,
        tLastActivity,
        tStatus,
        tActions,
        tActive,
        tInactive,
        tSuspended,
      ] = translated;

      setTitle(tTitle);
      setColumns({
        device: tDevice,
        loginDate: tLoginDate,
        country: tCountry,
        lastActivity: tLastActivity,
        status: tStatus,
        actions: tActions,
      });
      setStatuses({
        active: tActive,
        inactive: tInactive,
        suspended: tSuspended,
      });
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDeviceLogins();
    }
  }, [isAuthenticated, fetchDeviceLogins]);

  // Add this useEffect to fetch data when component mounts
  useEffect(() => {
    fetchDeviceLogins();
  }, [fetchDeviceLogins]);

  const handleSuspendDevice = async (deviceLoginId, deviceName) => {
    const result = await Swal.fire({
      title: "Suspend Device",
      text: `Are you sure you want to suspend ${deviceName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, suspend it!",
    });

    if (result.isConfirmed) {
      try {
        await suspendDevice(deviceLoginId);
        Swal.fire({
          title: "Suspended!",
          text: "Device has been suspended successfully.",
          icon: "success",
          confirmButtonColor: "#00b877",
        });
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Failed to suspend device. Please try again.",
          icon: "error",
          confirmButtonColor: "#dc3545",
        });
      }
    }
  };

  const formatDeviceName = (deviceInfo) => {
    if (!deviceInfo) return "Unknown Device";
    const { device, browser, os } = deviceInfo;
    return `${device} (${browser} on ${os})`;
  };

  const tableColumns = [
    {
      title: columns.device,
      width: 200,
      dataIndex: "deviceInfo",
      key: "device",
      render: (deviceInfo) => (
        <span className="pl-3 text-gray-300 text-xs sm:text-sm font-secondary md:pl-5 break-words">
          {formatDeviceName(deviceInfo)}
        </span>
      ),
    },
    {
      title: columns.loginDate,
      width: 120,
      dataIndex: "loginDate",
      key: "loginDate",
      align: "center",
      render: (date) => (
        <span className="text-gray-300 text-xs sm:text-sm font-secondary whitespace-nowrap">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      title: columns.country, // Changed from country to country
      width: 150, // Increased width for country display
      dataIndex: "location", // Changed from ipAddress to location
      key: "location", // Changed from country to location
      align: "center",
      render: () => (
        <span className="text-gray-300 text-xs sm:text-sm font-secondary break-words">
          {user.profile.country}
        </span>
      ),
    },
    {
      title: columns.lastActivity,
      width: 140,
      dataIndex: "lastActivity",
      key: "lastActivity",
      align: "center",
      render: (date) => (
        <span className="text-gray-300 text-xs sm:text-sm font-secondary whitespace-nowrap">
          {new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      title: columns.status,
      width: 100,
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <span
          className={`px-2 sm:px-3 md:px-4 py-1 rounded-full text-xs font-medium font-secondary whitespace-nowrap ${
            status === "active"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : status === "inactive"
              ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {statuses[status] || status}
        </span>
      ),
    },
    {
      title: columns.actions,
      width: 80,
      key: "actions",
      align: "center",
      render: (_, record) => (
        <button
          onClick={() =>
            handleSuspendDevice(record._id, formatDeviceName(record.deviceInfo))
          }
          disabled={record.status === "suspended"}
          className={`p-2 rounded-lg transition-colors ${
            record.status === "suspended"
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
          title={
            record.status === "suspended"
              ? "Already suspended"
              : "Suspend device"
          }
        >
          {record.status === "suspended" ? (
            <ShieldOff className="w-4 h-4" />
          ) : (
            <Shield className="w-4 h-4" />
          )}
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 p-4 sm:p-6 md:p-8 w-full max-w-5xl mx-auto font-secondary">
        <div className="flex items-center justify-center h-20 sm:h-24 md:h-32">
          <div className="text-gray-400 text-xs sm:text-sm md:text-base text-center">
            {ORIGINAL_LOADING}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 p-4 sm:p-6 md:p-8 w-full max-w-5xl mx-auto font-secondary">
        <div className="flex items-center justify-center h-20 sm:h-24 md:h-32">
          <div className="text-red-400 text-xs sm:text-sm md:text-base text-center">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!deviceLogins || deviceLogins.length === 0) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 p-4 sm:p-6 md:p-8 w-full max-w-5xl mx-auto font-secondary">
        <div className="flex items-center justify-center h-20 sm:h-24 md:h-32">
          <div className="text-gray-400 text-xs sm:text-sm md:text-base text-center">
            No device logins found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 max-w-[340px] md:max-w-5xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Device Logins</h3>
        <button
          onClick={() => fetchDeviceLogins()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      <TableCustom
        title={title}
        data={deviceLogins}
        columns={tableColumns}
        pageSize={5}
        showButton={false}
        showPagination={true}
        showHeader={true}
        containerClassName=""
        rowKey={(record) =>
          record._id || record.id || `device-${record.loginDate}`
        }
      />
    </div>
  );
};

export default DeviceLoginTable;
