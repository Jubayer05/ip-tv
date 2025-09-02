import AffiliateBanner from "@/components/features/AffiliateRank/AffilateBanner";
import AffiliateMyLink from "@/components/features/AffiliateRank/AffiliateMyLink";
import AffiliateMyProfile from "@/components/features/AffiliateRank/AffiliateMyProfile";
import BuyPlanCoupon from "@/components/features/AffiliateRank/BuyPlanCoupon";
import DepositPayouts from "@/components/features/AffiliateRank/DepositPayouts";
import RankSystem from "@/components/features/AffiliateRank/RankSystem";
import ReferalOrderHistory from "@/components/features/AffiliateRank/ReferalOrderHistory";

export async function generateMetadata() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();

    if (data.success && data.data.metaManagement?.affiliate) {
      const meta = data.data.metaManagement.affiliate;
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
    title: "Affiliate Program - Cheap Stream | Earn Money with IPTV",
    description:
      "Join Cheap Stream's affiliate program and earn commissions by promoting our premium IPTV services. Start earning money today with our competitive referral system.",
    keywords:
      "affiliate program, IPTV affiliate, earn money online, referral program, Cheap Stream affiliate, streaming affiliate, commission program",
    openGraph: {
      title: "Affiliate Program - Cheap Stream | Earn Money with IPTV",
      description:
        "Join Cheap Stream's affiliate program and earn commissions by promoting our premium IPTV services. Start earning money today with our competitive referral system.",
    },
  };
}

export default function Affiliate() {
  return (
    <div className="-mt-8 md:-mt-14 font-secondary">
      <div className="py-8 sm:py-12 md:py-16">
        <AffiliateBanner />

        {/* Main Content Flexbox Large device */}
        <div className="hidden md:flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12 px-4 sm:px-6 md:px-8 container mx-auto">
          {/* Left Section - 65% width */}
          <div className="w-full lg:w-[65%] space-y-4 sm:space-y-6 md:space-y-8">
            <AffiliateMyLink />
            <RankSystem />
          </div>

          {/* Right Section - 35% width */}
          <div className="w-full lg:w-[35%] space-y-4 sm:space-y-6 md:space-y-8">
            <AffiliateMyProfile />
            <DepositPayouts />
            <BuyPlanCoupon />
          </div>
        </div>

        {/* Main Content Flexbox Small device */}
        <div className="block md:hidden px-4">
          <div className="mt-6 md:mt-0">
            <AffiliateMyLink />
          </div>
          <div className="mt-6 md:mt-0">
            <AffiliateMyProfile />
          </div>
          <div className="mt-6 md:mt-0">
            <RankSystem />
          </div>
          <div className="mt-6 md:mt-0">
            <DepositPayouts />
          </div>
          <div className="mt-6 md:mt-0">
            <BuyPlanCoupon />
          </div>
        </div>

        {/* Bottom Section - Outside flexbox */}
        <div className="mt-8 sm:mt-10 md:mt-12 px-4 sm:px-6 md:px-8 container">
          <ReferalOrderHistory />
        </div>
      </div>
    </div>
  );
}
