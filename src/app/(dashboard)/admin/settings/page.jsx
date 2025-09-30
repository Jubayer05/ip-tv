"use client";
import EmailManagement from "@/components/dashboard/AdminDashboard/SystemsSettings/EmailManagement";
import ManageAddons from "@/components/dashboard/AdminDashboard/SystemsSettings/ManageAddons";
import ManageBanner from "@/components/dashboard/AdminDashboard/SystemsSettings/ManageBanner";
import ManageContact from "@/components/dashboard/AdminDashboard/SystemsSettings/ManageContact";
import ManageFreeTrial from "@/components/dashboard/AdminDashboard/SystemsSettings/ManageFreeTrial";
import ManageSocialMediaContact from "@/components/dashboard/AdminDashboard/SystemsSettings/ManageSocialMedia";
import MetaManagement from "@/components/dashboard/AdminDashboard/SystemsSettings/MetaManagement";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("social");

  const tabs = [
    {
      id: "social",
      label: "Social Media",
      component: <ManageSocialMediaContact />,
    },
    {
      id: "contact",
      label: "Contact & Support Ticket",
      component: <ManageContact />,
    },
    {
      id: "banner",
      label: "Banner Management",
      component: <ManageBanner />,
    },
    {
      id: "meta",
      label: "Meta Management",
      component: <MetaManagement />,
    },
    {
      id: "email",
      label: "Email Content Management",
      component: <EmailManagement />,
    },
    {
      id: "addons",
      label: "Addons Management",
      component: <ManageAddons />,
    },
    {
      id: "free-trial",
      label: "Free Trial Management",
      component: <ManageFreeTrial />,
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
      <div>{tabs.find((tab) => tab.id === activeTab)?.component}</div>
    </div>
  );
}
