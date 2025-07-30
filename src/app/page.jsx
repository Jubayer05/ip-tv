import FeatureHome from "@/components/features/Home/FeatureHome";
import LatestTrailers from "@/components/features/Home/LatestTrailers";
import MainBanner from "@/components/features/Home/MainBanner";
import TrendingMovies from "@/components/features/Home/TrendingMovie";
import Link from "next/link";

export default function Home() {
  return (
    <div className="-mt-14">
      <div className="py-16">
        <MainBanner />
        <TrendingMovies />
        <FeatureHome />
        <LatestTrailers />

        <div className="text-center mb-12">
          <h1 className="text-5xl font-primary font-bold text-primary-900 mb-4">
            IP TV Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to our comprehensive IP TV platform. Browse products, manage
            your account, and enjoy premium content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Public Pages */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Public Pages
            </h2>
            <div className="space-y-3">
              <Link
                href="/products"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Products
              </Link>
              <Link
                href="/support"
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Support
              </Link>
              <Link
                href="/support/faq"
                className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/support/contact"
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Authentication */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Authentication
            </h2>
            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Register
              </Link>
              <Link
                href="/forgot-password"
                className="block w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Forgot Password
              </Link>
            </div>
          </div>

          {/* Dashboard */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Dashboard
            </h2>
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/orders"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Orders
              </Link>
              <Link
                href="/dashboard/profile"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/dashboard/support"
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Support
              </Link>
              <Link
                href="/dashboard/affiliate"
                className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Affiliate
              </Link>
              <Link
                href="/dashboard/balance"
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Balance
              </Link>
            </div>
          </div>

          {/* Admin */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Admin Panel
            </h2>
            <div className="space-y-3">
              <Link
                href="/admin"
                className="block w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Admin Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="block w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Users
              </Link>
              <Link
                href="/admin/orders"
                className="block w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Orders
              </Link>
              <Link
                href="/admin/products"
                className="block w-full bg-purple-700 hover:bg-purple-800 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Products
              </Link>
              <Link
                href="/admin/support"
                className="block w-full bg-orange-700 hover:bg-orange-800 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Support
              </Link>
              <Link
                href="/admin/analytics"
                className="block w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Analytics
              </Link>
              <Link
                href="/admin/settings"
                className="block w-full bg-indigo-700 hover:bg-indigo-800 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Settings
              </Link>
              <Link
                href="/admin/coupons"
                className="block w-full bg-pink-700 hover:bg-pink-800 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Coupons
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Legal</h2>
            <div className="space-y-3">
              <Link
                href="/legal/terms"
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/legal/privacy"
                className="block w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/legal/refund"
                className="block w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Refund Policy
              </Link>
            </div>
          </div>

          {/* Components */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Components
            </h2>
            <div className="space-y-3">
              <Link
                href="/components/ui/button"
                className="block w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                UI Components
              </Link>
              <Link
                href="/components/auth/LoginForm"
                className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Auth Components
              </Link>
              <Link
                href="/components/layout/Header"
                className="block w-full bg-yellow-700 hover:bg-yellow-800 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Layout Components
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500">
            IP TV Platform - Complete file structure created successfully
          </p>
        </div>
      </div>
    </div>
  );
}
