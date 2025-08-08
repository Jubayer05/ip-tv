import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import PolygonUpperLine from "@/components/ui/polygonUpperLine";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <PolygonUpperLine fullWidth>
        <div className="bg-[#0e0e11] pb-8 sm:pb-16">
          <div className="h-[150px] sm:h-[180px] md:h-[220px] flex flex-col font-secondary justify-end items-center pb-4 sm:pb-6 md:pb-8 px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[40px] font-bold text-center">
              👋 Welcome back, VIPSTO
            </h2>
            <p className="text-gray-400 text-center mt-2 sm:mt-4 text-sm sm:text-base">
              Manage your account and track your orders
            </p>
          </div>

          <div className="container flex flex-col md:flex-row gap-6">
            <div className="px-4">
              <Sidebar />
            </div>
            <main className="flex-1 max-w-5xl mx-auto">{children}</main>
          </div>
        </div>
      </PolygonUpperLine>
    </ProtectedRoute>
  );
}
