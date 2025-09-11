import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const UsersBalances = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [depositHistory, setDepositHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Balance update form
  const [updateForm, setUpdateForm] = useState({
    type: "admin_add",
    amount: "",
    description: "",
  });

  const { apiCall } = useApi();

  // Search users
  const searchUsers = async (search = "", page = 1) => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/api/admin/balance?search=${encodeURIComponent(
          search
        )}&page=${page}&limit=10`
      );
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get user deposit history
  const getDepositHistory = async (userId) => {
    setHistoryLoading(true);
    try {
      const response = await apiCall(
        `/api/admin/balance/${userId}/history`,
        "GET"
      );

      if (response.success) {
        // Filter for deposit and deduction transactions on the frontend
        const depositTransactions = response.data.filter(
          (transaction) =>
            transaction.type === "deposit" ||
            transaction.type === "admin_add" ||
            transaction.type === "admin_deduct" ||
            transaction.type === "withdrawal" ||
            transaction.type === "purchase"
        );

        setDepositHistory(depositTransactions);
        setShowDepositModal(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch deposit history",
        });
      }
    } catch (error) {
      console.error("❌ Frontend: Error fetching deposit history:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch deposit history",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  // Update user balance
  const updateBalance = async (e) => {
    e.preventDefault();

    if (!updateForm.amount || updateForm.amount <= 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Amount",
        text: "Please enter a valid amount greater than 0",
      });
      return;
    }

    try {
      const response = await apiCall("/api/admin/balance", "POST", {
        userId: selectedUser._id,
        type: updateForm.type,
        amount: parseFloat(updateForm.amount),
        description: updateForm.description,
      });

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Balance updated successfully",
        });

        // Reset form
        setUpdateForm({
          type: "admin_add",
          amount: "",
          description: "",
        });

        // Refresh user list
        searchUsers(searchTerm);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.error || "Failed to update balance",
        });
      }
    } catch (error) {
      console.error("Error updating balance:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update balance",
      });
    }
  };

  // Close deposit modal
  const closeDepositModal = () => {
    setShowDepositModal(false);
    setDepositHistory([]);
    setSelectedUser(null); // Clear selectedUser when closing deposit modal
  };

  useEffect(() => {
    searchUsers();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">User Balances</h1>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchUsers(searchTerm)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => searchUsers(searchTerm)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Users List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-white font-medium">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-white font-medium">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-white font-medium">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left text-white font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-t border-gray-700 hover:bg-gray-750"
                    >
                      <td className="px-4 py-3 text-white">
                        <div>
                          <div className="font-medium">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </div>
                          <div className="text-sm text-gray-400">
                            @{user.profile?.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{user.email}</td>
                      <td className="px-4 py-3 text-white font-medium">
                        ${user.balance?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              getDepositHistory(user._id);
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            View History
                          </button>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Update Balance
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deposit History Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                Balance History - {selectedUser?.profile?.firstName}{" "}
                {selectedUser?.profile?.lastName}
              </h2>
              <button
                onClick={closeDepositModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {historyLoading ? (
                <div className="text-center py-8 text-gray-300">
                  Loading balance history...
                </div>
              ) : (
                <div className="space-y-4">
                  {depositHistory.map((transaction) => {
                    // Determine if it's a credit (green) or debit (red) transaction
                    const isCredit = [
                      "deposit",
                      "admin_add",
                      "refund",
                    ].includes(transaction.type);
                    const amount = isCredit
                      ? transaction.amount
                      : -transaction.amount;
                    const colorClass = isCredit
                      ? "text-green-400"
                      : "text-red-400";
                    const sign = isCredit ? "+" : "-";

                    return (
                      <div
                        key={transaction._id}
                        className="flex justify-between items-center p-4 bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">
                              {transaction.displayName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                isCredit
                                  ? "bg-green-900 text-green-300"
                                  : "bg-red-900 text-red-300"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mt-1">
                            {transaction.description}
                          </p>
                          {transaction.adminId && (
                            <p className="text-xs text-gray-400 mt-1">
                              By: {transaction.adminId.profile?.firstName}{" "}
                              {transaction.adminId.profile?.lastName}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${colorClass}`}>
                            {sign}${Math.abs(amount).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-300">
                            Balance: ${transaction.newBalance.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {depositHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No balance history found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Balance Modal - Only show when selectedUser is set AND deposit modal is not open */}
      {selectedUser && !showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                Update Balance - {selectedUser.profile?.firstName}{" "}
                {selectedUser.profile?.lastName}
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={updateBalance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Transaction Type
                </label>
                <select
                  value={updateForm.type}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, type: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="admin_add">Add Balance</option>
                  <option value="admin_deduct">Deduct Balance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={updateForm.amount}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={updateForm.description}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  rows="3"
                  placeholder="Enter description"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Balance
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersBalances;
