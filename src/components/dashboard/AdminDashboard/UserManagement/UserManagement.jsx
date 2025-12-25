"use client";
import TableCustom from "@/components/ui/TableCustom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, UserCheck, UserX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react"; // Add useCallback and useMemo
import Swal from "sweetalert2";

const FilterControls = ({ filters, setFilters, texts }) => (
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
    <div className="flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
        <input
          type="text"
          placeholder={texts.searchUsers}
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 bg-black border border-[#212121] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors text-xs sm:text-sm"
        />
      </div>
    </div>
    <div className="flex gap-2">
      <select
        value={filters.role}
        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        className="px-3 sm:px-4 py-2 bg-black border border-[#212121] rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors text-xs sm:text-sm"
      >
        <option value="all">{texts.allUsers}</option>
        <option value="user">{texts.regularUsers}</option>
        <option value="admin">{texts.adminUsers}</option>
      </select>
    </div>
  </div>
);

const UserManagement = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user: currentUser, isSuperAdminUser, getAuthToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [superAdminEmails, setSuperAdminEmails] = useState([]); // Add state for super admin emails
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
  });

  const ORIGINAL_TEXTS = {
    heading: "User Management",
    searchUsers: "Search users by name or email...",
    allUsers: "All Users",
    regularUsers: "Customer", // Changed from "Regular Users"
    adminUsers: "Admin", // Changed from "Admin Users"
    owner: "Owner",
    customer: "Customer", // Add separate customer text
    admin: "Admin", // Add separate admin text
    user: "User",
    email: "Email",
    role: "Role",
    status: "Status",
    joinedDate: "Joined Date",
    actions: "Actions",
    makeAdmin: "Make Admin",
    removeAdmin: "Remove Admin",
    previous: "Previous",
    next: "Next",
    loading: "Loading...",
    noUsersFound: "No users found",
    makeUserAdmin: "Make User Admin",
    removeUserAdmin: "Remove User Admin",
    areYouSureMakeAdmin: "Are you sure you want to make this user an admin?",
    areYouSureRemoveAdmin:
      "Are you sure you want to remove admin privileges from this user?",
    yesMakeAdmin: "Yes, make admin",
    yesRemoveAdmin: "Yes, remove admin",
    cancel: "Cancel",
    success: "Success",
    userRoleUpdated: "User role updated successfully",
    error: "Error",
    failedToUpdateRole: "Failed to update user role",
    active: "Active",
    inactive: "Inactive",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = Object.values(ORIGINAL_TEXTS);
      const translated = await translate(items);
      if (!isMounted) return;

      const translatedTexts = {};
      Object.keys(ORIGINAL_TEXTS).forEach((key, index) => {
        translatedTexts[key] = translated[index];
      });
      setTexts(translatedTexts);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  // Fetch super admin emails from API
  useEffect(() => {
    const fetchSuperAdminEmails = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          const response = await fetch("/api/admin/super-admins", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setSuperAdminEmails(data.emails || []);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch super admin emails:", error);
        setSuperAdminEmails([]);
      }
    };

    fetchSuperAdminEmails();
  }, [getAuthToken]);

  // Check if email is super admin using fetched emails
  const isSuperAdminEmail = (email) => {
    if (!email || superAdminEmails.length === 0) return false;
    return superAdminEmails.includes(email.toLowerCase().trim());
  };

  // Check if current user can manage roles (only super admins)
  const canManageRoles = isSuperAdminUser();

  // Optimize fetchUsers with useMemo and useCallback
  const fetchUsers = useCallback(
    async (page = 1, role = "all", search = "") => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        queryParams.append("page", page.toString());
        queryParams.append("limit", "10");

        if (role !== "all") {
          queryParams.append("role", role);
        }

        if (search) {
          queryParams.append("search", search);
        }

        const token = getAuthToken();
        const response = await fetch(
          `/api/admin/users?${queryParams.toString()}`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );
        const data = await response.json();

        if (data.success) {
          setUsers(data.users || []);
          setTotalPages(data.totalPages || 1);
        } else {
          Swal.fire({
            icon: "error",
            title: texts.error,
            text: data.error || texts.failedToUpdateRole,
            confirmButtonColor: "#44dcf3",
          });
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        Swal.fire({
          icon: "error",
          title: texts.error,
          text: texts.failedToUpdateRole,
          confirmButtonColor: "#44dcf3",
        });
      } finally {
        setLoading(false);
      }
    },
    [texts.error, texts.failedToUpdateRole, getAuthToken]
  );

  // Optimize debounced fetch with useMemo
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers(currentPage, filters.role, filters.search);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [currentPage, filters.role, filters.search, fetchUsers]);

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = getAuthToken(); // Get the auth token
      if (!token) {
        Swal.fire({
          icon: "error",
          title: texts.error,
          text: "Authentication token not found. Please log in again.",
          confirmButtonColor: "#44dcf3",
        });
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add Authorization header
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: texts.success,
          text: texts.userRoleUpdated,
          confirmButtonColor: "#44dcf3",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchUsers(currentPage, filters.role, filters.search);
      } else {
        Swal.fire({
          icon: "error",
          title: texts.error,
          text: data.error || texts.failedToUpdateRole,
          confirmButtonColor: "#44dcf3",
        });
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: texts.failedToUpdateRole,
        confirmButtonColor: "#44dcf3",
      });
    }
  };

  const handleRoleChange = (userId, currentRole, userEmail) => {
    if (isSuperAdminEmail(userEmail)) {
      Swal.fire({
        icon: "warning",
        title: texts.error,
        text: "Cannot modify super admin privileges",
        confirmButtonColor: "#44dcf3",
      });
      return;
    }

    const newRole = currentRole === "admin" ? "user" : "admin";
    const actionText =
      newRole === "admin" ? texts.makeUserAdmin : texts.removeUserAdmin;
    const confirmText =
      newRole === "admin"
        ? texts.areYouSureMakeAdmin
        : texts.areYouSureRemoveAdmin;
    const confirmButtonText =
      newRole === "admin" ? texts.yesMakeAdmin : texts.yesRemoveAdmin;

    Swal.fire({
      title: actionText,
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newRole === "admin" ? "#3085d6" : "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: confirmButtonText,
      cancelButtonText: texts.cancel,
    }).then((result) => {
      if (result.isConfirmed) {
        updateUserRole(userId, newRole);
      }
    });
  };

  const getStatusBadge = (isActive) => {
    return (
      <span
        className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
          isActive
            ? "bg-green-900/20 text-green-300 border border-green-500/30"
            : "bg-red-900/20 text-red-300 border border-red-500/30"
        }`}
      >
        {isActive ? texts.active : texts.inactive}
      </span>
    );
  };

  const getRoleBadge = (role, email) => {
    // Check if user is super admin
    const isSuperAdmin = isSuperAdminEmail(email);

    return (
      <span
        className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
          isSuperAdmin
            ? "bg-orange-900/20 text-orange-300 border border-orange-500/30" // Changed to orange/red
            : role === "admin"
            ? "bg-blue-900/20 text-blue-300 border border-blue-500/30"
            : "bg-gray-900/20 text-gray-300 border border-gray-500/30"
        }`}
      >
        {isSuperAdmin
          ? texts.owner || "Owner"
          : role === "admin"
          ? texts.admin || "Admin" // Changed to use texts.admin
          : texts.customer || "Customer"}{" "}
      </span>
    );
  };

  // Memoize table data to prevent unnecessary re-renders
  const tableData = useMemo(() => {
    return users.map((user) => ({
      key: user._id,
      user: (
        <div className="flex items-center space-x-2 sm:space-x-3 pl-2">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-full flex items-center justify-center">
              {user.profile?.avatar ? (
                <img
                  src={user.profile.avatar}
                  alt="User"
                  className="w-full h-full rounded-full"
                />
              ) : (
                <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-sm font-medium text-white">
              {user.profile?.firstName} {user.profile?.lastName}
            </div>
          </div>
        </div>
      ),
      email: (
        <span className="text-xs pl-4 sm:text-sm text-gray-300">
          {user.email}
        </span>
      ),
      role: getRoleBadge(user.role, user.email),
      status: getStatusBadge(user.isActive),
      joinedDate: (
        <span className="text-xs sm:text-sm text-gray-300">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
      actions: canManageRoles ? (
        <button
          onClick={() => handleRoleChange(user._id, user.role, user.email)}
          disabled={isSuperAdminEmail(user.email)}
          className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-lg transition-colors pl-2 ${
            user.role === "admin"
              ? "bg-red-900/20 text-red-300 hover:bg-red-900/30 border border-red-500/30"
              : "bg-blue-900/20 text-blue-300 hover:bg-blue-900/30 border border-blue-500/30"
          } ${
            isSuperAdminEmail(user.email) ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {user.role === "admin" ? texts.removeAdmin : texts.makeAdmin}
        </button>
      ) : (
        <span className="text-xs text-gray-500">—</span>
      ),
    }));
  }, [users, texts, canManageRoles, isSuperAdminEmail]);

  const columns = [
    {
      title: texts.user,
      dataIndex: "user",
      key: "user",
    },
    {
      title: texts.email,
      dataIndex: "email",
      key: "email",
    },
    {
      title: texts.role,
      dataIndex: "role",
      key: "role",
    },
    {
      title: texts.status,
      dataIndex: "status",
      key: "status",
    },
    {
      title: texts.joinedDate,
      dataIndex: "joinedDate",
      width: 150,
      key: "joinedDate",
    },
    {
      title: texts.actions,
      dataIndex: "actions",
      key: "actions",
      width: 100,
      align: "center",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 font-secondary sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          {texts.heading}
        </h1>
        {!canManageRoles && (
          <span className="text-xs text-gray-400">
            (View only - Super admin required to manage roles)
          </span>
        )}
      </div>

      <div className="bg-black border border-[#212121] rounded-lg p-4 sm:p-6">
        <FilterControls
          filters={filters}
          setFilters={setFilters}
          texts={texts}
        />

        {loading ? (
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-2 text-gray-400 text-xs sm:text-sm">
              {texts.loading}
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <UserX className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-xs sm:text-sm">{texts.noUsersFound}</p>
          </div>
        ) : (
          <TableCustom
            title={texts.heading}
            data={tableData}
            columns={columns}
            pageSize={10}
            showButton={false}
            rowKey="_id"
            containerClassName="overflow-x-auto"
          />
        )}
      </div>
    </div>
  );
};

export default UserManagement;
