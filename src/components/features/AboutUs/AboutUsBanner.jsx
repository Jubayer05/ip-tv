import Polygon from "@/components/ui/polygon";

const AboutUsBanner = () => {
  return (
    <Polygon
      imageBg="/background/about_us_bg.webp"
      fullWidth={true}
      className="h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center mx-auto">
          {/* Main heading */}
          <h1 className="text-white text-4xl md:text-[40px] font-bold mb-3 leading-tight">
            Streaming Shouldn't Break the Bank. We Make <br /> Sure It Doesn’t.{" "}
          </h1>

          <p className="text-white text-sm font-medium mb-6 leading-tight font-secondary">
            At Cheap Stream, we believe everyone deserves access to top-quality
            entertainment—without expensive cable bills, long-term contracts, or
            complicated setups.
            <br />
            <br />
            We’re a passionate team of streamers, techies, and movie lovers who
            were tired of overpriced services and limited content. So, we
            created a better way.
          </p>
        </div>
      </div>
    </Polygon>
  );
};

export default AboutUsBanner;
