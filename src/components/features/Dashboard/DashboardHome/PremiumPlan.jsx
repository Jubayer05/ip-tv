const PremiumPlanCard = () => {
  return (
    <div className="border border-[#212121] bg-black rounded-[15px] p-8 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-white text-lg font-semibold mb-2">PREMIUM PLAN</h2>
        <p className="text-gray-400 text-sm">Valid till 28 Aug</p>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline">
          <span className="text-white text-5xl font-bold">$15</span>
          <span className="text-gray-400 text-lg ml-2">/Per month</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors flex-1">
          Quick Reorder
        </button>
        <button className="border border-gray-600 text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors flex-1">
          Cancel Plan
        </button>
      </div>
    </div>
  );
};

export default PremiumPlanCard;
