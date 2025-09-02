import FAQ from "@/components/features/Home/FaqHome";
import PricingBanner from "@/components/features/Pricing/PricingBanner";
import PricingPlan from "@/components/features/Pricing/PricingPlan";
import ReviewInput from "@/components/features/UserReview/ReviewInput";

export async function generateMetadata() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();

    if (data.success && data.data.metaManagement?.packages) {
      const meta = data.data.metaManagement.packages;
      return {
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        openGraph: {
          title: meta.openGraph.title,
          description: meta.openGraph.description,
        },
      };
    }
  } catch (error) {
    console.error("Failed to fetch meta settings:", error);
  }

  // Fallback metadata
  return {
    title: "Packages & Pricing - Cheap Stream | Affordable IPTV Plans",
    description:
      "Choose from our affordable IPTV packages with flexible plans, premium channels, and competitive pricing. Start streaming today with Cheap Stream.",
    keywords:
      "IPTV packages, streaming plans, affordable IPTV, premium channels, Cheap Stream pricing, IPTV subscription, streaming packages",
    openGraph: {
      title: "Packages & Pricing - Cheap Stream | Affordable IPTV Plans",
      description:
        "Choose from our affordable IPTV packages with flexible plans, premium channels, and competitive pricing. Start streaming today with Cheap Stream.",
    },
  };
}

export default function Pricing() {
  return (
    <div className="-mt-8 md:-mt-14">
      <div className="mt-14 md:mt-0 md:py-16">
        <PricingBanner />
        <PricingPlan />
        <ReviewInput />
        <FAQ />
      </div>
    </div>
  );
}
