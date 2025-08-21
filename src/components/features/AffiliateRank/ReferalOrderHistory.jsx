"use client";

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
  const [sorting, setSorting] = useState([]);

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

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [subtitle, setSubtitle] = useState(ORIGINAL_SUBTITLE);
  const [columns, setColumns] = useState(ORIGINAL_COLUMNS);

  const orders = [
    {
      id: "#INVC0000005",
      referredUser: "JohnDoe",
      plan: "Premium",
      commission: "$8.00",
      date: "Mar 15, 2025",
    },
    {
      id: "#INVC0000005",
      referredUser: "JohnDoe",
      plan: "Premium",
      commission: "$8.00",
      date: "Mar 15, 2025",
    },
    {
      id: "#INVC0000005",
      referredUser: "JohnDoe",
      plan: "Premium",
      commission: "$8.00",
      date: "Mar 15, 2025",
    },
    {
      id: "#INVC0000005",
      referredUser: "JohnDoe",
      plan: "Premium",
      commission: "$8.00",
      date: "Mar 15, 2025",
    },
    {
      id: "#INVC0000005",
      referredUser: "JohnDoe",
      plan: "Premium",
      commission: "$8.00",
      date: "Mar 15, 2025",
    },
  ];

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
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const columnHelper = createColumnHelper();

  const tableColumns = [
    columnHelper.accessor("id", {
      header: columns.orderId,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("referredUser", {
      header: columns.referredUser,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("plan", {
      header: columns.plan,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("commission", {
      header: columns.commission,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("date", {
      header: columns.date,
      cell: (info) => info.getValue(),
    }),
  ];

  const table = useReactTable({
    data: orders,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 rounded-lg w-full container">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-2 tracking-wide">
          {heading}
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm">{subtitle}</p>
      </div>

      {/* Table Container with Border */}
      <div className="border border-white/15 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-white/10">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left py-3 sm:py-4 px-2 sm:px-4 text-gray-300 font-medium text-xs sm:text-sm border-b border-white/15 cursor-pointer hover:bg-white/5 transition-colors duration-200"
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
    </div>
  );
}
