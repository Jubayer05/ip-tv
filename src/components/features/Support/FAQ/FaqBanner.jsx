import Button from "@/components/ui/button";
import Polygon from "@/components/ui/polygon";

const FaqBanner = () => {
  return (
    <Polygon
      imageBg="/background/faq_bg.webp"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading">LEARN HOW CHEAP STREAM WORKS</h1>

          <p className="polygon_paragraph">
            We've made watching your favorite movies and live channels easier
            than ever. No cables, no contracts—just non-stop entertainment at a
            price you'll love.
          </p>
          <Button>View Pricing Plans</Button>
        </div>
      </div>
    </Polygon>
  );
};

export default FaqBanner;
