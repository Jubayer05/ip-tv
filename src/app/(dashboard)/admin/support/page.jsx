"use client";
import GuestSupportTicketAdmin from "@/components/dashboard/AdminDashboard/GuestSupportTicketAdmin";
import SupportTicketAdmin from "@/components/dashboard/AdminDashboard/SupportTicketAdmin";
import { MessageCircle, UserX } from "lucide-react";
import { useState } from "react";

export default function AdminSupportPage() {
  const [activeTab, setActiveTab] = useState("regular");

  const tabs = [
    {
      id: "regular",
      label: "Regular Users",
      icon: MessageCircle,
      component: SupportTicketAdmin,
      count: 0, // You can add counts here if needed
    },
    {
      id: "guest",
      label: "Guest Users",
      icon: UserX,
      component: GuestSupportTicketAdmin,
      count: 0, // You can add counts here if needed
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-black border border-[#212121] rounded-lg p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-200 flex-1 justify-center
                  ${
                    isActive
                      ? "bg-cyan-400 text-black shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }
                `}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`
                      px-2 py-1 rounded-full text-xs font-semibold
                      ${
                        isActive
                          ? "bg-black/20 text-black"
                          : "bg-gray-700 text-gray-300"
                      }
                    `}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-black border border-[#212121] rounded-lg p-6">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}
