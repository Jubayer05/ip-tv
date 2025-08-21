"use client";
import Button from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import ShoppingCartModal from "./MyCart";

const PremiumPlanCard = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [showCart, setShowCart] = useState(false);

  const ORIGINAL_HEADING = "PREMIUM PLAN";
  const ORIGINAL_VALID_TILL = "Valid till 28 Aug";
  const ORIGINAL_PER_MONTH = "/Per month";
  const ORIGINAL_QUICK_REORDER = "Quick Reorder";
  const ORIGINAL_CANCEL_PLAN = "Cancel Plan";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [validTill, setValidTill] = useState(ORIGINAL_VALID_TILL);
  const [perMonth, setPerMonth] = useState(ORIGINAL_PER_MONTH);
  const [quickReorder, setQuickReorder] = useState(ORIGINAL_QUICK_REORDER);
  const [cancelPlan, setCancelPlan] = useState(ORIGINAL_CANCEL_PLAN);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_HEADING,
        ORIGINAL_VALID_TILL,
        ORIGINAL_PER_MONTH,
        ORIGINAL_QUICK_REORDER,
        ORIGINAL_CANCEL_PLAN,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [tHeading, tValidTill, tPerMonth, tQuickReorder, tCancelPlan] =
        translated;

      setHeading(tHeading);
      setValidTill(tValidTill);
      setPerMonth(tPerMonth);
      setQuickReorder(tQuickReorder);
      setCancelPlan(tCancelPlan);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

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
            {heading}
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">{validTill}</p>
        </div>

        {/* Price */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-baseline">
            <span className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">
              $15
            </span>
            <span className="text-gray-400 text-sm sm:text-lg ml-2">
              {perMonth}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            onClick={handleQuickReorder}
            className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3"
          >
            {quickReorder}
          </Button>

          <Button className="border border-white/25 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-xs sm:text-sm bg-white/10 hover:bg-white hover:text-black transition-colors">
            {cancelPlan}
          </Button>
        </div>
      </div>

      {/* Cart Modal */}
      <ShoppingCartModal isOpen={showCart} onClose={handleCloseCart} />
    </>
  );
};

export default PremiumPlanCard;
