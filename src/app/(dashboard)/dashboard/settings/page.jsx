"use client";
import ChangePassword from "@/components/features/UserDashboard/ChangePassword";
import UpdateProfile from "@/components/features/UserDashboard/UpdateProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

export default function ProfilePage() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [activeTab, setActiveTab] = useState("profile");

  const ORIGINAL_TEXTS = {
    updateProfile: "Update Profile",
    changePassword: "Change Password",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  const tabs = [
    {
      id: "profile",
      label: texts.updateProfile,
      component: <UpdateProfile />,
    },
    {
      id: "password",
      label: texts.changePassword,
      component: <ChangePassword />,
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
