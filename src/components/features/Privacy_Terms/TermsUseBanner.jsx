import Polygon from "@/components/ui/polygon";

const TermsOfUseBanner = () => {
  return (
    <Polygon
      imageBg="/background/affiliate_bg.webp"
      fullWidth={true}
      className="h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-white text-4xl md:text-[40px] font-bold mb-3 leading-tight">
            Terms of Use
          </h1>

          <p className="text-white text-[14px] font-medium mb-6 leading-tight font-secondary">
            Welcome to our IPTV platform. By accessing, purchasing from, or
            using our website and services, you agree to comply with and be
            bound by the following Terms of Use. Please read them carefully
            before proceeding.
          </p>
        </div>
      </div>
    </Polygon>
  );
};

export default TermsOfUseBanner;
