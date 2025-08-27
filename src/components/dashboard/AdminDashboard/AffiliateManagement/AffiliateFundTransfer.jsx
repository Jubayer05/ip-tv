"use client";
import TableCustom from "@/components/ui/TableCustom";
import { Check, Clock, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

const AffiliateFundTransfer = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/withdrawals?isAdmin=true");
      const data = await response.json();

      if (response.ok && data.success) {
        setWithdrawals(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, adminNotes = "") => {
    try {
      const response = await fetch(`/api/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNotes,
        }),
      });

      if (response.ok) {
        fetchWithdrawals(); // Refresh the list
      }
    } catch (err) {
      console.error("Error updating withdrawal:", err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "approved":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "rejected":
        return <X className="w-4 h-4 text-red-400" />;
      case "paid":
        return <Check className="w-4 h-4 text-green-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "approved":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "paid":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  // Filter withdrawals based on search term
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    const username = withdrawal.userId?.profile?.username || "";
    const firstName = withdrawal.userId?.profile?.firstName || "";
    const lastName = withdrawal.userId?.profile?.lastName || "";
    const email = withdrawal.userId?.email || "";

    return (
      username.toLowerCase().includes(searchLower) ||
      firstName.toLowerCase().includes(searchLower) ||
      lastName.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower)
    );
  });

  // Transform data for table
  const transformWithdrawalData = () => {
    return filteredWithdrawals.map((withdrawal, index) => ({
      key: withdrawal._id || index.toString(),
      user:
        withdrawal.userId?.profile?.username ||
        withdrawal.userId?.email ||
        "N/A",
      amount: `$${withdrawal.amount.toFixed(2)}`,
      currency: withdrawal.currency,
      walletAddress: withdrawal.walletAddress,
      status: withdrawal.status,
      date: new Date(withdrawal.createdAt).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      message: withdrawal.message || "-",
      adminNotes: withdrawal.adminNotes || "-",
      // Additional data for potential future use
      withdrawalId: withdrawal._id,
      userId: withdrawal.userId?._id,
      originalAmount: withdrawal.amount,
    }));
  };

  // Build table columns
  const buildTableColumns = () => {
    return [
      {
        title: "User",
        dataIndex: "user",
        key: "user",
        width: "150px",
        render: (text) => (
          <span className="pl-2 text-gray-300 text-xs sm:text-sm font-secondary break-all">
            {text}
          </span>
        ),
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        align: "center",
        width: "100px",
        render: (text, record) => (
          <div className="text-center">
            <span className="text-gray-300 text-xs sm:text-sm font-secondary font-bold">
              {text}
            </span>
            <div className="text-gray-500 text-xs">{record.currency}</div>
          </div>
        ),
      },
      {
        title: "Wallet Address",
        dataIndex: "walletAddress",
        key: "walletAddress",
        width: "200px",
        render: (text) => (
          <span className="text-gray-300 text-xs sm:text-sm font-secondary break-all">
            {text}
          </span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: "120px",
        render: (status) => (
          <div className="flex items-center justify-center gap-2">
            {getStatusIcon(status)}
            <span
              className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium font-secondary whitespace-nowrap ${getStatusColor(
                status
              )}`}
            >
              {status.toUpperCase()}
            </span>
          </div>
        ),
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        align: "center",
        width: "140px",
        render: (text) => (
          <span className="text-gray-300 text-xs sm:text-sm font-secondary">
            {text}
          </span>
        ),
      },
      {
        title: "Message",
        dataIndex: "message",
        align: "center",
        key: "message",
        width: "200px",
        render: (text) => (
          <p className="text-left text-gray-300 text-xs sm:text-sm font-secondary break-all">
            {text}
          </p>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        align: "center",
        width: "160px",
        render: (_, record) => (
          <div className="flex flex-col gap-2 px-2 ">
            {record.status === "pending" && (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => updateStatus(record.withdrawalId, "approved")}
                  className="px-2 py-1 cursor-pointer bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    updateStatus(
                      record.withdrawalId,
                      "rejected",
                      "Request rejected"
                    )
                  }
                  className="px-2 py-1 cursor-pointer bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}

            {record.status === "approved" && (
              <button
                onClick={() =>
                  updateStatus(record.withdrawalId, "paid", "Payment processed")
                }
                className="px-3 py-1 cursor-pointer bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
              >
                Mark as Paid
              </button>
            )}

            {record.status === "paid" && (
              <div className="text-green-400 text-xs font-medium">
                ✓ Payment completed
              </div>
            )}

            {record.status === "rejected" && (
              <div className="text-red-400 text-xs font-medium">
                ✗ Request rejected
              </div>
            )}
          </div>
        ),
      },
    ];
  };

  // Show loading state
  if (loading) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 w-full max-w-7xl mx-auto font-secondary">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400 text-sm text-center">
            Loading withdrawal requests...
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (withdrawals.length === 0) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 w-full max-w-7xl mx-auto font-secondary">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400 text-sm text-center">
            No withdrawal requests found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 font-secondary">
      <h2 className="text-4xl font-bold text-white mb-4">
        Fund Transfer Management - Withdrawal Requests
      </h2>
      {/* Search Box */}
      <div className="mb-6 flex justify-start pt-3">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by username, first name, last name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#0c171c] border border-white/15 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="mb-4 text-center">
          <p className="text-gray-400 text-sm">
            Showing {filteredWithdrawals.length} of {withdrawals.length}{" "}
            withdrawal requests
            {filteredWithdrawals.length !== withdrawals.length && (
              <span className="text-cyan-400"> for "{searchTerm}"</span>
            )}
          </p>
        </div>
      )}

      <TableCustom
        title=""
        data={transformWithdrawalData()}
        columns={buildTableColumns()}
        pageSize={10}
        showButton={false}
        showPagination={true}
        showHeader={true}
        className="overflow-x-auto -mt-8"
      />
    </div>
  );
};

export default AffiliateFundTransfer;
