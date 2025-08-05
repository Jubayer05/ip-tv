"use client";

export default function BuyPlansWithCoupons() {
  const coupons = [
    {
      code: "WELCOME5",
      validTill: "Apr 30, 2025",
      discount: "5% Off",
    },
    {
      code: "WELCOME5",
      validTill: "Apr 30, 2025",
      discount: "5% Off",
    },
  ];

  return (
    <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 rounded-lg w-full lg:max-w-md mx-auto -mt-3">
      {/* Header with Badge */}
      <div className="flex items-center justify-between mb-4 -mt-2">
        <h2 className="text-base sm:text-lg font-bold tracking-wide">
          BUY PLANS WITH COUPONS
        </h2>
        <div className="border-2 bg-primary/15 border-primary text-primary px-4 sm:px-6 py-[3px] rounded-full text-xs sm:text-sm font-medium">
          2
        </div>
      </div>

      {/* Coupon Cards */}
      <div className="space-y-2">
        {coupons.map((coupon, index) => (
          <div
            key={index}
            className="bg-[#0E0E11] border border-white/15 rounded-lg p-4 sm:p-6 hover:border-white/40 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-sm sm:text-base mb-1">
                  {coupon.code}
                </h3>
                <p className="text-[#afafaf] text-xs">
                  Valid till: {coupon.validTill}
                </p>
              </div>
              <div className="text-white font-bold text-xs sm:text-sm">
                {coupon.discount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
