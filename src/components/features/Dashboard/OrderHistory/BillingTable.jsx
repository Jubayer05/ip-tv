"use client";
import TableCustom from "@/components/ui/TableCustom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const BillingTable = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ORIGINAL_LOADING = "Loading billing data...";
  const ORIGINAL_ERROR = "Failed to load billing data";
  const ORIGINAL_TITLE = "BILLING";
  const ORIGINAL_COLUMNS = {
    id: "ID",
    customerEmail: "Customer Email",
    price: "Price",
    date: "Date",
    gateway: "Gateway",
    status: "Status",
    action: "Action",
  };
  const ORIGINAL_STATUSES = {
    success: "Success",
    failed: "Failed",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    processing: "Processing",
  };

  const [title, setTitle] = useState(ORIGINAL_TITLE);
  const [columns, setColumns] = useState(ORIGINAL_COLUMNS);
  const [statuses, setStatuses] = useState(ORIGINAL_STATUSES);

  // Fetch billing data from BillGang API
  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/payments/billgang/orders");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.orders) {
        setBillingData(data.orders);
      } else {
        throw new Error(data.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching billing data:", error);
      setError(error.message);
      // Fallback to generated data if API fails
      setBillingData(generateFallbackData());
    } finally {
      setLoading(false);
    }
  };

  // Generate fallback data if API fails
  const generateFallbackData = () => {
    const data = [];
    for (let i = 1; i <= 10; i++) {
      const status =
        Object.values(statuses)[
          Math.floor(Math.random() * Object.values(statuses).length)
        ];
      const price = (Math.random() * 500 + 50).toFixed(2);
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));

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

  useEffect(() => {
    // Fetch data when component mounts
    fetchBillingData();
  }, []);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_LOADING,
        ORIGINAL_ERROR,
        ORIGINAL_TITLE,
        ORIGINAL_COLUMNS.invoice,
        ORIGINAL_COLUMNS.price,
        ORIGINAL_COLUMNS.date,
        ORIGINAL_COLUMNS.status,
        ORIGINAL_STATUSES.success,
        ORIGINAL_STATUSES.failed,
        ORIGINAL_STATUSES.pending,
        ORIGINAL_STATUSES.completed,
        ORIGINAL_STATUSES.cancelled,
        ORIGINAL_STATUSES.processing,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tLoading,
        tError,
        tTitle,
        tInvoice,
        tPrice,
        tDate,
        tStatus,
        tSuccess,
        tFailed,
        tPending,
        tCompleted,
        tCancelled,
        tProcessing,
      ] = translated;

      setTitle(tTitle);
      setColumns({
        invoice: tInvoice,
        price: tPrice,
        date: tDate,
        status: tStatus,
      });
      setStatuses({
        success: tSuccess,
        failed: tFailed,
        pending: tPending,
        completed: tCompleted,
        cancelled: tCancelled,
        processing: tProcessing,
      });
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const tableColumns = [
    {
      title: columns.invoice,
      dataIndex: "invoice",
      key: "invoice",
      render: (text) => (
        <span className="text-gray-300 text-xs sm:text-sm font-secondary pl-1 sm:pl-2 md:pl-5 break-all">
          {text}
        </span>
      ),
    },
    {
      title: columns.customerEmail,
      dataIndex: "customerEmail",
      key: "customerEmail",
      render: (text) => (
        <span className="text-gray-300 text-xs sm:text-sm font-secondary pl-1 sm:pl-2 md:pl-5 break-all">
          {text}
        </span>
      ),
    },
    {
      title: columns.gateway,
      dataIndex: "gateway",
      key: "gateway",
      render: (text) => (
        <span className="text-gray-300 text-xs sm:text-sm font-secondary pl-1 sm:pl-2 md:pl-5 break-all">
          {text}
        </span>
      ),
    },
    {
      title: columns.price,
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (text) => (
        <span className="text-gray-300 text-xs sm:text-sm font-secondary">
          {text}
        </span>
      ),
    },
    {
      title: columns.date,
      dataIndex: "date",
      key: "date",
      align: "center",
      render: (text) => (
        <span className="text-gray-300 text-xs sm:text-sm font-secondary">
          {text}
        </span>
      ),
    },
    {
      title: columns.status,
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        // Map status to appropriate styling
        let statusClass =
          "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";

        if (status === statuses.success || status === statuses.completed) {
          statusClass =
            "bg-green-500/20 text-green-400 border border-green-500/30";
        } else if (
          status === statuses.failed ||
          status === statuses.cancelled
        ) {
          statusClass = "bg-red-500/20 text-red-400 border border-red-500/30";
        } else if (status === statuses.processing) {
          statusClass =
            "bg-blue-500/20 text-blue-400 border border-blue-500/30";
        }

        return (
          <span
            className={`px-2 sm:px-3 md:px-4 py-1 rounded-full text-xs font-medium font-secondary whitespace-nowrap ${statusClass}`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  // Show loading state
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

  // Show error state
  if (error) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 p-4 sm:p-6 md:p-8 w-full max-w-5xl mx-auto font-secondary">
        <div className="flex flex-col items-center justify-center h-20 sm:h-24 md:h-32">
          <div className="text-red-400 text-xs sm:text-sm md:text-base text-center mb-2">
            {ORIGINAL_ERROR}
          </div>
          <div className="text-gray-500 text-xs text-center">{error}</div>
          <button
            onClick={fetchBillingData}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (billingData.length === 0) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 p-4 sm:p-6 md:p-8 w-full max-w-5xl mx-auto font-secondary">
        <div className="flex items-center justify-center h-20 sm:h-24 md:h-32">
          <div className="text-gray-400 text-xs sm:text-sm md:text-base text-center">
            No billing data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6">
      <TableCustom
        title={title}
        data={billingData}
        columns={tableColumns}
        pageSize={5}
        showButton={false}
        showPagination={true}
        showHeader={true}
        className="overflow-x-auto"
      />
    </div>
  );
};

export default BillingTable;
