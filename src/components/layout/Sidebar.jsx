"use client";
import { ArrowLeft, CreditCard, History, Monitor } from "lucide-react";
import Link from "next/link";
import { MdOutlineDashboard } from "react-icons/md";

import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: MdOutlineDashboard,
    },
    {
      href: "/dashboard/orders",
      label: "Order History",
      icon: History,
    },
    {
      href: "/dashboard/devices",
      label: "Device Management",
      icon: Monitor,
    },
    {
      href: "/dashboard/payment",
      label: "Payment Methods",
      icon: CreditCard,
    },
  ];

  return (
    <div className="w-64 border border-[#212121] bg-black rounded-[15px] flex flex-col">
      {/* Back to Cheap Stream Link */}
      <div className="p-6 border-b border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Cheap Stream</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 ">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? "text-black bg-primary shadow-lg"
                      : "text-white hover:bg-gray-800"
                  }`}
                >
                  {isActive && (
                    <div className="h-[24px] w-[5px] rounded-r-[3px] bg-[#0e0e11] absolute left-0" />
                  )}
                  <Icon size={20} />
                  <span className="font-semibold text-sm font-secondary ">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
