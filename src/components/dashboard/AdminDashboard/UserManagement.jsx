"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const FilterControls = ({ filters, setFilters, texts }) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <div className="flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={texts.searchUsers}
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 bg-black border border-[#212121] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
        />
      </div>
    </div>
    <div className="flex gap-2">
      <select
        value={filters.role}
        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        className="px-4 py-2 bg-black border border-[#212121] rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
  });

  const ORIGINAL_TEXTS = {
    heading: "User Management",
    searchUsers: "Search users by name or email...",
    allUsers: "All Users",
    regularUsers: "Regular Users",
    adminUsers: "Admin Users",
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
    areYouSureRemoveAdmin: "Are you sure you want to remove admin privileges from this user?",
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

  const isSuperAdminEmail = (email) => {
    const superAdminEmails = [
      "admin@example.com",
      "superadmin@example.com",
      // Add more super admin emails as needed
    ];
    return superAdminEmails.includes(email.toLowerCase());
  };

  const fetchUsers = async (page = 1, role = "all", search = "") => {
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

      const response = await fetch(`/api/admin/users?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
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
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers(currentPage, filters.role, filters.search);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [currentPage, filters]);

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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
    const actionText = newRole === "admin" ? texts.makeUserAdmin : texts.removeUserAdmin;
    const confirmText = newRole === "admin" ? texts.areYouSureMakeAdmin : texts.areYouSureRemoveAdmin;
    const confirmButtonText = newRole === "admin" ? texts.yesMakeAdmin : texts.yesRemoveAdmin;

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
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive
            ? "bg-green-900/20 text-green-300 border border-green-500/30"
            : "bg-red-900/20 text-red-300 border border-red-500/30"
        }`}
      >
        {isActive ? texts.active : texts.inactive}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          role === "admin"
            ? "bg-blue-900/20 text-blue-300 border border-blue-500/30"
            : "bg-gray-900/20 text-gray-300 border border-gray-500/30"
        }`}
      >
        {role === "admin" ? texts.adminUsers : texts.regularUsers}
      </span>
    );
  };

  return (
    <div className="space-y-6 font-secondary">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{texts.heading}</h1>
      </div>

      <div className="bg-black border border-[#212121] rounded-lg p-6">
        <FilterControls filters={filters} setFilters={setFilters} texts={texts} />

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-2 text-gray-400">{texts.loading}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <UserX className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{texts.noUsersFound}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      {texts.user}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {texts.email}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {texts.role}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {texts.status}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {texts.joinedDate}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {texts.actions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="bg-black border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-gray-300" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.isActive)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleRoleChange(user._id, user.role, user.email)
                          }
                          disabled={isSuperAdminEmail(user.email)}
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            user.role === "admin"
                              ? "bg-red-900/20 text-red-300 hover:bg-red-900/30 border border-red-500/30"
                              : "bg-blue-900/20 text-blue-300 hover:bg-blue-900/30 border border-blue-500/30"
                          } ${
                            isSuperAdminEmail(user.email)
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {user.role === "admin" ? texts.removeAdmin : texts.makeAdmin}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                  >
                    {texts.previous}
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-2 border rounded-lg transition-colors ${
                        currentPage === index + 1
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                  >
                    {texts.next}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
