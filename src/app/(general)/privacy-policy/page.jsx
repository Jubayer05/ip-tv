"use client";
import PrivacyBanner from "@/components/features/Privacy_Terms/PrivacyBanner";
import PrivacyPolicySection from "@/components/features/Privacy_Terms/PrivacyPolicyContent";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function Pricing() {
  usePageTracking("privacy-policy");

  return (
    <div className="-mt-8 md:-mt-14">
      <div className="py-16">
        <PrivacyBanner />
        <PrivacyPolicySection />
      </div>
    </div>
  );
}
