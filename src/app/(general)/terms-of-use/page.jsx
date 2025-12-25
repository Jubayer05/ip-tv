"use client";
import TermsOfUseBanner from "@/components/features/Privacy_Terms/TermsUseBanner";
import TermsOfUseSection from "@/components/features/Privacy_Terms/TermsUseContent";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function Pricing() {
  usePageTracking("terms-of-use");

  return (
    <div className="-mt-8 md:-mt-14">
      <div className="py-16">
        <TermsOfUseBanner />
        <TermsOfUseSection />
      </div>
    </div>
  );
}
