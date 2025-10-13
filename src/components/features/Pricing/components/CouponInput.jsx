"use client";
const CouponInput = ({
  couponCode,
  setCouponCode,
  applyCoupon,
  couponError,
  appliedCoupon,
  couponResult,
  texts,
}) => {
  return (
    <div className="max-w-3xl mt-6 mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder={texts.coupon.placeholder}
          className="flex-1 bg-black border border-white/20 rounded px-3 py-2 text-white"
        />
        <button
          onClick={applyCoupon}
          className="bg-primary text-black font-bold px-4 py-2 rounded"
        >
          {texts.coupon.apply}
        </button>
      </div>
      {couponError && (
        <div className="text-red-400 mt-2 text-sm">
          {texts.coupon.validationFailed}
        </div>
      )}
      {appliedCoupon && couponResult && (
        <div className="text-green-400 mt-2 text-sm">
          {texts.coupon.applied} {appliedCoupon.code}:{" "}
          {appliedCoupon.discountType === "percentage"
            ? `${appliedCoupon.discountValue}%`
            : `$${appliedCoupon.discountValue}`}{" "}
          {texts.coupon.off}
        </div>
      )}
    </div>
  );
};

export default CouponInput;
