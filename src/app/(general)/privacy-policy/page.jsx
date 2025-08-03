import PrivacyBanner from "@/components/features/Privacy_Terms/PrivacyBanner";
import PrivacyPolicySection from "@/components/features/Privacy_Terms/PrivacyPolicyContent";

export default function Pricing() {
  return (
    <div className="-mt-14">
      <div className="py-16">
        <PrivacyBanner />
        <PrivacyPolicySection />
      </div>
    </div>
  );
}
