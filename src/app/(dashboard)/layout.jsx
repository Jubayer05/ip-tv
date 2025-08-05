import Sidebar from "@/components/layout/Sidebar";
import PolygonUpperLine from "@/components/ui/polygonUpperLine";

export default function DashboardLayout({ children }) {
  return (
    <PolygonUpperLine fullWidth>
      <div className="bg-[#0e0e11] pb-8 sm:pb-16">
        <div className="h-[150px] sm:h-[180px] md:h-[220px] flex flex-col font-secondary justify-end items-center pb-4 sm:pb-6 md:pb-8 px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[40px] font-bold text-center">
            👋 Welcome back, VIPSTORE
          </h2>
          <p className="text-xs sm:text-sm text-white text-center mt-2 sm:mt-3">
            Here's your account overview, current subscription, and recent
            activity.
          </p>
        </div>
        <div className="container flex flex-col lg:flex-row gap-4 sm:gap-6 px-4 sm:px-6 md:px-8">
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Content */}
            <main className="border border-[#212121] bg-black rounded-[15px] p-3 sm:p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </PolygonUpperLine>
  );
}
