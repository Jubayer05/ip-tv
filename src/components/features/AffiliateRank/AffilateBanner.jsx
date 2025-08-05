import Polygon from "@/components/ui/polygon";

const AffiliateBanner = () => {
  return (
    <Polygon
      imageBg="/background/affiliate_bg.webp"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading">Invite. Earn. Upgrade Your Rank. </h1>

          <p className="polygon_paragraph">
            Become a part of our Affiliate & Referral Program and earn rewards
            every time someone joins through your link—or when you spend more
            yourself. Whether <br /> you're a casual user or a loyal pro,
            there's something here for you.
          </p>
        </div>
      </div>
    </Polygon>
  );
};

export default AffiliateBanner;
