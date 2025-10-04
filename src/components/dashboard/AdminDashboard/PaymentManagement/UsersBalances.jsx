"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const UsersBalances = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
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

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "User Balances",
    searchPlaceholder: "Search users by name, email, or username...",
    search: "Search",
    user: "User",
    email: "Email",
    balance: "Balance",
    actions: "Actions",
    loadingUsers: "Loading users...",
    noUsersFound: "No users found",
    viewHistory: "View History",
    updateBalance: "Update Balance",
    balanceHistory: "Balance History",
    loadingBalanceHistory: "Loading balance history...",
    noBalanceHistoryFound: "No balance history found",
    balanceLabel: "Balance:",
    by: "By:",
    updateBalanceModal: "Update Balance",
    transactionType: "Transaction Type",
    addBalance: "Add Balance",
    deductBalance: "Deduct Balance",
    amount: "Amount ($)",
    enterAmount: "Enter amount",
    description: "Description",
    enterDescription: "Enter description",
    updateBalanceButton: "Update Balance",
    cancel: "Cancel",
    error: "Error",
    success: "Success",
    invalidAmount: "Invalid Amount",
    validAmountMessage: "Please enter a valid amount greater than 0",
    balanceUpdatedSuccess: "Balance updated successfully",
    failedToFetchHistory: "Failed to fetch deposit history",
    failedToUpdateBalance: "Failed to update balance",
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
          title: texts.error,
          text: texts.failedToFetchHistory,
        });
      }
    } catch (error) {
      console.error("❌ Frontend: Error fetching deposit history:", error);
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: texts.failedToFetchHistory,
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
        title: texts.invalidAmount,
        text: texts.validAmountMessage,
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
          title: texts.success,
          text: texts.balanceUpdatedSuccess,
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
          title: texts.error,
          text: response.error || texts.failedToUpdateBalance,
        });
      }
    } catch (error) {
      console.error("Error updating balance:", error);
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: texts.failedToUpdateBalance,
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
    <div className="p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{texts.heading}</h1>

        {/* Search */}
        <div className="mb-3 sm:mb-4">
          <input
            type="text"
            placeholder={texts.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchUsers(searchTerm)}
            className="w-full px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-xs sm:text-sm"
          />
          <button
            onClick={() => searchUsers(searchTerm)}
            className="mt-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
          >
            {texts.search}
          </button>
        </div>

        {/* Users List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-white font-medium text-xs sm:text-sm">
                    {texts.user}
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-white font-medium text-xs sm:text-sm">
                    {texts.email}
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-white font-medium text-xs sm:text-sm">
                    {texts.balance}
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-white font-medium text-xs sm:text-sm">
                    {texts.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-2 sm:px-4 py-6 sm:py-8 text-center text-gray-400 text-xs sm:text-sm"
                    >
                      {texts.loadingUsers}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-2 sm:px-4 py-6 sm:py-8 text-center text-gray-400 text-xs sm:text-sm"
                    >
                      {texts.noUsersFound}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-t border-gray-700 hover:bg-gray-750"
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-white">
                        <div>
                          <div className="font-medium text-xs sm:text-sm">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-400">
                            @{user.profile?.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-300 text-xs sm:text-sm break-all">
                        {user.email}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-white font-medium text-xs sm:text-sm">
                        ${user.balance?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              getDepositHistory(user._id);
                            }}
                            className="px-2 sm:px-3 py-1 bg-green-600 text-white text-[10px] sm:text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            {texts.viewHistory}
                          </button>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-2 sm:px-3 py-1 bg-blue-600 text-white text-[10px] sm:text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            {texts.updateBalance}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {texts.balanceHistory} - {selectedUser?.profile?.firstName}{" "}
                {selectedUser?.profile?.lastName}
              </h2>
              <button
                onClick={closeDepositModal}
                className="text-gray-400 hover:text-white text-xl sm:text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              {historyLoading ? (
                <div className="text-center py-6 sm:py-8 text-gray-300 text-xs sm:text-sm">
                  {texts.loadingBalanceHistory}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
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
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-gray-700 rounded-lg gap-2 sm:gap-0"
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm font-medium text-white">
                              {transaction.displayName}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-400">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}
                            </span>
                            <span
                              className={`text-[10px] sm:text-xs px-2 py-1 rounded ${
                                isCredit
                                  ? "bg-green-900 text-green-300"
                                  : "bg-red-900 text-red-300"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-300 mt-1">
                            {transaction.description}
                          </p>
                          {transaction.adminId && (
                            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                              {texts.by}{" "}
                              {transaction.adminId.profile?.firstName}{" "}
                              {transaction.adminId.profile?.lastName}
                            </p>
                          )}
                        </div>
                        <div className="text-left sm:text-right">
                          <p className={`text-sm sm:text-lg font-semibold ${colorClass}`}>
                            {sign}${Math.abs(amount).toFixed(2)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-300">
                            {texts.balanceLabel} $
                            {transaction.newBalance.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {depositHistory.length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-gray-400 text-xs sm:text-sm">
                      {texts.noBalanceHistoryFound}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Balance Modal */}
      {selectedUser && !showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-4 sm:p-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {texts.updateBalanceModal} - {selectedUser.profile?.firstName}{" "}
                {selectedUser.profile?.lastName}
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white text-xl sm:text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={updateBalance} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {texts.transactionType}
                </label>
                <select
                  value={updateForm.type}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, type: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-xs sm:text-sm"
                >
                  <option value="admin_add">{texts.addBalance}</option>
                  <option value="admin_deduct">{texts.deductBalance}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {texts.amount}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={updateForm.amount}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-xs sm:text-sm"
                  placeholder={texts.enterAmount}
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {texts.description}
                </label>
                <textarea
                  value={updateForm.description}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-xs sm:text-sm"
                  rows="3"
                  placeholder={texts.enterDescription}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                >
                  {texts.updateBalanceButton}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                >
                  {texts.cancel}
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
