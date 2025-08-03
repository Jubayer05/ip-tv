import Sidebar from "@/components/layout/Sidebar";
import PolygonUpperLine from "@/components/ui/polygonUpperLine";

export default function DashboardLayout({ children }) {
  return (
    <PolygonUpperLine fullWidth>
      <div className="bg-[#0e0e11] pb-16">
        <div className="h-[220px] flex flex-col font-secondary justify-end items-center pb-8">
          <h2 className="text-[40px] font-bold">👋 Welcome back, VIPSTORE</h2>
          <p className="text-sm text-white">
            Here’s your account overview, current subscription, and recent
            activity.
          </p>
        </div>
        <div className="container flex gap-6">
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Content */}
            <main className="border border-[#212121] bg-black rounded-[15px] p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </PolygonUpperLine>
  );
}
