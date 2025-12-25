"use client";
import ProductSchema from "@/components/common/ProductSchema";
import FAQ from "@/components/features/Home/FaqHome";
import PricingBanner from "@/components/features/Pricing/PricingBanner";
import PricingPlan from "@/components/features/Pricing/PricingPlan";
import ReviewInput from "@/components/features/UserReview/ReviewInput";
import ReviewShowHome from "@/components/features/UserReview/ReviewShowHome";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function PricingClient({ serializedProduct }) {
  usePageTracking("packages");

  return (
    <div className="-mt-8 md:-mt-14">
      <div className="mt-14 md:mt-0 md:py-16">
        <PricingBanner />
        <PricingPlan />
        <ReviewShowHome />
        <ReviewInput />
        <FAQ />
      </div>
      {serializedProduct && <ProductSchema product={serializedProduct} />}
    </div>
  );
}
