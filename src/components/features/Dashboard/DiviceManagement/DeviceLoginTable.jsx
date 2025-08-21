"use client";
import TableCustom from "@/components/ui/TableCustom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const DeviceLoginTable = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [deviceData, setDeviceData] = useState([]);

  const ORIGINAL_LOADING = "Loading device data...";
  const ORIGINAL_TITLE = "Latest LOGIN";
  const ORIGINAL_COLUMNS = {
    device: "Device",
    loginDate: "Login Date",
    ipAddress: "IP Address",
    lastActivity: "Last Activity",
    status: "Status",
  };
  const ORIGINAL_STATUSES = {
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
  };

  const [loading, setLoading] = useState(ORIGINAL_LOADING);
  const [title, setTitle] = useState(ORIGINAL_TITLE);
  const [columns, setColumns] = useState(ORIGINAL_COLUMNS);
  const [statuses, setStatuses] = useState(ORIGINAL_STATUSES);

  // Generate dynamic device login data
  const generateDeviceData = (currentStatuses) => {
    const devices = [
      "iPhone 14 Pro",
      "MacBook Pro",
      "iPad Air",
      "Samsung Galaxy S23",
      "Dell XPS 13",
      "Google Pixel 8",
      "Surface Laptop",
      "OnePlus 11",
      "Xiaomi 13",
      "ASUS ROG",
    ];
    const statuses = [
      currentStatuses.active,
      currentStatuses.inactive,
      currentStatuses.suspended,
    ];
    const data = [];

    for (let i = 1; i <= 15; i++) {
      const device = devices[Math.floor(Math.random() * devices.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const loginDate = new Date();
      loginDate.setDate(loginDate.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days

      const lastActivity = new Date();
      lastActivity.setHours(
        lastActivity.getHours() - Math.floor(Math.random() * 24)
      ); // Random time within last 24 hours

      // Generate random IP address
      const ipAddress = `${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

      data.push({
        key: i.toString(),
        device: device,
        loginDate: loginDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        ipAddress: ipAddress,
        lastActivity: lastActivity.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: status,
      });
    }

    return data;
  };

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
        ORIGINAL_COLUMNS.ipAddress,
        ORIGINAL_COLUMNS.lastActivity,
        ORIGINAL_COLUMNS.status,
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
        tIpAddress,
        tLastActivity,
        tStatus,
        tActive,
        tInactive,
        tSuspended,
      ] = translated;

      setLoading(tLoading);
      setTitle(tTitle);
      setColumns({
        device: tDevice,
        loginDate: tLoginDate,
        ipAddress: tIpAddress,
        lastActivity: tLastActivity,
        status: tStatus,
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

  // Generate data only on client side to avoid hydration mismatch
  useEffect(() => {
    setDeviceData(generateDeviceData(statuses));
  }, [statuses]);

  const tableColumns = [
    {
      title: columns.device,
      width: 120,
      dataIndex: "device",
      key: "device",
      render: (text) => (
        <span className="pl-3 text-gray-300 text-xs sm:text-sm font-secondary md:pl-5 break-words">
          {text}
        </span>
      ),
    },
    {
      title: columns.loginDate,
      width: 120,
      dataIndex: "loginDate",
      key: "loginDate",
      align: "center",
      render: (text) => (
        <span className="text-gray-300 text-xs sm:text-sm font-secondary whitespace-nowrap">
          {text}
        </span>
      ),
    },
    {
      title: columns.ipAddress,
      width: 100,
      dataIndex: "ipAddress",
      key: "ipAddress",
      align: "center",
      render: (text) => (
        <span className="text-gray-300 text-xs sm:text-sm font-secondary font-mono break-all">
          {text}
        </span>
      ),
    },
    {
      title: columns.lastActivity,
      width: 120,
      dataIndex: "lastActivity",
      key: "lastActivity",
      align: "center",
      render: (text) => (
        <span className="text-gray-300 text-xs sm:text-sm font-secondary whitespace-nowrap">
          {text}
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
            status === statuses.active
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : status === statuses.inactive
              ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {status}
        </span>
      ),
    },
  ];

  // Show loading state while data is being generated
  if (deviceData.length === 0) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 p-4 sm:p-6 md:p-8 w-full max-w-5xl mx-auto font-secondary">
        <div className="flex items-center justify-center h-20 sm:h-24 md:h-32">
          <div className="text-gray-400 text-xs sm:text-sm md:text-base text-center">
            {loading}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 max-w-[340px] md:max-w-5xl">
      <TableCustom
        title={title}
        data={deviceData}
        columns={tableColumns}
        pageSize={5}
        showButton={false}
        showPagination={true}
        showHeader={true}
        // scroll={{ x: 300 }} // enable horizontal scroll for Antd
        containerClassName="" // add mobile padding to main container
      />
    </div>
  );
};

export default DeviceLoginTable;
