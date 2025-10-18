"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MaintenanceWrapper = ({ children }) => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const pathname = usePathname();

  // Skip maintenance check for admin routes
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) {
      setIsChecking(false);
      return;
    }

    const checkMaintenance = async () => {
      try {
        console.log("Checking maintenance status...");
        const response = await fetch(
          `/maintenance-status.json?t=${Date.now()}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
              Pragma: "no-cache",
            },
          }
        );

        console.log("Maintenance response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Maintenance data:", data);
          setIsMaintenance(data.isMaintenanceMode);
          setMaintenanceMessage(
            data.maintenanceMessage ||
              "We're currently performing maintenance. Please check back later."
          );
        } else {
          console.error("Failed to fetch maintenance status:", response.status);
        }
      } catch (error) {
        console.error("Error checking maintenance:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkMaintenance();
  }, [isAdminRoute]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b877] mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show maintenance page if in maintenance mode
  if (isMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,184,119,0.1)_0%,transparent_50%)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,184,119,0.1)_0%,transparent_50%)] animate-pulse delay-1000"></div>
        </div>

        <div className="text-center max-w-2xl mx-auto p-6 relative z-10">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#00b877] to-[#00d4aa] rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-2xl shadow-[#00b877]/30 animate-pulse">
            CS
          </div>

          {/* Icon */}
          <div className="text-6xl mb-6 animate-bounce">🔧</div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#00b877] to-[#00d4aa] bg-clip-text text-transparent">
            Under Maintenance
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-300 mb-8 font-light">
            We're working hard to improve your experience
          </p>

          {/* Status indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-medium mb-8">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Maintenance in Progress</span>
          </div>

          {/* Message */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <p className="text-lg text-gray-200 leading-relaxed">
              {maintenanceMessage}
            </p>
          </div>

          {/* Contact info */}
          <div className="bg-[#00b877]/10 border border-[#00b877]/20 rounded-lg p-4">
            <p className="text-gray-300 text-sm mb-2">
              Need immediate assistance?
            </p>
            <p className="text-sm">
              Contact us at{" "}
              <a
                href="mailto:support@cheapstream.com"
                className="text-[#00b877] hover:text-[#00d4aa] transition-colors font-medium"
              >
                support@cheapstream.com
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm">
            © 2024 Cheap Stream. All rights reserved.
          </div>
        </div>
      </div>
    );
  }

  // Show normal content if not in maintenance
  return children;
};

export default MaintenanceWrapper;
