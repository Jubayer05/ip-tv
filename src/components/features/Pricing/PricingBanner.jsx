import Button from "@/components/ui/button";
import Polygon from "@/components/ui/polygon";

const PricingBanner = () => {
  return (
    <Polygon
      imageBg="/background/pricing_bg.jpg"
      fullWidth={true}
      className="h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-white text-4xl md:text-[40px] font-bold mb-3 leading-tight">
            Watch More, Pay Less –{" "}
            <span className="text-primary">Choose Your Streaming Plans</span>
          </h1>

          <p className="text-white text-[14px] font-medium mb-6 leading-tight font-secondary">
            At Cheap Stream, we believe in affordable entertainment without
            sacrificing quality. Whether you're a casual viewer or a full-on
            movie marathoner, we’ve got a plan that fits your lifestyle—and your
            budget.
          </p>

          {/* Email input and button */}
          <Button size="md" className="font-secondary mt-4">
            Start with a Free Trial!
          </Button>
          <p className="text-white text-[14px] font-medium mt-4 leading-tight font-secondary">
            *Try Cheap Stream free for 24 hours—no credit card required!
          </p>
        </div>
      </div>
    </Polygon>
  );
};

export default PricingBanner;
