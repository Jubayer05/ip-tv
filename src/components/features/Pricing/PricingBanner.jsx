import Button from "@/components/ui/button";
import Polygon from "@/components/ui/polygon";

const PricingBanner = () => {
  return (
    <Polygon
      imageBg="/background/pricing_bg.jpg"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-4 md:px-6 h-polygon">
        <div className="text-center max-w-[1000px] mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading uppercase">
            Watch More, Pay Less –{" "}
            <span className="text-primary">Choose Your Streaming Plans</span>
          </h1>

          <p className="polygon_paragraph">
            At Cheap Stream, we believe in affordable entertainment without
            sacrificing quality. Whether you're a casual viewer or a full-on
            movie marathoner, we’ve got a plan that fits your lifestyle—and your
            budget.
          </p>

          {/* Email input and button */}
          <Button size="md" className="font-secondary mt-4">
            Start with a Free Trial!
          </Button>
          <p className="mt-4 polygon_paragraph">
            *Try Cheap Stream free for 24 hours—no credit card required!
          </p>
        </div>
      </div>
    </Polygon>
  );
};

export default PricingBanner;
