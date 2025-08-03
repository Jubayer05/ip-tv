"use client";
import TableCustom from "@/components/ui/TableCustom";
import { useEffect, useState } from "react";

const BillingTable = () => {
  const [billingData, setBillingData] = useState([]);

  // Generate dynamic billing data
  const generateBillingData = () => {
    const statuses = ["Success", "Failed", "Pending"];
    const data = [];

    for (let i = 1; i <= 15; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const price = (Math.random() * 500 + 50).toFixed(2);
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365)); // Random date within last year

      data.push({
        key: i.toString(),
        invoice: `#INVC${String(i).padStart(6, "0")}`,
        price: `$${price}`,
        date: date.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        status: status,
      });
    }

    return data;
  };

  // Generate data only on client side to avoid hydration mismatch
  useEffect(() => {
    setBillingData(generateBillingData());
  }, []);

  const columns = [
    {
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      render: (text) => (
        <span className="text-gray-300 text-sm font-secondary pl-5">
          {text}
        </span>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (text) => (
        <span className="text-gray-300 text-sm font-secondary">{text}</span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      align: "center",
      render: (text) => (
        <span className="text-gray-300 text-sm font-secondary">{text}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <span
          className={`px-4 py-1 rounded-full text-xs font-medium font-secondary ${
            status === "Success"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : status === "Failed"
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          }`}
        >
          {status}
        </span>
      ),
    },
  ];

  // Show loading state while data is being generated
  if (billingData.length === 0) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-6 p-8 w-full max-w-5xl mx-auto font-secondary">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400">Loading billing data...</div>
        </div>
      </div>
    );
  }

  return (
    <TableCustom
      title="BILLING"
      data={billingData}
      columns={columns}
      pageSize={5}
      showButton={false}
      showPagination={true}
      showHeader={true}
    />
  );
};

export default BillingTable;
