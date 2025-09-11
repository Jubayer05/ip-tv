"use client";
import PrivacyPolicyManagement from "@/components/dashboard/AdminDashboard/Legal/PrivacyPolicyManagement";
import TermsConditionsManagement from "@/components/dashboard/AdminDashboard/Legal/TermsConditionsManagement";
import { useState } from "react";

export default function LegalManagement() {
  const [activeTab, setActiveTab] = useState("terms");

  const tabs = [
    {
      id: "terms",
      label: "Terms & Conditions",
      component: <TermsConditionsManagement />,
    },
    // {
    //   id: "guide",
    //   label: "User Guide",
    //   component: <GuideManagement />,
    // },
    {
      id: "privacy",
      label: "Privacy Policy",
      component: <PrivacyPolicyManagement />,
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
