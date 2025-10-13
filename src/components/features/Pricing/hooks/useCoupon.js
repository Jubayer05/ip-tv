import { useMemo, useState } from "react";

export const useCoupon = (priceCalculation, accountConfigurations, product) => {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Helper to compute the amount that coupon applies on (after bulk + rank)
  const amountEligibleForCoupon = () => {
    if (!priceCalculation || !priceCalculation.afterRankDiscount) {
      return 0;
    }
    return priceCalculation.afterRankDiscount; // apply coupon after rank+bulk, before adult fee
  };

  const applyCoupon = async () => {
    setCouponError("");
    setCouponResult(null);
    setAppliedCoupon(null);
    const code = (couponCode || "").trim();
    if (!code) return;

    try {
      const amount = amountEligibleForCoupon();
      if (!amount || amount <= 0) {
        setCouponError("Amount must be greater than 0");
        return;
      }

      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount }),
      });

      const data = await res.json();
      if (!data.success) {
        setCouponError(data.error || "Invalid coupon");
        return;
      }

      setAppliedCoupon(data.coupon);
      setCouponResult({
        discountAmount: data.discountAmount,
        finalOnEligible: data.finalTotal,
      });
    } catch (e) {
      setCouponError("Validation failed");
    }
  };

  // Check if any account has adult channels enabled
  const hasAnyAdultChannels = useMemo(() => {
    if (!accountConfigurations || accountConfigurations.length === 0)
      return false;
    return accountConfigurations.some((config) => config.adultChannels);
  }, [accountConfigurations]);

  // derive final total incl. adult fee, after coupon if applied
  const displayTotals = useMemo(() => {
    // Handle case when priceCalculation is undefined
    if (!priceCalculation) {
      return {
        couponDiscountAmount: 0,
        finalTotalWithCoupon: 0,
        adultFeeAfterCoupon: 0,
      };
    }

    const base = {
      ...priceCalculation,
      couponDiscountAmount: 0,
      finalTotalWithCoupon: priceCalculation.finalTotal,
    };

    if (appliedCoupon && couponResult) {
      const afterCouponEligible = couponResult.finalOnEligible;

      // Recalculate adult fee based on discounted amount
      let adultFee = 0;
      if (hasAnyAdultChannels) {
        adultFee =
          (afterCouponEligible * (product?.adultChannelsFeePercentage || 20)) /
          100;
      }

      const finalTotalWithCoupon =
        Math.round((afterCouponEligible + adultFee) * 100) / 100;

      return {
        ...base,
        couponDiscountAmount:
          Math.round(couponResult.discountAmount * 100) / 100,
        finalTotalWithCoupon,
        adultFeeAfterCoupon: Math.round(adultFee * 100) / 100,
      };
    }
    return base;
  }, [
    appliedCoupon,
    couponResult,
    hasAnyAdultChannels,
    product,
    priceCalculation,
  ]);

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponResult,
    couponError,
    applyCoupon,
    displayTotals,
  };
};
