"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

export default function ReferralOrderHistory() {
  const [sorting, setSorting] = useState([]);

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

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("id", {
      header: "Order ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("referredUser", {
      header: "Referred User",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("plan", {
      header: "Plan",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("commission", {
      header: "Commission Earned",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("date", {
      header: "Date",
      cell: (info) => info.getValue(),
    }),
  ];

  const table = useReactTable({
    data: orders,
    columns,
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
          REFERRAL ORDER HISTORY
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm">
          Use the dashboard to keep track of your referrals and earnings.
        </p>
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
