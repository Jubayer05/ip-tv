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

export default function AdminPage() {
  const adminFeatures = [
    {
      title: "User Management",
      description: "Manage system users and their roles",
      href: "/admin/users",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Product Management",
      description: "Manage products and packages",
      href: "/admin/products",
      icon: Package,
      color: "bg-green-500",
    },
    {
      title: "Order Management",
      description: "View and manage customer orders",
      href: "/admin/orders",
      icon: History,
      color: "bg-yellow-500",
    },
    {
      title: "Analytics",
      description: "View system analytics and reports",
      href: "/admin/analytics",
      icon: BarChart3,
      color: "bg-purple-500",
    },
    {
      title: "Support Tickets",
      description: "Handle customer support requests",
      href: "/admin/support",
      icon: Ticket,
      color: "bg-red-500",
    },
    {
      title: "Coupon Management",
      description: "Create and manage discount coupons",
      href: "/admin/coupons",
      icon: Gift,
      color: "bg-pink-500",
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings",
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
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your system, users, and business operations
          </p>
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
