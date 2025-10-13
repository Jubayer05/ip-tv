"use client";
const PriceSummary = ({
  priceCalculation,
  currentRank,
  appliedCoupon,
  couponResult,
  displayTotals,
  texts,
}) => {
  if (priceCalculation.finalTotal <= 0) return null;

  return (
    <div className="font-secondary max-w-3xl mt-6 mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl">
      <h3 className="text-white font-semibold text-lg mb-4 text-center">
        {texts.priceSummary.title}
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>{texts.priceSummary.basePrice}</span>
          <span>
            {priceCalculation.currency}
            {priceCalculation.basePrice}
          </span>
        </div>

        <div className="flex justify-between">
          <span>
            {texts.priceSummary.devices} ({priceCalculation.effectiveDevices}):
          </span>
          <span>
            {priceCalculation.currency}
            {priceCalculation.pricePerDevice} {texts.priceSummary.perDevice}
          </span>
        </div>

        <div className="flex justify-between">
          <span>{texts.priceSummary.quantity}</span>
          <span>{priceCalculation.quantity}</span>
        </div>

        <div className="flex justify-between">
          <span>{texts.priceSummary.subtotal}:</span>
          <span>
            {priceCalculation.currency}
            {priceCalculation.subtotal}
          </span>
        </div>

        {priceCalculation.bulkDiscountPercentage > 0 && (
          <div className="flex justify-between text-[#00b877]">
            <span>
              {texts.priceSummary.bulkDiscount} (
              {priceCalculation.bulkDiscountPercentage}%{texts.priceSummary.off}
              ):
            </span>
            <span>
              -{priceCalculation.currency}
              {priceCalculation.bulkDiscountAmount}
            </span>
          </div>
        )}

        {priceCalculation.rankDiscountPercentage > 0 && (
          <div className="flex justify-between text-[#00b877]">
            <span>
              {texts.priceSummary.rankDiscount} ({currentRank?.name} -{" "}
              {priceCalculation.rankDiscountPercentage}%{" "}
              {texts.priceSummary.off}):
            </span>
            <span>
              -{priceCalculation.currency}
              {priceCalculation.rankDiscountAmount}
            </span>
          </div>
        )}

        {/* Adult Channels Fee Display */}
        {priceCalculation.adultChannelsFee > 0 && (
          <div className="flex justify-between text-orange-400">
            <span>{texts.priceSummary.adultChannelsFee}:</span>
            <span>
              +{priceCalculation.currency}
              {priceCalculation.adultChannelsFee}
            </span>
          </div>
        )}

        {appliedCoupon && couponResult && (
          <>
            <div className="flex justify-between text-[#00b877]">
              <span>
                {texts.priceSummary.coupon} ({appliedCoupon.code}):
              </span>
              <span>
                -{priceCalculation.currency}
                {displayTotals.couponDiscountAmount}
              </span>
            </div>
            {displayTotals.adultFeeAfterCoupon > 0 && (
              <div className="flex justify-between text-orange-400">
                <span>{texts.priceSummary.adultChannelsFeeAfterCoupon}:</span>
                <span>
                  +{priceCalculation.currency}
                  {displayTotals.adultFeeAfterCoupon}
                </span>
              </div>
            )}
          </>
        )}

        <div className="border-t border-white/20 pt-2 mt-3">
          <div className="flex justify-between text-lg font-bold text-[#00b877]">
            <span>{texts.priceSummary.finalTotal}:</span>
            <span>
              {priceCalculation.currency}
              {appliedCoupon && couponResult
                ? displayTotals.finalTotalWithCoupon
                : priceCalculation.finalTotal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;
