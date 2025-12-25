"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  CreditCard,
  ExternalLink,
  FileText,
  Gift,
  HelpCircle,
  History,
  Key,
  List,
  Megaphone,
  MessageCircle,
  MessageSquare,
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

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [cardPaymentEnabled, setCardPaymentEnabled] = useState(false);
  const { language, translate } = useLanguage();
  const { user, hasAdminAccess, isSuperAdminUser } = useAuth();
  // Initial user menu items WITHOUT Payment Methods
  const initialUserMenuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
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

  const [userDashMenu, setUserDashMenu] = useState(initialUserMenuItems);

  // Fetch and update menu based on payment settings
  useEffect(() => {
    const fetchCardPaymentSettings = async () => {
      try {
        const response = await fetch("/api/settings/card-payment");
        const data = await response.json();

        if (data.success && data.data?.isEnabled) {
          // Payment enabled - insert Payment Methods item at position 3 (after devices, before support)
          setUserDashMenu((prev) => [
            ...prev.slice(0, 3),
            {
              href: "/dashboard/payment",
              label: "Payment Methods",
              icon: CreditCard,
            },
            ...prev.slice(3),
          ]);
        } else {
          // Payment disabled - keep original menu
          setUserDashMenu(initialUserMenuItems);
        }
      } catch (error) {
        console.error("Error fetching card payment settings:", error);
        setUserDashMenu(initialUserMenuItems);
      }
    };

    fetchCardPaymentSettings();
  }, []);

  const ORIGINAL_BACK_TO_TEXT = "Back to Cheap Stream";

  // Fetch card payment settings
  const fetchCardPaymentSettings = async () => {
    try {
      const response = await fetch("/api/settings/card-payment");
      const data = await response.json();
      if (data.success) {
        setCardPaymentEnabled(data.data.isEnabled);
      }
    } catch (error) {
      console.error("Error fetching card payment settings:", error);
    }
  };

  useEffect(() => {
    fetchCardPaymentSettings();
  }, []);

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
      href: "/admin/contact",
      label: "Contact Form",
      icon: MessageCircle,
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      href: "/admin/faq",
      label: "FAQ Management",
      icon: HelpCircle,
    },
    {
      href: "/admin/bulk-notification",
      label: "Bulk & Notification",
      icon: Bell,
    },
    {
      href: "/admin/review",
      label: "Review Management",
      icon: MessageSquare,
    },
    {
      href: "/admin/blog",
      label: "Blogs Management",
      icon: FileText,
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
      href: "/admin/ads", // Add new ad management route
      label: "Ad Management",
      icon: Megaphone, // Use Megaphone icon for ads
    },
    {
      href: "/admin/login-api",
      label: "Login & API Management",
      icon: Key,
    },
    {
      href: "/admin/settings",
      label: "System Settings",
      icon: Settings,
    },
    {
      href: "/admin/url-tracking",
      label: "URL Tracking",
      icon: ExternalLink,
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
    if (user?.role === "support") {
      return SUPPORT_ONLY_MENU;
    }
    if (hasAdminAccess()) {
      return ORIGINAL_ADMIN_MENU_ITEMS;
    }
    return userDashMenu;
  };

  const [backToText, setBackToText] = useState(ORIGINAL_BACK_TO_TEXT);
  const [menuItems, setMenuItems] = useState([]);

  // Update menu items when user role or card payment settings change
  useEffect(() => {
    const currentMenuItems = getMenuItems();
    setMenuItems(currentMenuItems);
  }, [user?.role, hasAdminAccess, cardPaymentEnabled]);

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
  }, [language.code, user?.role, hasAdminAccess, cardPaymentEnabled]); // Add cardPaymentEnabled to dependencies

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

  // Don't render if user is not available
  if (!user) {
    return null;
  }

  return (
    <div
      className={`w-full md:w-[300px] min-h-[48px] transition-all duration-300 ease-in-out border border-[#212121] bg-black md:rounded-[15px] flex flex-col overflow-hidden z-50 md:z-auto ${
        isExpanded ? "h-screen" : "h-[48px] md:h-screen"
      }`}
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

      {/* User Info - Only show when expanded */}
      {isExpanded && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user.name}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400 text-sm font-medium">
                  {isSuperAdminUser()
                    ? "Super Admin"
                    : user.role === "admin"
                    ? "Admin"
                    : user.role === "support"
                    ? "Support"
                    : "User"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu - Now scrollable */}
      <nav
        className={`flex-1 transition-all duration-300 overflow-y-auto ${
          isExpanded ? "block" : "hidden md:block"
        }`}
        style={{
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* IE and Edge */,
        }}
      >
        <style jsx>{`
          nav::-webkit-scrollbar {
            display: none; /* Chrome, Safari and Opera */
          }
        `}</style>
        <ul className="space-y-2 p-4">
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
          {(() => {
            const activeItem =
              menuItems.find(
                (i) => pathname === i.href || pathname.startsWith(i.href + "/")
              ) || menuItems[0];

            if (!activeItem) return null;
            const Icon = activeItem.icon;

            return (
              <div className="relative flex items-center justify-between gap-3 text-black bg-primary shadow-lg h-[48px] rounded-lg md:mx-2">
                <Link
                  href={activeItem.href}
                  scroll={true}
                  onClick={handleNavigation}
                  className="relative flex items-center gap-3 px-4 py-3 transition-all duration-200 w-full rounded-lg"
                >
                  <div className="h-[24px] w-[5px] rounded-r-[3px] bg-[#0e0e11] absolute left-0" />
                  <Icon size={20} />
                  <span className="font-semibold text-sm font-secondary">
                    {activeItem.label || "Menu"}
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
          })()}
        </div>
      )}
    </div>
  );
}
