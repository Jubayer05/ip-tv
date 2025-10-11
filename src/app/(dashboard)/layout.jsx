import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import PolygonUpperLine from "@/components/ui/polygonUpperLine";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <PolygonUpperLine fullWidth></PolygonUpperLine>
      <div className="bg-[#000000] pb-8 sm:pb-16">
        <div className="flex flex-col font-secondary justify-end items-center pb-4 sm:pb-6 md:pb-8 px-4 pt-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[40px] font-bold text-center">
            👋 Welcome back, VIPSTO
          </h2>
          <p className="text-gray-400 text-center mt-2 sm:mt-4 text-sm sm:text-base">
            Manage your account and track your orders
          </p>
        </div>

        <div className="container flex flex-col md:flex-row gap-6">
          <div className="sticky z-10 md:block top-0 px-2 md:px-4 ">
            <Sidebar />
            <div className="h-[1px] w-full bg-gray-800"></div>
          </div>
          <main className="flex-1 max-w-5xl mx-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
