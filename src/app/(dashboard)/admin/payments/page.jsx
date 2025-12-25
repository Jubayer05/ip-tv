"use client";
import GuideManagement from "@/components/dashboard/AdminDashboard/Legal/GuideManagement";
import CardPayment from "@/components/dashboard/AdminDashboard/PaymentManagement/CardPayment";
import PaymentMethodsManagement from "@/components/dashboard/AdminDashboard/PaymentManagement/PaymentMethodsManagement";
import PayGateProvidersManagement from "@/components/dashboard/AdminDashboard/PaymentManagement/PayGateProvidersManagement";
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
      id: "paygate_providers",
      label: "PayGate Providers",
      component: <PayGateProvidersManagement />,
    },
    {
      id: "card_payment",
      label: "Card Payment",
      component: <CardPayment />,
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
    <div className="space-y-4 sm:space-y-6 font-secondary sm:px-6 lg:px-8">
      {/* Tab Navigation */}
      <div className="border-b border-[#212121] px-4">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto flex-wrap">
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
      <div className="px-4">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}
