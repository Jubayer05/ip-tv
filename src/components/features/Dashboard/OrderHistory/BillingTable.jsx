"use client";
import TableCustom from "@/components/ui/TableCustom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const BillingTable = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user, hasAdminAccess, getAuthToken } = useAuth();
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);

  const ORIGINAL_LOADING = "Loading billing data...";
  const ORIGINAL_ERROR = "Failed to load billing data";
  const ORIGINAL_TITLE = "ORDER HISTORY";
  const ORIGINAL_COLUMNS = {
    orderNumber: "Order Number",
    customerName: "Customer Name",
    customerEmail: "Customer Email",
    userType: "User Type",
    plan: "Plan",
    devices: "Devices",
    quantity: "Quantity",
    totalAmount: "Total Amount",
    orderStatus: "Order Status",
    date: "Order Date",
  };
  const ORIGINAL_STATUSES = {
    pending: "Pending",
    completed: "Completed",
    failed: "Failed",
    refunded: "Refunded",
    cancelled: "Cancelled",
  };

  // Add filter state
  const [userFilter, setUserFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
    pages: 0,
  });

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [title, setTitle] = useState(ORIGINAL_TITLE);
  const [columns, setColumns] = useState(ORIGINAL_COLUMNS);

  // Handle search input changes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchOrderData(1, debouncedSearchTerm, status);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    // Keep focus on the input after clearing
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  // Effect to trigger search when debounced term changes
  useEffect(() => {
    if (user?.email) {
      fetchOrderData(1, debouncedSearchTerm, statusFilter);
    }
  }, [debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch order data from Order model
  const fetchOrderData = async (
    page = 1,
    searchTerm = "",
    statusFilter = "all"
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.email) {
        throw new Error("User not authenticated");
      }

      const token = await getAuthToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const isAdmin = hasAdminAccess();

      // Build query parameters
      const params = new URLSearchParams({
        email: user.email,
        isAdmin: isAdmin.toString(),
        page: page.toString(),
        limit: "50",
      });

      // Add search and status filters for admin
      if (isAdmin) {
        if (searchTerm) {
          params.append("search", searchTerm);
        }
        if (statusFilter && statusFilter !== "all") {
          params.append("status", statusFilter);
        }
      }

      const response = await fetch(`/api/orders/user?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.orders) {
        // Transform the data to match table structure
        const transformedData = data.orders.map((order, index) => {
          const product = order.products?.[0] || {};
          const customerName =
            order.contactInfo?.fullName ||
            (order.userId?.profile
              ? `${order.userId.profile.firstName || ""} ${
                  order.userId.profile.lastName || ""
                }`.trim() ||
                order.userId.profile.username ||
                "Guest User"
              : "Guest User");

          return {
            key: order._id || index.toString(),
            orderNumber: order.orderNumber || `#${index + 1}`,
            orderId: order._id,
            customerName: customerName,
            customerEmail:
              order.contactInfo?.email || order.guestEmail || "N/A",
            userType: order.userId ? "Registered" : "Guest",
            plan: product.duration ? `${product.duration} Months` : "Plan",
            devices: product.devicesAllowed || 1,
            quantity: product.quantity || 1,
            totalAmount: `$${(order.totalAmount || 0).toFixed(2)}`,
            paymentMethod: order.paymentMethod || "N/A",
            paymentStatus: order.paymentStatus || "Unknown",
            orderDate: new Date(order.createdAt).toLocaleDateString(),
            createdAt: order.createdAt,
            lineType: product.lineType || 0,
            adultChannels: product.adultChannels || false,
            iptvCredentials: order.iptvCredentials || [],
          };
        });

        setBillingData(transformedData);

        // Set pagination info if available (for admin)
        if (data.pagination) {
          setPagination({
            current: data.pagination.page,
            pageSize: data.pagination.limit,
            total: data.pagination.total,
            pages: data.pagination.pages,
          });
        }
      } else {
        throw new Error(data.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message);
      setBillingData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data when component mounts or user changes
    if (user?.email) {
      fetchOrderData(1, "", "all");
    }
  }, [user?.email, hasAdminAccess]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_LOADING,
        ORIGINAL_ERROR,
        ORIGINAL_TITLE,
        ORIGINAL_COLUMNS.orderNumber,
        ORIGINAL_COLUMNS.customerName,
        ORIGINAL_COLUMNS.customerEmail,
        ORIGINAL_COLUMNS.plan,
        ORIGINAL_COLUMNS.devices,
        ORIGINAL_COLUMNS.quantity,
        ORIGINAL_COLUMNS.totalAmount,
        ORIGINAL_COLUMNS.orderStatus,
        ORIGINAL_COLUMNS.date,
        ORIGINAL_COLUMNS.userType,
        ORIGINAL_STATUSES.pending,
        ORIGINAL_STATUSES.completed,
        ORIGINAL_STATUSES.failed,
        ORIGINAL_STATUSES.refunded,
        ORIGINAL_STATUSES.cancelled,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tLoading,
        tError,
        tTitle,
        tOrderNumber,
        tCustomerName,
        tCustomerEmail,
        tPlan,
        tDevices,
        tQuantity,
        tTotalAmount,
        tOrderStatus,
        tDate,
        tUserType,
        tPending,
        tCompleted,
        tFailed,
        tRefunded,
        tCancelled,
      ] = translated;

      // Update localized strings
      // Keep ORIGINAL_* constants unchanged; only update state
      setTitle(tTitle);
      setColumns({
        orderNumber: tOrderNumber,
        customerName: tCustomerName,
        customerEmail: tCustomerEmail,
        userType: tUserType,
        plan: tPlan,
        devices: tDevices,
        quantity: tQuantity,
        totalAmount: tTotalAmount,
        orderStatus: tOrderStatus,
        date: tDate,
      });
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  // Build table columns based on user role
  const buildTableColumns = () => {
    const baseColumns = [
      {
        title: columns.orderNumber,
        dataIndex: "orderNumber",
        key: "orderNumber",
        width: "120px",
        render: (text) => (
          <span className="text-gray-300 text-xs sm:text-sm font-secondary pl-1 sm:pl-2 md:pl-5 break-all">
            {text}
          </span>
        ),
      },
    ];

    // Add customer columns for admin users
    if (hasAdminAccess()) {
      baseColumns.push(
        {
          title: columns.customerName,
          dataIndex: "customerName",
          width: "150px",
          align: "center",
          key: "customerName",
          render: (text) => (
            <span className="text-gray-300 text-xs sm:text-sm font-secondary break-all">
              {text}
            </span>
          ),
        },
        {
          title: columns.customerEmail,
          dataIndex: "customerEmail",
          width: "200px",
          key: "customerEmail",
          render: (text) => (
            <span className="text-gray-300 text-xs sm:text-sm font-secondary break-all">
              {text}
            </span>
          ),
        },
        {
          title: columns.userType,
          dataIndex: "userType",
          key: "userType",
          align: "center",
          width: "100px",
          render: (text) => {
            const isGuest = text === "Guest";
            const statusClass = isGuest
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              : "bg-blue-500/20 text-blue-400 border border-blue-500/30";

            return (
              <span
                className={`px-2 sm:px-3 md:px-4 py-1 rounded-full text-xs font-medium font-secondary whitespace-nowrap ${statusClass}`}
              >
                {text}
              </span>
            );
          },
        }
      );
    }

    // Add remaining columns
    baseColumns.push(
      {
        title: columns.plan,
        dataIndex: "plan",
        key: "plan",
        align: "center",
        width: "120px",
        render: (text) => (
          <span className="text-gray-300 text-xs sm:text-sm font-secondary pl-1 sm:pl-2 md:pl-5 break-all">
            {text}
          </span>
        ),
      },
      {
        title: columns.devices,
        dataIndex: "devices",
        key: "devices",
        align: "center",
        width: "80px",
        render: (text) => (
          <span className="text-gray-300 text-xs sm:text-sm font-secondary">
            {text}
          </span>
        ),
      },
      {
        title: columns.quantity,
        dataIndex: "quantity",
        key: "quantity",
        align: "center",
        width: "80px",
        render: (text) => (
          <span className="text-gray-300 text-xs sm:text-sm font-secondary">
            {text}
          </span>
        ),
      },
      {
        title: columns.totalAmount,
        dataIndex: "totalAmount",
        key: "totalAmount",
        align: "center",
        width: "120px",
        render: (text) => (
          <span className="text-gray-300 text-xs sm:text-sm font-secondary">
            {text}
          </span>
        ),
      },
      {
        title: columns.orderStatus,
        dataIndex: "paymentStatus",
        key: "orderStatus",
        align: "center",
        width: "120px",
        render: (status) => {
          let statusClass = "";
          let displayText = status;

          switch (status) {
            case "completed":
            case "success":
              statusClass =
                "bg-green-500/20 text-green-400 border border-green-500/30";
              displayText = "Completed";
              break;
            case "pending":
              statusClass =
                "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
              displayText = "Pending";
              break;
            case "new":
              statusClass =
                "bg-blue-500/20 text-blue-400 border border-blue-500/30";
              displayText = "New";
              break;
            case "failed":
            case "error":
            case "cancelled":
              statusClass =
                "bg-red-500/20 text-red-400 border border-red-500/30";
              displayText = status === "cancelled" ? "Cancelled" : "Failed";
              break;
            case "expired":
              statusClass =
                "bg-gray-500/20 text-gray-400 border border-gray-500/30";
              displayText = "Expired";
              break;
            case "refunded":
              statusClass =
                "bg-purple-500/20 text-purple-400 border border-purple-500/30";
              displayText = "Refunded";
              break;
            default:
              statusClass =
                "bg-gray-500/20 text-gray-400 border border-gray-500/30";
              displayText = status || "Unknown";
          }

          return (
            <span
              className={`px-2 sm:px-3 md:px-4 py-1 rounded-full text-xs font-medium font-secondary whitespace-nowrap ${statusClass}`}
            >
              {displayText}
            </span>
          );
        },
      },
      {
        title: columns.date,
        dataIndex: "orderDate",
        key: "date",
        align: "center",
        width: "120px",
        render: (text) => (
          <span className="text-gray-300 text-xs sm:text-sm font-secondary">
            {text}
          </span>
        ),
      }
    );

    return baseColumns;
  };

  // Filter data based on user type and search term
  const filteredData = billingData.filter((order) => {
    // Apply user type filter
    let userTypeMatch = true;
    if (userFilter === "registered")
      userTypeMatch = order.userType === "Registered";
    if (userFilter === "guest") userTypeMatch = order.userType === "Guest";

    // Apply search filter
    let searchMatch = true;
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      searchMatch =
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.orderId?.toString().toLowerCase().includes(searchLower) ||
        order.customerEmail?.toLowerCase().includes(searchLower);
    }

    return userTypeMatch && searchMatch;
  });

  return (
    <div className="mt-4 sm:mt-6 font-secondary">
      {/* Search Box */}
      <div className="mb-6 flex justify-start pt-3">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by Order Number, Order ID, or Email..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#0c171c] border border-white/15 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Info */}
      {debouncedSearchTerm && (
        <div className="mb-4 text-center">
          <p className="text-gray-400 text-sm">
            Showing {filteredData.length} of {billingData.length} orders
            {filteredData.length !== billingData.length && (
              <span className="text-cyan-400">
                {" "}
                for "{debouncedSearchTerm}"
              </span>
            )}
          </p>
        </div>
      )}

      {/* Filter Buttons */}
      {hasAdminAccess() && (
        <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
          <button
            onClick={() => handleStatusFilter("all")}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-cyan-400 text-black"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            All Statuses
          </button>
          <button
            onClick={() => handleStatusFilter("completed")}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "completed"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => handleStatusFilter("pending")}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleStatusFilter("failed")}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "failed"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Failed
          </button>
          <button
            onClick={() => handleStatusFilter("cancelled")}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "cancelled"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Cancelled
          </button>
          <button
            onClick={() => handleStatusFilter("refunded")}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "refunded"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Refunded
          </button>
        </div>
      )}

      {/* Table - keep header visible; swap only the table area */}
      {error ? (
        <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 w-full max-w-5xl mx-auto font-secondary">
          <div className="flex flex-col items-center justify-center h-20 sm:h-24 md:h-32">
            <div className="text-red-400 text-xs sm:text-sm md:text-base text-center mb-2">
              {ORIGINAL_ERROR}
            </div>
            <div className="text-gray-500 text-xs text-center">{error}</div>
            <button
              onClick={() =>
                fetchOrderData(1, debouncedSearchTerm, statusFilter)
              }
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 w-full max-w-5xl mx-auto font-secondary">
          <div className="flex items-center justify-center h-20 sm:h-24 md:h-32">
            <div className="text-gray-400 text-xs sm:text-sm md:text-base text-center">
              {ORIGINAL_LOADING}
            </div>
          </div>
        </div>
      ) : billingData.length === 0 ? (
        <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 w-full max-w-5xl mx-auto font-secondary">
          <div className="flex items-center justify-center h-20 sm:h-24 md:h-32">
            <div className="text-gray-400 text-xs sm:text-sm md:text-base text-center">
              {hasAdminAccess()
                ? "No orders found in the system"
                : "No orders found"}
            </div>
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 w-full max-w-5xl mx-auto font-secondary">
          <div className="flex items-center justify-center h-20 sm:h-24 md:h-32">
            <div className="text-gray-400 text-xs sm:text-sm md:text-base text-center">
              No orders match your search criteria
            </div>
          </div>
        </div>
      ) : (
        <TableCustom
          title={`${title}${hasAdminAccess() ? " - All Orders" : ""}`}
          data={filteredData}
          columns={buildTableColumns()}
          pageSize={10}
          showButton={false}
          showHeader={true}
          className="overflow-x-auto"
          rowKey="key"
        />
      )}
    </div>
  );
};

export default BillingTable;
