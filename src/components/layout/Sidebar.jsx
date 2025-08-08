"use client";
import { ArrowLeft, CreditCard, History, List, Monitor } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MdOutlineDashboard } from "react-icons/md";

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Reset sidebar to collapsed state when pathname changes
  useEffect(() => {
    setIsExpanded(false);
    // Snap to top on route change (helps mobile)
    if (typeof window !== "undefined") {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Function to handle navigation, scroll to top, and collapse sidebar
  const handleNavigation = () => {
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Collapse sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      // md breakpoint
      setIsExpanded(false);
    }
  };

  return (
    <div
      className={`w-full md:w-64 transition-all duration-300 ease-in-out border border-[#212121] bg-black md:rounded-[15px] flex flex-col ${
        isExpanded ? "h-screen md:h-full" : "h-[48px] md:h-full"
      } overflow-hidden`}
    >
      {/* Back to Cheap Stream Link */}
      <div
        className={`p-6 border-b border-gray-800 transition-all duration-300 ${
          isExpanded ? "block" : "hidden md:block"
        }`}
      >
        <Link
          href="/"
          onClick={handleNavigation}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Cheap Stream</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav
        className={`flex-1 transition-all duration-300 ${
          isExpanded ? "block" : "hidden md:block"
        }`}
      >
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li
                key={item.href}
                className={`relative flex items-center justify-between gap-3 transition-all duration-200 ${
                  isActive
                    ? "text-black bg-primary shadow-lg rounded-lg md:mx-2"
                    : "text-white hover:bg-gray-800/50 rounded-lg md:mx-2"
                }`}
              >
                <Link
                  href={item.href}
                  scroll={true}
                  onClick={handleNavigation}
                  className={`relative flex items-center gap-3 px-4 py-3 transition-all duration-200 w-full rounded-lg`}
                >
                  {isActive && (
                    <div className="h-[24px] w-[5px] rounded-r-[3px] bg-[#0e0e11] absolute left-0" />
                  )}
                  <Icon size={20} />
                  <span className="font-semibold text-sm font-secondary">
                    {item.label}
                  </span>
                </Link>
                {/* List icon only on mobile devices */}
                {isActive && (
                  <button
                    onClick={toggleExpanded}
                    className="mr-4 p-1 hover:bg-black/20 rounded transition-colors md:hidden"
                  >
                    <List
                      className={`transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile: Show only active item when collapsed */}
      {!isExpanded && (
        <div className="md:hidden">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (isActive) {
              return (
                <div
                  key={item.href}
                  className="relative flex items-center justify-between gap-3 text-black bg-primary shadow-lg h-[48px] rounded-lg md:mx-2"
                >
                  <Link
                    href={item.href}
                    scroll={true}
                    onClick={handleNavigation}
                    className="relative flex items-center gap-3 px-4 py-3 transition-all duration-200 w-full rounded-lg"
                  >
                    <div className="h-[24px] w-[5px] rounded-r-[3px] bg-[#0e0e11] absolute left-0" />
                    <Icon size={20} />
                    <span className="font-semibold text-sm font-secondary">
                      {item.label}
                    </span>
                  </Link>
                  <button
                    onClick={toggleExpanded}
                    className="mr-4 p-1 hover:bg-black/20 rounded transition-colors"
                  >
                    <List className="transition-transform duration-300" />
                  </button>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
