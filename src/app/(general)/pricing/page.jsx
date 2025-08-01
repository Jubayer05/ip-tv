import FAQ from "@/components/features/Home/FaqHome";
import PricingBanner from "@/components/features/Pricing/PricingBanner";
import PricingPlan from "@/components/features/Pricing/PricingPlan";

export default function Pricing() {
  return (
    <div className="-mt-14">
      <div className="py-16">
        <PricingBanner />
        <PricingPlan />
        <FAQ />
      </div>
    </div>
  );
}
