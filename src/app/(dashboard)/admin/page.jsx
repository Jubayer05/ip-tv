"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BarChart3,
  Gift,
  History,
  Package,
  Settings,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original static texts
  const ORIGINAL_TEXTS = {
    adminDashboard: "Admin Dashboard",
    subtitle: "Manage your system, users, and business operations",
    userManagement: "User Management",
    userManagementDesc: "Manage system users and their roles",
    productManagement: "Product Management",
    productManagementDesc: "Manage products and packages",
    orderManagement: "Order Management",
    orderManagementDesc: "View and manage customer orders",
    analytics: "Analytics",
    analyticsDesc: "View system analytics and reports",
    supportTickets: "Support Tickets",
    supportTicketsDesc: "Handle customer support requests",
    couponManagement: "Coupon Management",
    couponManagementDesc: "Create and manage discount coupons",
    systemSettings: "System Settings",
    systemSettingsDesc: "Configure system-wide settings",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  // Translate texts when language changes
  useEffect(() => {
    if (!isLanguageLoaded || !language) return;

    const translateTexts = async () => {
      const keys = Object.keys(ORIGINAL_TEXTS);
      const values = Object.values(ORIGINAL_TEXTS);

      try {
        const translatedValues = await translate(values);
        const translatedTexts = {};

        keys.forEach((key, index) => {
          translatedTexts[key] = translatedValues[index] || values[index];
        });

        setTexts(translatedTexts);
      } catch (error) {
        console.error("Translation error:", error);
        setTexts(ORIGINAL_TEXTS);
      }
    };

    translateTexts();
  }, [language, isLanguageLoaded, translate]);

  const adminFeatures = [
    {
      title: texts.userManagement,
      description: texts.userManagementDesc,
      href: "/admin/users",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: texts.productManagement,
      description: texts.productManagementDesc,
      href: "/admin/products",
      icon: Package,
      color: "bg-green-500",
    },
    {
      title: texts.orderManagement,
      description: texts.orderManagementDesc,
      href: "/admin/orders",
      icon: History,
      color: "bg-yellow-500",
    },
    {
      title: texts.analytics,
      description: texts.analyticsDesc,
      href: "/admin/analytics",
      icon: BarChart3,
      color: "bg-purple-500",
    },
    {
      title: texts.supportTickets,
      description: texts.supportTicketsDesc,
      href: "/admin/support",
      icon: Ticket,
      color: "bg-red-500",
    },
    {
      title: texts.couponManagement,
      description: texts.couponManagementDesc,
      href: "/admin/coupons",
      icon: Gift,
      color: "bg-pink-500",
    },
    {
      title: texts.systemSettings,
      description: texts.systemSettingsDesc,
      href: "/admin/settings",
      icon: Settings,
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {texts.adminDashboard}
          </h1>
          <p className="text-gray-400">{texts.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-all duration-200 hover:transform hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className={`${feature.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
