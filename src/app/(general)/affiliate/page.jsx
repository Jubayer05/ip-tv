import AffiliateBanner from "@/components/features/AffiliateRank/AffilateBanner";
import AffiliateMyLink from "@/components/features/AffiliateRank/AffiliateMyLink";
import AffiliateMyProfile from "@/components/features/AffiliateRank/AffiliateMyProfile";
import BuyPlanCoupon from "@/components/features/AffiliateRank/BuyPlanCoupon";
import DepositPayouts from "@/components/features/AffiliateRank/DepositPayouts";
import RankSystem from "@/components/features/AffiliateRank/RankSystem";
import ReferalOrderHistory from "@/components/features/AffiliateRank/ReferalOrderHistory";

export default function Affiliate() {
  return (
    <div className="-mt-14 font-secondary">
      <div className="py-16">
        <AffiliateBanner />

        {/* Main Content Flexbox */}
        <div className="flex gap-8 mt-12 px-4 container mx-auto">
          {/* Left Section - 65% width */}
          <div className="w-[65%] space-y-8">
            <AffiliateMyLink />
            <RankSystem />
          </div>

          {/* Right Section - 35% width */}
          <div className="w-[35%] space-y-8">
            <AffiliateMyProfile />
            <DepositPayouts />
            <BuyPlanCoupon />
          </div>
        </div>

        {/* Bottom Section - Outside flexbox */}
        <div className="mt-12 px-4 container">
          <ReferalOrderHistory />
        </div>
      </div>
    </div>
  );
}
