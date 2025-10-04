"use client";
import TableCustom from "@/components/ui/TableCustom";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Filter controls for system analytics
const FilterControls = ({ filters, setFilters, texts }) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <div className="flex-1">
      <Input
        type="text"
        name="search"
        id="search"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        placeholder={texts.searchPlaceholder}
        className="bg-gray-800 rounded-lg border-gray-700 text-white placeholder-gray-400"
      />
    </div>
    <div className="w-full sm:w-48">
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
      >
        <option value="all">{texts.allStatus}</option>
        <option value="completed">{texts.completed}</option>
        <option value="pending">{texts.pending}</option>
        <option value="cancelled">{texts.cancelled}</option>
      </select>
    </div>
    <div className="w-full sm:w-48">
      <select
        value={filters.paymentMethod}
        onChange={(e) =>
          setFilters({ ...filters, paymentMethod: e.target.value })
        }
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
      >
        <option value="all">{texts.allPaymentMethods}</option>
        <option value="stripe">{texts.stripe}</option>
        <option value="plisio">{texts.plisio}</option>
        <option value="hoodpay">{texts.hoodpay}</option>
        <option value="nowpayments">{texts.nowpayments}</option>
        <option value="changenow">{texts.changenow}</option>
        <option value="cryptomus">{texts.cryptomus}</option>
        <option value="manual">{texts.manual}</option>
      </select>
    </div>
  </div>
);

// Analytics summary cards
const AnalyticsSummary = ({ analytics, texts }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{texts.totalOrders}</p>
          <p className="text-2xl font-bold text-white">
            {analytics.totalOrders || 0}
          </p>
        </div>
        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{texts.totalRevenue}</p>
          <p className="text-2xl font-bold text-white">
            ${analytics.totalRevenue?.toFixed(2) || 0}
          </p>
        </div>
        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{texts.mostPopularPlan}</p>
          <p className="text-lg font-bold text-white">
            {analytics.mostPopularPlan || "N/A"}
          </p>
        </div>
        <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{texts.avgOrderValue}</p>
          <p className="text-2xl font-bold text-white">
            ${analytics.averageOrderValue?.toFixed(2) || 0}
          </p>
        </div>
        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

// Popular plans chart component
const PopularPlansChart = ({ popularPlans, texts }) => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
    <h3 className="text-xl font-bold text-white mb-4">
      {texts.mostPopularPlans}
    </h3>
    <div className="space-y-4">
      {popularPlans?.slice(0, 5).map((plan, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-sm font-bold">
                #{index + 1}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{plan.planName}</p>
              <p className="text-gray-400 text-sm">
                {plan.duration} {texts.months} • {plan.devicesAllowed}{" "}
                {texts.devices}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-bold">
              {plan.totalOrders} {texts.orders}
            </p>
            <p className="text-green-400 text-sm">${plan.totalRevenue}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Device analytics chart
const DeviceAnalytics = ({ deviceStats, texts }) => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
    <h3 className="text-xl font-bold text-white mb-4">
      {texts.deviceDistribution}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {deviceStats?.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-white font-bold text-lg">
            {stat.deviceCount} {texts.device} {stat.deviceCount !== 1 ? "" : ""}
          </p>
          <p className="text-gray-400 text-sm">
            {stat.percentage}% {texts.ofOrders}
          </p>
          <p className="text-green-400 text-sm">
            {stat.totalOrders} {texts.orders}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const SystemAnalytics = () => {
  const { hasAdminAccess } = useAuth();
  const { language, translate, isLanguageLoaded } = useLanguage();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [popularPlans, setPopularPlans] = useState([]);
  const [deviceStats, setDeviceStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    status: "all",
    paymentMethod: "all",
    search: "",
  });

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "System Analytics",
    subtitle: "Plan purchases, revenue tracking, and device analytics",
    searchPlaceholder: "Search by plan name, order number, or customer...",
    allStatus: "All Status",
    completed: "Completed",
    pending: "Pending",
    cancelled: "Cancelled",
    allPaymentMethods: "All Payment Methods",
    stripe: "Stripe",
    plisio: "Plisio",
    hoodpay: "HoodPay",
    nowpayments: "NOWPayments",
    changenow: "ChangeNOW",
    cryptomus: "Cryptomus",
    manual: "Manual",
    totalOrders: "Total Orders",
    totalRevenue: "Total Revenue",
    mostPopularPlan: "Most Popular Plan",
    avgOrderValue: "Avg Order Value",
    mostPopularPlans: "Most Popular Plans",
    months: "months",
    devices: "devices",
    orders: "orders",
    deviceDistribution: "Device Distribution",
    device: "Device",
    ofOrders: "of orders",
    orderNumber: "Order #",
    customer: "Customer",
    planDetails: "Plan Details",
    amount: "Amount",
    paymentMethod: "Payment Method",
    status: "Status",
    orderDate: "Order Date",
    unknownPlan: "Unknown Plan",
    adultChannels: "Adult Channels",
    discount: "discount",
    orderAnalytics: "Order Analytics",
    unknown: "Unknown",
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
  }, []);

  // Fetch system analytics
  const fetchSystemAnalytics = async (
    page = 1,
    status = "all",
    paymentMethod = "all",
    search = ""
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(status !== "all" && { status }),
        ...(paymentMethod !== "all" && { paymentMethod }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/analytics/system?${params}`);
      const data = await response.json();

      if (data.success) {
        const ordersWithKeys = data.data.map((order, index) => ({
          ...order,
          key: order._id || `order-${index}`,
        }));
        setOrders(ordersWithKeys);
        setPagination(data.pagination);
        setAnalytics(data.analytics || {});
        setPopularPlans(data.popularPlans || []);
        setDeviceStats(data.deviceStats || []);
      }
    } catch (error) {
      console.error("Error fetching system analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    if (hasAdminAccess()) {
      const timeoutId = setTimeout(() => {
        fetchSystemAnalytics(
          1,
          filters.status,
          filters.paymentMethod,
          filters.search
        );
        setPagination((prev) => ({ ...prev, page: 1 }));
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    }
  }, [filters.status, filters.paymentMethod, filters.search]);

  // Fetch when page changes
  useEffect(() => {
    if (hasAdminAccess() && pagination.page > 1) {
      fetchSystemAnalytics(
        pagination.page,
        filters.status,
        filters.paymentMethod,
        filters.search
      );
    }
  }, [pagination.page]);

  // Table columns
  const tableColumns = [
    {
      title: texts.orderNumber,
      width: 150,
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (orderNumber) => (
        <span className="text-blue-400 text-sm font-mono">{orderNumber}</span>
      ),
    },
    {
      title: texts.customer,
      width: 200,
      dataIndex: "contactInfo",
      key: "customer",
      render: (contactInfo) => (
        <div>
          <div className="text-white text-sm font-medium">
            {contactInfo?.fullName}
          </div>
          <div className="text-gray-400 text-xs">{contactInfo?.email}</div>
        </div>
      ),
    },
    {
      title: texts.planDetails,
      width: 250,
      dataIndex: "products",
      key: "planDetails",
      render: (products) => (
        <div className="space-y-1">
          {products?.map((product, index) => (
            <div key={index} className="text-sm">
              <div className="text-white font-medium">
                {product.planName || texts.unknownPlan}
              </div>
              <div className="text-gray-400 text-xs">
                {product.duration} {texts.months} • {product.devicesAllowed}{" "}
                {texts.devices}
                {product.adultChannels && ` • ${texts.adultChannels}`}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: texts.amount,
      width: 120,
      dataIndex: "totalAmount",
      key: "amount",
      render: (totalAmount, record) => (
        <div className="text-right">
          <div className="text-white font-bold">${totalAmount}</div>
          {record.discountAmount > 0 && (
            <div className="text-green-400 text-xs">
              -${record.discountAmount} {texts.discount}
            </div>
          )}
        </div>
      ),
    },
    {
      title: texts.paymentMethod,
      width: 120,
      dataIndex: "paymentGateway",
      key: "paymentMethod",
      render: (paymentGateway, record) => (
        <div className="text-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              paymentGateway === "stripe"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : paymentGateway === "plisio"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : paymentGateway === "hoodpay"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : paymentGateway === "nowpayments"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : paymentGateway === "changenow"
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : paymentGateway === "cryptomus"
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
            }`}
          >
            {paymentGateway?.toUpperCase() || texts.manual}
          </span>
        </div>
      ),
    },
    {
      title: texts.status,
      width: 100,
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === "completed"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : status === "pending"
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {status?.charAt(0).toUpperCase() + status?.slice(1) || texts.unknown}
        </span>
      ),
    },
    {
      title: texts.orderDate,
      width: 120,
      dataIndex: "createdAt",
      key: "orderDate",
      render: (createdAt) => (
        <span className="text-gray-400 text-sm">
          {new Date(createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  if (!hasAdminAccess()) {
    return null;
  }

  return (
    <div className="min-h-screen border-1 border-gray-700 rounded-lg p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {texts.heading}
          </h1>
          <p className="text-gray-400">{texts.subtitle}</p>
        </div>

        <AnalyticsSummary analytics={analytics} texts={texts} />

        <PopularPlansChart popularPlans={popularPlans} texts={texts} />

        <DeviceAnalytics deviceStats={deviceStats} texts={texts} />

        <FilterControls
          filters={filters}
          setFilters={setFilters}
          texts={texts}
        />

        <div className="rounded-lg">
          <TableCustom
            title={texts.orderAnalytics}
            data={orders}
            columns={tableColumns}
            pageSize={pagination.limit}
            showButton={false}
            showPagination={true}
            showHeader={true}
            loading={loading}
            pagination={{
              current: pagination.page,
              total: pagination.total,
              pageSize: pagination.limit,
              onChange: (page) => setPagination({ ...pagination, page }),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;
