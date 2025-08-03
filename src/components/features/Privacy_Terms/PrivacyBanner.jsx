import Polygon from "@/components/ui/polygon";

const PrivacyBanner = () => {
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
            Privacy Policy
          </h1>

          <p className="text-white text-[14px] font-medium mb-6 leading-tight font-secondary">
            Your privacy matters to us. This Privacy Policy explains how we
            collect, use, protect, and disclose your information when you visit
            or use our IPTV website and services.
          </p>
        </div>
      </div>
    </Polygon>
  );
};

export default PrivacyBanner;
