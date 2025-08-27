import { RiFireFill } from "react-icons/ri";

const SubscriptionPlans = ({
  product,
  selectedPlan,
  setSelectedPlan,
  texts,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-6 sm:gap-4 mb-6 sm:mb-8 px-2 sm:px-6">
      {product.variants.map((variant, index) => (
        <div
          key={variant.id || index}
          className={`relative border bg-[#0e0e11] rounded-lg p-3 sm:p-4 md:p-5 cursor-pointer transition-all duration-200 ${
            selectedPlan === index
              ? "border-[#FFFFFF26] md:border-primary"
              : "border-[#FFFFFF26]"
          }`}
          onClick={() => setSelectedPlan(index)}
        >
          {variant.recommended && (
            <div className="absolute w-full mx-auto -top-4 sm:-top-5 left-1/2 transform -translate-x-1/2 bg-cyan-400 text-black px-3 sm:px-4 py-1 rounded-t-[20px] text-xs font-semibold flex items-center justify-center gap-1 font-secondary">
              <span>
                <RiFireFill />
              </span>
              <span className="hidden sm:inline">
                {texts.controls.devices.recommended}
              </span>
              <span className="sm:hidden">Rec.</span>
            </div>
          )}

          <div className="text-left font-secondary">
            <h3 className="text-white font-bold text-lg sm:text-xl md:text-2xl mb-1 font-primary">
              {variant.name}
            </h3>
            <p className="text-[#AFAFAF] text-[10px] sm:text-sm mb-2 sm:mb-3">
              {variant.description}
            </p>
            <div className="text-white text-base sm:text-lg font-bold mb-3 sm:mb-4">
              {variant.durationMonths}{" "}
              {variant.durationMonths === 1 ? "MONTH" : "MONTHS"}
            </div>

            {/* Features Section */}
            <div className="space-y-2">
              <p className="text-[#AFAFAF] text-xs mb-2 sm:mb-3">Features:</p>
              <div className="space-y-[8px] sm:space-y-[10px]">
                {variant.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-2">
                    <span
                      className={`text-xs mt-0.5 ${
                        feature.included ? "text-[#00b877]" : "text-gray-500"
                      }`}
                    >
                      {feature.included ? "✓" : "✗"}
                    </span>
                    <span className="text-white text-[10px] sm:text-sm leading-tight">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Section */}
            <div className="mt-6 text-center border-t border-white/10 pt-4">
              <div className="mb-2">
                <span className="text-white/60 text-sm font-medium">
                  Starting at
                </span>
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-cyan-400 text-2xl sm:text-3xl font-bold">
                  {variant.currency === "USD"
                    ? "$"
                    : variant.currency === "EUR"
                    ? "€"
                    : variant.currency === "GBP"
                    ? "£"
                    : variant.currency}
                  {variant.price}
                </span>
              </div>
              <div className="text-white/60 text-xs">
                per{" "}
                {variant.durationMonths === 1
                  ? "month"
                  : `${variant.durationMonths} months`}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionPlans;
