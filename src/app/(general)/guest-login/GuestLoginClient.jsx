"use client";
import GuestLoginComponent from "@/components/features/Auth/GuestLoginComponent";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function GuestLoginClient() {
  usePageTracking("guest-login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="">
          <GuestLoginComponent />
        </div>
      </div>
    </div>
  );
}
