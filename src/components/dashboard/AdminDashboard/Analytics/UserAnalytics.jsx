"use client";
import TableCustom from "@/components/ui/TableCustom";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Filter controls for user analytics
const FilterControls = ({ filters, setFilters }) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <div className="flex-1">
      <Input
        type="text"
        name="search"
        id="search"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        placeholder="Search users by name, email, or country..."
        className="bg-gray-800 rounded-lg border-gray-700 text-white placeholder-gray-400"
      />
    </div>
    <div className="w-full sm:w-48">
      <select
        value={filters.rank}
        onChange={(e) => setFilters({ ...filters, rank: e.target.value })}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
      >
        <option value="all">All Ranks</option>
        <option value="bronze">Bronze</option>
        <option value="silver">Silver</option>
        <option value="gold">Gold</option>
        <option value="platinum">Platinum</option>
        <option value="diamond">Diamond</option>
      </select>
    </div>
    <div className="w-full sm:w-48">
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
      >
        <option value="all">All Status</option>
        <option value="active">Active Users</option>
        <option value="inactive">Inactive Users</option>
        <option value="with_plan">With Active Plan</option>
        <option value="expired_plan">Expired Plan</option>
      </select>
    </div>
  </div>
);

// Analytics summary cards
const AnalyticsSummary = ({ analytics }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-white">
            {analytics.totalUsers || 0}
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Total Balance</p>
          <p className="text-2xl font-bold text-white">
            ${analytics.totalBalance || 0}
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
          <p className="text-gray-400 text-sm">Total Spending</p>
          <p className="text-2xl font-bold text-white">
            ${analytics.totalSpending || 0}
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
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Active Plans</p>
          <p className="text-2xl font-bold text-white">
            {analytics.activePlans || 0}
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

const UserAnalytics = () => {
  const { hasAdminAccess } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    rank: "all",
    status: "all",
    search: "",
  });

  // Check admin access
  useEffect(() => {
    if (!hasAdminAccess()) {
      router.push("/dashboard");
      return;
    }
  }, []);

  // Fetch users analytics
  const fetchUsersAnalytics = async (
    page = 1,
    rank = "all",
    status = "all",
    search = ""
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(rank !== "all" && { rank }),
        ...(status !== "all" && { status }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/analytics/users?${params}`);
      const data = await response.json();

      if (data.success) {
        const usersWithKeys = data.data.map((user, index) => ({
          ...user,
          key: user._id || `user-${index}`,
        }));
        setUsers(usersWithKeys);
        setPagination(data.pagination);
        setAnalytics(data.analytics || {});
      }
    } catch (error) {
      console.error("Error fetching users analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    if (hasAdminAccess()) {
      const timeoutId = setTimeout(() => {
        fetchUsersAnalytics(1, filters.rank, filters.status, filters.search);
        setPagination((prev) => ({ ...prev, page: 1 }));
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    }
  }, [filters.rank, filters.status, filters.search]);

  // Fetch when page changes
  useEffect(() => {
    if (hasAdminAccess() && pagination.page > 1) {
      fetchUsersAnalytics(
        pagination.page,
        filters.rank,
        filters.status,
        filters.search
      );
    }
  }, [pagination.page]);

  // Table columns
  const tableColumns = [
    {
      title: "User",
      width: 200,
      dataIndex: "profile",
      key: "user",
      render: (profile) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {profile?.firstName?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <div className="text-white text-sm font-medium">
              {profile?.firstName} {profile?.lastName}
            </div>
            <div className="text-gray-400 text-xs">
              {profile?.username || "No username"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      width: 200,
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <span className="text-gray-300 text-sm break-all">{email}</span>
      ),
    },
    {
      title: "Country",
      width: 120,
      dataIndex: "profile",
      key: "country",
      render: (profile) => (
        <span className="text-gray-300 text-sm">
          {profile?.country || "Not specified"}
        </span>
      ),
    },
    {
      title: "Balance",
      width: 100,
      dataIndex: "balance",
      key: "balance",
      render: (balance) => (
        <span className="text-green-400 text-sm font-medium">${balance}</span>
      ),
    },
    {
      title: "Total Spent",
      width: 120,
      dataIndex: "rank",
      key: "totalSpent",
      render: (rank) => (
        <span className="text-yellow-400 text-sm font-medium">
          ${rank?.totalSpent || 0}
        </span>
      ),
    },
    {
      title: "Rank",
      width: 100,
      dataIndex: "rank",
      key: "rank",
      render: (rank) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            rank?.level === "diamond"
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
              : rank?.level === "platinum"
              ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              : rank?.level === "gold"
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : rank?.level === "silver"
              ? "bg-gray-400/20 text-gray-300 border border-gray-400/30"
              : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
          }`}
        >
          {rank?.level?.charAt(0).toUpperCase() + rank?.level?.slice(1) ||
            "Bronze"}
        </span>
      ),
    },
    {
      title: "Discount",
      width: 100,
      dataIndex: "rank",
      key: "discount",
      render: (rank) => (
        <span className="text-blue-400 text-sm font-medium">
          {rank?.discountPercentage || 0}%
        </span>
      ),
    },
    {
      title: "Current Plan",
      width: 150,
      dataIndex: "currentPlan",
      key: "currentPlan",
      render: (currentPlan) => (
        <div className="text-sm">
          {currentPlan?.isActive ? (
            <div>
              <div className="text-white font-medium">
                {currentPlan.planName}
              </div>
              <div className="text-gray-400 text-xs">
                {currentPlan.expireDate
                  ? `Expires: ${new Date(
                      currentPlan.expireDate
                    ).toLocaleDateString()}`
                  : "No expiry date"}
              </div>
            </div>
          ) : (
            <span className="text-gray-500">No active plan</span>
          )}
        </div>
      ),
    },
    {
      title: "Referral Earnings",
      width: 120,
      dataIndex: "referral",
      key: "referralEarnings",
      render: (referral) => (
        <span className="text-green-400 text-sm font-medium">
          ${referral?.earnings || 0}
        </span>
      ),
    },
    {
      title: "Last Login",
      width: 120,
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (lastLogin) => (
        <span className="text-gray-400 text-sm">
          {lastLogin
            ? new Date(lastLogin).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Never"}
        </span>
      ),
    },
    {
      title: "Joined",
      width: 120,
      dataIndex: "createdAt",
      key: "joined",
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
          <h1 className="text-3xl font-bold text-white mb-2">User Analytics</h1>
          <p className="text-gray-400">
            Comprehensive user data and spending analytics
          </p>
        </div>

        <AnalyticsSummary analytics={analytics} />

        <FilterControls filters={filters} setFilters={setFilters} />

        <div className="rounded-lg">
          <TableCustom
            title="User Analytics"
            data={users}
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

export default UserAnalytics;
