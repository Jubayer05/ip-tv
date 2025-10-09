"use client";
import CountryAnalytics from "@/components/dashboard/AdminDashboard/Analytics/CountryAnalytics";
import SystemAnalytics from "@/components/dashboard/AdminDashboard/Analytics/SystemAnalytics";
import UserAnalytics from "@/components/dashboard/AdminDashboard/Analytics/UserAnalytics";
import { useState } from "react";

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("user");

  const tabs = [
    {
      id: "user",
      label: "User Analytics",
      component: <UserAnalytics />,
    },
    {
      id: "system",
      label: "System Analytics",
      component: <SystemAnalytics />,
    },
    {
      id: "country",
      label: "Country Analytics",
      component: <CountryAnalytics />,
    },
  ];

  return (
    <div className="space-y-6 font-secondary">
      {/* Tab Navigation */}
      <div className="border-b border-[#212121]">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
      <div className="px-4">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}
