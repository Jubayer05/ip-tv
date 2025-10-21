"use client";
import EmailManagement from "@/components/dashboard/AdminDashboard/SystemsSettings/EmailManagement";
import LanguageManagement from "@/components/dashboard/AdminDashboard/SystemsSettings/LanguageManagement";
import ManageAddons from "@/components/dashboard/AdminDashboard/SystemsSettings/ManageAddons";
import ManageBanner from "@/components/dashboard/AdminDashboard/SystemsSettings/ManageBanner";
import ManageContact from "@/components/dashboard/AdminDashboard/SystemsSettings/ManageContact";
import ManageFreeTrial from "@/components/dashboard/AdminDashboard/SystemsSettings/ManageFreeTrial";
import ManageLogo from "@/components/dashboard/AdminDashboard/SystemsSettings/ManageLogo";
import ManageSocialMediaContact from "@/components/dashboard/AdminDashboard/SystemsSettings/ManageSocialMedia";
import MetaManagement from "@/components/dashboard/AdminDashboard/SystemsSettings/MetaManagement";
import SiteStatusManagement from "@/components/dashboard/AdminDashboard/SystemsSettings/SiteStatusManagement";
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
    {
      id: "logo",
      label: "Logo Management",
      component: <ManageLogo />,
    },
    {
      id: "site-status",
      label: "Site Status",
      component: <SiteStatusManagement />,
    },
    {
      id: "languages",
      label: "Language Management",
      component: <LanguageManagement />,
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
