"use client";
import AddNewUser from "@/components/dashboard/AdminDashboard/UserManagement/AddNewUser";
import UserManagement from "@/components/dashboard/AdminDashboard/UserManagement/UserManagement";
import { useState } from "react";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = [
    {
      id: "users",
      label: "User Management",
      component: <UserManagement />,
    },
    {
      id: "add-user",
      label: "Add New User",
      component: <AddNewUser />,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 font-secondary sm:px-6 lg:px-8">
      {/* Tab Navigation */}
      <div className="border-b border-[#212121]">
        <nav className="flex flex-wrap gap-2 sm:gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer py-2 sm:py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
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
      <div className="min-h-[400px] sm:min-h-[500px]">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}
