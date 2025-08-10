"use client";
import TableCustom from "@/components/ui/TableCustom";
import { useEffect, useState } from "react";

const DeviceLoginTable = () => {
  const [deviceData, setDeviceData] = useState([]);

  // Generate dynamic device login data
  const generateDeviceData = () => {
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
    const statuses = ["Active", "Inactive", "Suspended"];
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

  // Generate data only on client side to avoid hydration mismatch
  useEffect(() => {
    setDeviceData(generateDeviceData());
  }, []);

  const columns = [
    {
      title: "Device",
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
      title: "Login Date",
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
      title: "IP Address",
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
      title: "Last Activity",
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
      title: "Status",
      width: 100,
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <span
          className={`px-2 sm:px-3 md:px-4 py-1 rounded-full text-xs font-medium font-secondary whitespace-nowrap ${
            status === "Active"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : status === "Inactive"
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
            Loading device data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 max-w-[340px] md:max-w-5xl">
      <TableCustom
        title="Latest LOGIN"
        data={deviceData}
        columns={columns}
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
