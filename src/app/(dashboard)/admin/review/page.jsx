"use client";
import ReviewManagement from "@/components/dashboard/AdminDashboard/CustomerReview/ReviewManagement";
import BulkReviewHandling from "@/components/features/UserReview/BulkReviewHandling";
import UniqueNameHandle from "@/components/features/UserReview/UniqueNameHandle";
import { useState } from "react";

export default function AdminReview() {
  const [activeTab, setActiveTab] = useState("management");

  const tabs = [
    {
      id: "management",
      label: "Review Management",
      component: <ReviewManagement />,
    },
    {
      id: "bulk",
      label: "Bulk Review Handling",
      component: <BulkReviewHandling />,
    },
    {
      id: "unique",
      label: "Unique Name Handle",
      component: <UniqueNameHandle />,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 font-secondary px-4 sm:px-6 lg:px-8">
      {/* Tab Navigation */}
      <div className="border-b border-[#212121]">
        <nav className="flex flex-wrap space-x-4 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{tabs.find((tab) => tab.id === activeTab)?.component}</div>
    </div>
  );
}
