import TermsOfUseBanner from "@/components/features/Privacy_Terms/TermsUseBanner";
import TermsOfUseSection from "@/components/features/Privacy_Terms/TermsUseContent";

export default function Pricing() {
  return (
    <div className="-mt-14">
      <div className="py-16">
        <TermsOfUseBanner />
        <TermsOfUseSection />
      </div>
    </div>
  );
}
