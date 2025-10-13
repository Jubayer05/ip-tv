"use client";
const RankDiscountInfo = ({ currentRank, texts }) => {
  if (!currentRank) return null;

  return (
    <div className="font-secondary max-w-3xl mt-4 mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <span className="text-black text-xs font-bold">★</span>
        </div>
        <h3 className="text-white font-semibold text-lg">
          {currentRank.name} {texts.rankDiscount.rankDiscount}
        </h3>
      </div>
      <div className="text-center">
        <p className="text-gray-300 text-sm mb-2">
          {texts.rankDiscount.congratulations} {currentRank.discount}%{" "}
          {texts.rankDiscount.discountOnAllPurchases}
        </p>
        <div className="bg-primary/20 border border-primary/30 rounded-lg p-3">
          <span className="text-primary font-bold text-lg">
            {currentRank.discount}% {texts.priceSummary.off}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RankDiscountInfo;
