"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

export default function ReferralOrderHistory() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user } = useAuth();
  const [sorting, setSorting] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ORIGINAL_HEADING = "REFERRAL ORDER HISTORY";
  const ORIGINAL_SUBTITLE =
    "Use the dashboard to keep track of your referrals and earnings.";
  const ORIGINAL_COLUMNS = {
    orderId: "Order ID",
    referredUser: "Referred User",
    plan: "Plan",
    commission: "Commission Earned",
    date: "Date",
  };
  const ORIGINAL_LOADING = "Loading referral history...";
  const ORIGINAL_ERROR = "Failed to load referral history";
  const ORIGINAL_NO_REFERRALS =
    "No referrals found yet. Start sharing your referral link!";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [subtitle, setSubtitle] = useState(ORIGINAL_SUBTITLE);
  const [columns, setColumns] = useState(ORIGINAL_COLUMNS);
  const [loadingText, setLoadingText] = useState(ORIGINAL_LOADING);
  const [errorText, setErrorText] = useState(ORIGINAL_ERROR);
  const [noReferralsText, setNoReferralsText] = useState(ORIGINAL_NO_REFERRALS);

  // Fetch referral data
  useEffect(() => {
    if (!user?._id) return;

    const fetchReferrals = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/users/${user._id}/referrals`);
        const data = await response.json();

        if (response.ok && data.success) {
          setReferrals(data.data.referrals || []);
        } else {
          setError(data.error || "Failed to fetch referrals");
        }
      } catch (err) {
        console.error("Error fetching referrals:", err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [user?._id]);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_HEADING,
        ORIGINAL_SUBTITLE,
        ORIGINAL_COLUMNS.orderId,
        ORIGINAL_COLUMNS.referredUser,
        ORIGINAL_COLUMNS.plan,
        ORIGINAL_COLUMNS.commission,
        ORIGINAL_COLUMNS.date,
        ORIGINAL_LOADING,
        ORIGINAL_ERROR,
        ORIGINAL_NO_REFERRALS,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tHeading,
        tSubtitle,
        tOrderId,
        tReferredUser,
        tPlan,
        tCommission,
        tDate,
        tLoading,
        tError,
        tNoReferrals,
      ] = translated;

      setHeading(tHeading);
      setSubtitle(tSubtitle);
      setColumns({
        orderId: tOrderId,
        referredUser: tReferredUser,
        plan: tPlan,
        commission: tCommission,
        date: tDate,
      });
      setLoadingText(tLoading);
      setErrorText(tError);
      setNoReferralsText(tNoReferrals);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const columnHelper = createColumnHelper();

  const tableColumns = [
    columnHelper.accessor("userId", {
      header: columns.orderId,
      cell: (info) => {
        const referral = info.row.original;
        // Generate a simple order ID since we don't have the actual order number
        return `#REF-${
          referral.userId?.toString().slice(-8).toUpperCase() || "N/A"
        }`;
      },
    }),
    columnHelper.accessor("username", {
      header: columns.referredUser,
      cell: (info) => {
        const referral = info.row.original;
        return referral.username || referral.email || "-";
      },
    }),
    columnHelper.accessor("plan", {
      header: columns.plan,
      cell: (info) => {
        const referral = info.row.original;
        return referral.planName || "IPTV Plan";
      },
    }),
    columnHelper.accessor("earnings", {
      header: columns.commission,
      cell: (info) => {
        const referral = info.row.original;
        return `$${Number(referral.earnings || 0).toFixed(2)}`;
      },
    }),
    columnHelper.accessor("joinedDate", {
      header: columns.date,
      cell: (info) => {
        const referral = info.row.original;
        return new Date(referral.orderDate).toLocaleDateString();
      },
    }),
  ];
  const table = useReactTable({
    data: referrals,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Loading state
  if (loading) {
    return (
      <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 rounded-lg w-full container">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-2 tracking-wide">
            {heading}
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm">{subtitle}</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-400 text-sm">{loadingText}</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 rounded-lg w-full container">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-2 tracking-wide">
            {heading}
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm">{subtitle}</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-400 text-sm">
            {errorText}: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 rounded-lg w-full container">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-2 tracking-wide">
          {heading}
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm">{subtitle}</p>
      </div>

      {/* No referrals message */}
      {referrals.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm">{noReferralsText}</div>
        </div>
      )}

      {/* Table Container with Border */}
      {referrals.length > 0 && (
        <div className="border border-white/15 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-white/10">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left py-3 sm:p-4 px-2 sm:px-4 text-gray-300 font-medium text-xs sm:text-sm border-b border-white/15 cursor-pointer hover:bg-white/5 transition-colors duration-200"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="ml-1 sm:ml-2">
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted()] ?? ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-white/5 transition-colors duration-200"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="py-3 sm:py-4 px-2 sm:px-4 text-white text-xs sm:text-sm border-b border-white/15"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
