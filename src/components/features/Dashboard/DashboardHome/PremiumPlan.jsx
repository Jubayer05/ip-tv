"use client";
import Button from "@/components/ui/button";
import { useState } from "react";
import ShoppingCartModal from "./MyCart";

const PremiumPlanCard = () => {
  const [showCart, setShowCart] = useState(false);

  const handleQuickReorder = () => {
    setShowCart(true);
  };

  const handleCloseCart = () => {
    setShowCart(false);
  };

  return (
    <>
      <div className="border border-[#212121] bg-black rounded-[15px] p-4 sm:p-6 md:p-8 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-white text-base sm:text-lg font-semibold mb-2">
            PREMIUM PLAN
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">Valid till 28 Aug</p>
        </div>

        {/* Price */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-baseline">
            <span className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">
              $15
            </span>
            <span className="text-gray-400 text-sm sm:text-lg ml-2">
              /Per month
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            onClick={handleQuickReorder}
            className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3"
          >
            Quick Reorder
          </Button>

          <Button className="border border-white/25 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-xs sm:text-sm bg-white/10 hover:bg-white hover:text-black transition-colors">
            Cancel Plan
          </Button>
        </div>
      </div>

      {/* Cart Modal */}
      <ShoppingCartModal isOpen={showCart} onClose={handleCloseCart} />
    </>
  );
};

export default PremiumPlanCard;
