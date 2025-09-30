"use client";
import GuideManagement from "@/components/dashboard/AdminDashboard/Legal/GuideManagement";
import PaymentMethodsManagement from "@/components/dashboard/AdminDashboard/PaymentManagement/PaymentMethodsManagement";
import UsersBalance from "@/components/dashboard/AdminDashboard/PaymentManagement/UsersBalances";
import { useState } from "react";

export default function paymentManagement() {
  const [activeTab, setActiveTab] = useState("payment_methods");

  const tabs = [
    {
      id: "payment_methods",
      label: "Payment Methods",
      component: <PaymentMethodsManagement />,
    },
    {
      id: "guide",
      label: "User Guide",
      component: <GuideManagement />,
    },
    {
      id: "users_balance",
      label: "Users Balances",
      component: <UsersBalance />,
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
