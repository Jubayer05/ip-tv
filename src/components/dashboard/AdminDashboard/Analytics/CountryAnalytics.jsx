"use client";
import TableCustom from "@/components/ui/TableCustom";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Filter controls for country analytics
const FilterControls = ({ filters, setFilters }) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <div className="flex-1">
      <Input
        type="text"
        name="search"
        id="search"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        placeholder="Search countries..."
        className="bg-gray-800 rounded-lg border-gray-700 text-white placeholder-gray-400"
      />
    </div>
    <div className="w-full sm:w-48">
      <select
        value={filters.sortBy}
        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
      >
        <option value="users">Sort by Users</option>
        <option value="alphabetical">Sort Alphabetically</option>
      </select>
    </div>
    <div className="w-full sm:w-48">
      <select
        value={filters.chartType}
        onChange={(e) => setFilters({ ...filters, chartType: e.target.value })}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
      >
        <option value="bar">Bar Chart</option>
        <option value="pie">Pie Chart</option>
      </select>
    </div>
  </div>
);

// Analytics summary cards
const AnalyticsSummary = ({ analytics }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Total Countries</p>
          <p className="text-2xl font-bold text-white">
            {analytics.totalCountries || 0}
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
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-white">
            {analytics.totalUsers || 0}
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Top Country</p>
          <p className="text-lg font-bold text-white">
            {analytics.topCountry || "N/A"}
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
  </div>
);

// Country chart component
const CountryChart = ({ countryData, chartType }) => {
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#EC4899",
    "#6366F1",
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
          <p className="text-white font-medium">{`${label}`}</p>
          <p className="text-blue-400">Users: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (chartType === "pie") {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">
          User Distribution by Country
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={countryData.slice(0, 10)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="users"
              >
                {countryData.slice(0, 10).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
      <h3 className="text-xl font-bold text-white mb-4">Users by Country</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={countryData.slice(0, 15)}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="country"
              stroke="#9CA3AF"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="users" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CountryAnalytics = () => {
  const { hasAdminAccess } = useAuth();
  const router = useRouter();
  const [countryData, setCountryData] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    sortBy: "users",
    chartType: "bar",
    search: "",
  });

  // Check admin access
  useEffect(() => {
    if (!hasAdminAccess()) {
      router.push("/dashboard");
      return;
    }
  }, []);

  // Fetch country analytics
  const fetchCountryAnalytics = async (
    page = 1,
    sortBy = "users",
    search = ""
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        ...(search && { search }),
      });

      const response = await fetch(`/api/analytics/countries?${params}`);
      const data = await response.json();

      if (data.success) {
        const countriesWithKeys = data.data.map((country, index) => ({
          ...country,
          key: country._id || `country-${index}`,
        }));
        setCountryData(countriesWithKeys);
        setPagination(data.pagination);
        setAnalytics(data.analytics || {});
      }
    } catch (error) {
      console.error("Error fetching country analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    if (hasAdminAccess()) {
      const timeoutId = setTimeout(() => {
        fetchCountryAnalytics(1, filters.sortBy, filters.search);
        setPagination((prev) => ({ ...prev, page: 1 }));
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    }
  }, [filters.sortBy, filters.search]);

  // Fetch when page changes
  useEffect(() => {
    if (hasAdminAccess() && pagination.page > 1) {
      fetchCountryAnalytics(pagination.page, filters.sortBy, filters.search);
    }
  }, [pagination.page]);

  // Table columns
  const tableColumns = [
    {
      title: "Rank",
      width: 80,
      dataIndex: "rank",
      key: "rank",
      render: (rank) => (
        <div className="flex items-center justify-center">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              rank === 1
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : rank === 2
                ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                : rank === 3
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
            }`}
          >
            {rank}
          </span>
        </div>
      ),
    },
    {
      title: "Country",
      width: 200,
      dataIndex: "country",
      key: "country",
      render: (country) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {country?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <div className="text-white text-sm font-medium">
              {country || "Unknown"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Total Users",
      width: 120,
      dataIndex: "users",
      key: "users",
      render: (users) => (
        <span className="text-blue-400 text-sm font-bold">{users}</span>
      ),
    },
    {
      title: "Market Share",
      width: 200,
      dataIndex: "marketShare",
      key: "marketShare",
      render: (marketShare) => (
        <div className="flex items-center space-x-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${marketShare}%` }}
            ></div>
          </div>
          <span className="text-gray-400 text-xs">
            {marketShare?.toFixed(1)}%
          </span>
        </div>
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
            Country Analytics
          </h1>
          <p className="text-gray-400">User distribution by country</p>
        </div>

        <AnalyticsSummary analytics={analytics} />

        <CountryChart countryData={countryData} chartType={filters.chartType} />

        <FilterControls filters={filters} setFilters={setFilters} />

        <div className="rounded-lg">
          <TableCustom
            title="Country Analytics"
            data={countryData}
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

export default CountryAnalytics;
