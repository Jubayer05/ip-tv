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
      dataIndex: "device",
      key: "device",
      render: (text) => (
        <span className="text-gray-300 text-sm font-secondary pl-5">
          {text}
        </span>
      ),
    },
    {
      title: "Login Date",
      dataIndex: "loginDate",
      key: "loginDate",
      render: (text) => (
        <span className="text-gray-300 text-sm font-secondary">{text}</span>
      ),
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      render: (text) => (
        <span className="text-gray-300 text-sm font-secondary font-mono">
          {text}
        </span>
      ),
    },
    {
      title: "Last Activity",
      dataIndex: "lastActivity",
      key: "lastActivity",
      align: "center",
      render: (text) => (
        <span className="text-gray-300 text-sm font-secondary">{text}</span>
      ),
    },
  ];

  // Show loading state while data is being generated
  if (deviceData.length === 0) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-6 p-8 w-full max-w-5xl mx-auto font-secondary">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400">Loading device data...</div>
        </div>
      </div>
    );
  }

  return (
    <TableCustom
      title="DEVICE LOGIN"
      data={deviceData}
      columns={columns}
      pageSize={5}
      showButton={false}
      showPagination={true}
      showHeader={true}
    />
  );
};

export default DeviceLoginTable;
