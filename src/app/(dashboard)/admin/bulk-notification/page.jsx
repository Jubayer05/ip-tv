"use client";
import BulkNotification from "@/components/dashboard/AdminDashboard/Bulk-Notification/BulkNotification";
import Notifications from "@/components/dashboard/AdminDashboard/Bulk-Notification/Notifications";
import { Bell, Mail } from "lucide-react";
import { useState } from "react";

export default function AdminBulkNotificationPage() {
  const [activeTab, setActiveTab] = useState("bulk");

  const tabs = [
    {
      id: "bulk",
      label: "Bulk Messages",
      icon: Mail,
      component: BulkNotification,
    },
    {
      id: "notifications",
      label: "Website Notifications",
      icon: Bell,
      component: Notifications,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-900 font-secondary">
      {/* Tab Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`cursor-pointer flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-cyan-500 text-cyan-400"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        <ActiveComponent />
      </div>
    </div>
  );
}
