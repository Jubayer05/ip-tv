"use client";

export default function RankSystem() {
  const ranks = [
    {
      name: "NEWBIE",
      benefits: "1% Discount",
      spending: "$10 - $999",
    },
    {
      name: "BRONZE",
      benefits: "2% Discount + 1 Bonus Device",
      spending: "$1000 - $2999",
    },
    {
      name: "SILVER",
      benefits: "3% Discount + Early Access to Sales",
      spending: "$3000 - $4999",
    },
    {
      name: "GOLD",
      benefits: "5% Discount + VIP Support",
      spending: "$5000 - $6999",
    },
    {
      name: "PLATINUM",
      benefits: "7% Discount + Custom Coupon Codes",
      spending: "$7000 - $9999",
    },
    {
      name: "ELITE",
      benefits: "10% Lifetime Discount + Exclusive Perks",
      spending: "$10,000+",
    },
  ];

  return (
    <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 md:p-8 rounded-lg w-full lg:max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 tracking-wide">
          RANK SYSTEM - UNLOCK MORE AS YOU SPEND
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm">
          Your total spending and referrals unlock rank-based discounts and
          benefits.
        </p>
      </div>

      {/* Rank Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {ranks.map((rank, index) => (
          <div
            key={rank.name}
            className="bg-[#0E0E11] border border-white/15 rounded-lg p-4 sm:p-6 hover:border-white/40 transition-colors duration-200"
          >
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {rank.name}
              </h3>
              <span className="text-white font-semibold text-right text-xs sm:text-sm">
                {rank.spending}
              </span>
            </div>
            <p className="text-[#afafaf] text-xs sm:text-sm leading-relaxed">
              {rank.benefits}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <p className="text-white text-xs">
        *Ranks update automatically based on total spending and referral
        performance.
      </p>
    </div>
  );
}
