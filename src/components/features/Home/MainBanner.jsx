import Button from "@/components/ui/button";
import Polygon from "@/components/ui/polygon";

const MainBanner = () => {
  return (
    <Polygon imageBg="/background/banner_bg.webp">
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading">
            YOUR TICKET TO ENDLESS
            <br />
            <span className="text-primary">ENTERTAINMENT</span>
          </h1>

          <p className="polygon_paragraph">
            Why pay more when you can stream smarter? Cheap Stream brings you
            thousands of movies at the best price. Whether you love action,
            drama, comedy, or horror, we have something for everyone—all in HD &
            4K quality with zero buffering.
          </p>

          {/* Email input and button */}
          <div className="flex flex-col font-secondary sm:flex-row items-center justify-center gap-4 max-w-md mx-auto relative border-1 border-[#808080]/70 rounded-full">
            <div className="relative w-full sm:flex-1">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-6 pr-32 py-4 bg-[rgba(128,128,128,0.7)] border border-gray-600 rounded-full text-white placeholder-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                <Button size="lg">Get Started</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Polygon>
  );
};

export default MainBanner;
