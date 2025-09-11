"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  CreditCard,
  Gift,
  HelpCircle,
  History,
  List,
  Monitor,
  Package,
  Scale,
  Settings,
  Shield,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IoDocument } from "react-icons/io5";
import { MdOutlineDashboard, MdReviews } from "react-icons/md";

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const { language, translate } = useLanguage();
  const { user, hasAdminAccess, isSuperAdminUser } = useAuth();

  const ORIGINAL_BACK_TO_TEXT = "Back to Cheap Stream";

  // User menu items (regular users)
  // User menu items (regular users)
  const ORIGINAL_USER_MENU_ITEMS = [
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
    {
      href: "/dashboard/support",
      label: "Support Tickets",
      icon: Ticket,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  // Admin menu items (admin, support, super admin)
  // ...
  // Admin menu items (admin, support, super admin)
  const ORIGINAL_ADMIN_MENU_ITEMS = [
    {
      href: "/admin",
      label: "Admin Dashboard",
      icon: BarChart3,
    },
    {
      href: "/admin/users",
      label: "User Management",
      icon: Users,
    },
    {
      href: "/admin/orders",
      label: "Order Management",
      icon: History,
    },
    {
      href: "/admin/products",
      label: "Product Management",
      icon: Package,
    },
    {
      href: "/admin/coupons",
      label: "Coupon Management",
      icon: Gift,
    },
    {
      href: "/admin/affiliate",
      label: "Affiliate Management",
      icon: Gift,
    },
    {
      href: "/admin/rank-system",
      label: "Rank System",
      icon: BarChart3,
    },
    {
      href: "/admin/support",
      label: "Support Tickets",
      icon: Ticket,
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      href: "/admin/faq", // Add new FAQ management route
      label: "FAQ Management",
      icon: HelpCircle, // Use HelpCircle icon for FAQ
    },
    {
      href: "/admin/bulk-notification",
      label: "Bulk & Notification",
      icon: Bell,
    },
    {
      href: "/admin/review",
      label: "Review Management",
      icon: MdReviews,
    },
    {
      href: "/admin/blog",
      label: "Blogs Management",
      icon: IoDocument,
    },
    {
      href: "/admin/legal",
      label: "Legal Management",
      icon: Scale,
    },
    {
      href: "/admin/payments",
      label: "Payment Management",
      icon: Shield,
    },
    {
      href: "/admin/settings",
      label: "System Settings",
      icon: Settings,
    },
  ];

  const SUPPORT_ONLY_MENU = [
    {
      href: "/admin/support",
      label: "Support Tickets",
      icon: Ticket,
    },
  ];

  // Determine which menu items to show based on user role
  const getMenuItems = () => {
    if (user.role === "support") {
      return SUPPORT_ONLY_MENU;
    }
    if (hasAdminAccess()) {
      // If support (and not super admin), show only Support menu
      return ORIGINAL_ADMIN_MENU_ITEMS;
    }
    return ORIGINAL_USER_MENU_ITEMS;
  };

  const [backToText, setBackToText] = useState(ORIGINAL_BACK_TO_TEXT);
  const [menuItems, setMenuItems] = useState(getMenuItems());

  useEffect(() => {
    // Update menu items when user role changes
    setMenuItems(getMenuItems());
  }, [user.role, hasAdminAccess]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const currentMenuItems = getMenuItems();
      const items = [
        ORIGINAL_BACK_TO_TEXT,
        ...currentMenuItems.map((item) => item.label),
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [tBackToText, ...tMenuLabels] = translated;

      setBackToText(tBackToText);

      // Update menu items with translated labels
      const updatedMenuItems = currentMenuItems.map((item, index) => ({
        ...item,
        label: tMenuLabels[index],
      }));
      setMenuItems(updatedMenuItems);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, user.role, hasAdminAccess]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <span className="font-medium">{backToText}</span>
        </Link>
      </div>

      {/* Role indicator for admin users */}
      {hasAdminAccess() && (
        <div
          className={`px-6 py-3 border-b border-gray-800 transition-all duration-300 ${
            isExpanded ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-sm font-medium">
              {isSuperAdminUser()
                ? "Super Admin"
                : user.role === "admin"
                ? "Administrator"
                : "Support"}
            </span>
          </div>
        </div>
      )}

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
