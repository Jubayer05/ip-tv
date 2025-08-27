const BulkDiscount = ({ product }) => {
  const bulkDiscounts = product?.bulkDiscounts || [
    { minQuantity: 3, discountPercentage: 5, description: "3+ Orders: 5% OFF" },
    {
      minQuantity: 5,
      discountPercentage: 10,
      description: "5+ Orders: 10% OFF",
    },
    {
      minQuantity: 10,
      discountPercentage: 15,
      description: "10+ Orders: 15% OFF",
    },
  ];

  return (
    <div className="max-w-[600px] ml-4 mr-4 md:mx-auto mt-5 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl p-4 sm:p-6 shadow-lg shadow-[#00b877]/10">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="w-2 h-2 bg-[#00b877] rounded-full"></div>
        <span className="text-[#00b877] text-xs sm:text-sm font-semibold uppercase tracking-wide">
          Bulk Discount Offers
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {bulkDiscounts.map((discount, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-[#ffffff]/5 border border-[#00b877]/20 rounded-lg p-3 hover:bg-[#00b877]/5 transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#00b877] rounded-full"></div>
              <span className="text-[#ffffff] font-medium text-xs sm:text-sm">
                {discount.minQuantity}+ Orders
              </span>
            </div>
            <span className="text-[#00b877] font-bold text-xs sm:text-sm">
              {discount.discountPercentage}% OFF
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulkDiscount;
