"use client";
import TableCustom from "@/components/ui/TableCustom";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Filter controls - moved completely outside to prevent recreation
const FilterControls = ({ filters, setFilters }) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <div className="flex-1">
      <Input
        type="text"
        name="search"
        id="search"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        placeholder="Search users..."
        className="bg-gray-800 rounded-lg border-gray-700 text-white placeholder-gray-400"
      />
    </div>
    <div className="w-full sm:w-48">
      <select
        value={filters.role}
        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
      >
        <option value="all">All Roles</option>
        <option value="user">User</option>
        <option value="support">Support</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  </div>
);

const UserManagement = () => {
  const { user, userRole, hasAdminAccess, isSuperAdminUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    role: "all",
    search: "",
  });

  // Helper function to check if email is super admin
  const isSuperAdminEmail = (email) => {
    const superAdminEmails = [
      "jubayer0504@gmail.com",
      "alan.sangasare10@gmail.com",
    ];
    return superAdminEmails.includes(email);
  };

  // Check admin access only once on mount
  useEffect(() => {
    if (!hasAdminAccess()) {
      router.push("/dashboard");
      return;
    }
  }, []);

  // Fetch users function
  const fetchUsers = async (page = 1, role = "all", search = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(role !== "all" && { role }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      if (data.success) {
        const usersWithKeys = data.data.map((user, index) => ({
          ...user,
          key: user._id || `user-${index}`,
        }));
        setUsers(usersWithKeys);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    if (hasAdminAccess()) {
      const timeoutId = setTimeout(() => {
        fetchUsers(1, filters.role, filters.search);
        setPagination((prev) => ({ ...prev, page: 1 }));
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    }
  }, [filters.role, filters.search]);

  // Fetch when page changes
  useEffect(() => {
    if (hasAdminAccess() && pagination.page > 1) {
      fetchUsers(pagination.page, filters.role, filters.search);
    }
  }, [pagination.page]);

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    try {
      let response = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers(pagination.page, filters.role, filters.search);
      } else {
        console.error("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  // Handle role change
  const handleRoleChange = (userId, newRole) => {
    if (
      confirm(`Are you sure you want to change this user's role to ${newRole}?`)
    ) {
      updateUserRole(userId, newRole);
    }
  };

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
      title: "Role",
      width: 120,
      dataIndex: "role",
      key: "role",
      render: (role, record) => (
        <select
          value={role}
          onChange={(e) => handleRoleChange(record.email, e.target.value)}
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            role === "admin"
              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
              : role === "support"
              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
          }`}
          disabled={!isSuperAdminUser() && isSuperAdminEmail(record.email)}
        >
          <option value="user">User</option>
          <option value="support">Support</option>
          <option value="admin">Admin</option>
        </select>
      ),
    },
    {
      title: "Status",
      width: 100,
      dataIndex: "isActive",
      key: "status",
      render: (isActive) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isActive
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Balance",
      width: 100,
      dataIndex: "balance",
      key: "balance",
      render: (balance) => (
        <span className="text-gray-300 text-sm">${balance}</span>
      ),
    },
    {
      title: "Last Login",
      width: 150,
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
          <h1 className="text-3xl font-bold text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-400">Manage system users and their roles</p>
        </div>

        <FilterControls filters={filters} setFilters={setFilters} />

        <div className="rounded-lg">
          <TableCustom
            title="Users"
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

export default UserManagement;
