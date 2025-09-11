"use client";
import Button from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserSpending } from "@/contexts/UserSpendingContext";
import { useEffect, useState } from "react";
import RegisterFormPopup from "./Popup/RegisterFormPopup";
import ThankRegisterPopup from "./Popup/ThankRegisterPopup";

// Import the new components
import BottomControls from "./components/BottomControls";
import BulkDiscount from "./components/BulkDiscount";
import PricingHeader from "./components/PricingHeader";
import SubscriptionPlans from "./components/SubscriptionPlans";

const PricingPlan = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { currentRank, loading: rankLoading } = useUserSpending();
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [selectedDevices, setSelectedDevices] = useState(1);
  const [adultChannels, setAdultChannels] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [customQuantity, setCustomQuantity] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotRegister, setShowNotRegister] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Add state for coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch("/api/admin/products");
        if (response.ok) {
          const data = await response.json();
          setProduct(data[0]);
          // Set recommended plan as default selected
          const recommendedIndex = data[0].variants?.findIndex(
            (v) => v.recommended
          );
          if (recommendedIndex !== -1) {
            setSelectedPlan(recommendedIndex);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  // Handle quantity selection
  const handleQuantityChange = (quantity) => {
    if (quantity === "custom") {
      setShowCustomInput(true);
      setSelectedQuantity("custom");
    } else {
      setShowCustomInput(false);
      setSelectedQuantity(quantity);
      setCustomQuantity("");
    }
  };

  // Handle custom quantity input
  const handleCustomQuantityChange = (e) => {
    const value = e.target.value;
    setCustomQuantity(value);
    if (value && !isNaN(value) && parseInt(value) > 0) {
      setSelectedQuantity(parseInt(value));
    }
  };

  // Calculate total price with rank discount
  const calculateTotalPrice = () => {
    if (!product?.variants?.[selectedPlan]) return 0;

    const plan = product.variants[selectedPlan];
    const basePrice = plan.price || 0;

    // Get the actual quantity (custom or selected)
    const actualQuantity =
      selectedQuantity === "custom"
        ? parseInt(customQuantity) || 0
        : selectedQuantity;

    if (actualQuantity <= 0) return 0;

    // Get device pricing from product configuration
    const devicePricing = product.devicePricing || [
      { deviceCount: 1, multiplier: 1 },
      { deviceCount: 2, multiplier: 1.5 },
      { deviceCount: 3, multiplier: 2 },
    ];

    // Find the device multiplier for selected devices
    const deviceRule = devicePricing.find(
      (d) => d.deviceCount === selectedDevices
    );
    const deviceMultiplier = deviceRule ? deviceRule.multiplier : 1;

    // Calculate base price per device
    const pricePerDevice = basePrice * deviceMultiplier;

    // Calculate subtotal (price per device × quantity)
    let subtotal = pricePerDevice * actualQuantity;

    // Get bulk discounts from product configuration
    const bulkDiscounts = product.bulkDiscounts || [
      { minQuantity: 3, discountPercentage: 5 },
      { minQuantity: 5, discountPercentage: 10 },
      { minQuantity: 10, discountPercentage: 15 },
    ];

    // Find applicable bulk discount
    const applicableDiscount = bulkDiscounts
      .filter((d) => actualQuantity >= d.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0];

    const bulkDiscountPercentage = applicableDiscount
      ? applicableDiscount.discountPercentage
      : 0;

    // Calculate bulk discount amount
    const bulkDiscountAmount = (subtotal * bulkDiscountPercentage) / 100;

    // Apply bulk discount
    const afterBulkDiscount = subtotal - bulkDiscountAmount;

    // Get rank discount percentage
    const rankDiscountPercentage = currentRank?.discount || 0;

    // Calculate rank discount amount
    const rankDiscountAmount =
      (afterBulkDiscount * rankDiscountPercentage) / 100;

    // Apply rank discount
    const afterRankDiscount = afterBulkDiscount - rankDiscountAmount;

    // Get adult channels fee percentage from product configuration
    const adultChannelsFeePercentage = product.adultChannelsFeePercentage || 20;

    // Add adult channels fee if selected
    let finalTotal = afterRankDiscount;
    if (adultChannels) {
      const adultChannelsFee =
        (afterRankDiscount * adultChannelsFeePercentage) / 100;
      finalTotal += adultChannelsFee;
    }

    return {
      basePrice,
      pricePerDevice,
      deviceMultiplier,
      quantity: actualQuantity,
      subtotal,
      bulkDiscountPercentage,
      bulkDiscountAmount,
      rankDiscountPercentage,
      rankDiscountAmount: Math.round(rankDiscountAmount * 100) / 100, // Round to 2 decimal places
      afterBulkDiscount,
      afterRankDiscount,
      adultChannelsFee: adultChannels
        ? (afterRankDiscount * adultChannelsFeePercentage) / 100
        : 0,
      finalTotal: Math.round(finalTotal * 100) / 100, // Round to 2 decimal places
      currency: "$", // Always use dollar sign instead of "USD"
      devicePricing,
      bulkDiscounts,
      adultChannelsFeePercentage,
    };
  };

  // Get current price calculation
  const priceCalculation = calculateTotalPrice();

  // Helper to compute the amount that coupon applies on (after bulk + rank)
  const amountEligibleForCoupon = () => {
    const calc = calculateTotalPrice();
    return calc.afterRankDiscount; // apply coupon after rank+bulk, before adult fee
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
        finalOnEligible: data.finalTotal, // after coupon on eligible amount
      });
    } catch (e) {
      setCouponError("Validation failed");
    }
  };

  // derive final total incl. adult fee, after coupon if applied
  const displayTotals = (() => {
    const pc = calculateTotalPrice();
    // base line items from existing calculation
    const base = {
      ...pc,
      couponDiscountAmount: 0,
      finalTotalWithCoupon: pc.finalTotal,
    };

    if (appliedCoupon && couponResult) {
      // We applied coupon on afterRankDiscount.
      // Adult fee is percentage of afterRankDiscount in current logic.
      // Recompute adult fee based on discounted eligible amount:
      const afterCouponEligible = couponResult.finalOnEligible; // afterRankDiscount - coupon
      const adultFee = adultChannels
        ? (afterCouponEligible * (product?.adultChannelsFeePercentage || 20)) /
          100
        : 0;

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
  })();

  // Original text constants
  const ORIGINAL_TEXTS = {
    header: "SELECT SUBSCRIPTION PERIOD:",
    controls: {
      devices: {
        title: "Select Devices:",
        recommended: "Recommended",
      },
      adultChannels: {
        title: "Adult Channels:",
        on: "On",
        off: "Off",
      },
      quantity: {
        title: "Select Quantity:",
        custom: "Custom",
      },
    },
    bulkDiscount: {
      title: "Bulk Discount Offers",
      offers: [
        { orders: "3 Orders", discount: "5% OFF" },
        { orders: "5 Orders", discount: "10% OFF" },
        { orders: "10 Orders", discount: "15% OFF" },
      ],
    },
    button: "PROCEED TO PURCHASE",
  };

  // State for translated content
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        // Collect all translatable text
        const allTexts = [
          ORIGINAL_TEXTS.header,
          ORIGINAL_TEXTS.controls.devices.title,
          ORIGINAL_TEXTS.controls.devices.recommended,
          ORIGINAL_TEXTS.controls.adultChannels.title,
          ORIGINAL_TEXTS.controls.adultChannels.on,
          ORIGINAL_TEXTS.controls.adultChannels.off,
          ORIGINAL_TEXTS.controls.quantity.title,
          ORIGINAL_TEXTS.controls.quantity.custom,
          ORIGINAL_TEXTS.bulkDiscount.title,
          ...ORIGINAL_TEXTS.bulkDiscount.offers.flatMap((offer) => [
            offer.orders,
            offer.discount,
          ]),
          ORIGINAL_TEXTS.button,
        ];

        const translated = await translate(allTexts);
        if (!isMounted) return;

        let currentIndex = 0;

        // Update header
        const tHeader = translated[currentIndex++];

        // Update controls
        const tControls = {
          devices: {
            title: translated[currentIndex++],
            recommended: translated[currentIndex++],
          },
          adultChannels: {
            title: translated[currentIndex++],
            on: translated[currentIndex++],
            off: translated[currentIndex++],
          },
          quantity: {
            title: translated[currentIndex++],
            custom: translated[currentIndex++],
          },
        };

        // Update bulk discount
        const tBulkDiscountTitle = translated[currentIndex++];
        const tBulkDiscountOffers = [];
        for (let i = 0; i < ORIGINAL_TEXTS.bulkDiscount.offers.length; i++) {
          tBulkDiscountOffers.push({
            orders: translated[currentIndex++],
            discount: translated[currentIndex++],
          });
        }

        // Update button
        const tButton = translated[currentIndex++];

        setTexts({
          header: tHeader,
          controls: tControls,
          bulkDiscount: {
            title: tBulkDiscountTitle,
            offers: tBulkDiscountOffers,
          },
          button: tButton,
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const handleProceedToCheckout = () => {
    // Get the selected plan details
    const selectedPlanData = product?.variants[selectedPlan];

    // Calculate the final price with coupon discount
    const finalPrice =
      appliedCoupon && couponResult
        ? displayTotals.finalTotalWithCoupon
        : priceCalculation.finalTotal;

    const selectionData = {
      plan: {
        name: selectedPlanData?.name || "Unknown",
        duration: selectedPlanData?.durationMonths || 0,
        price: selectedPlanData?.price || 0,
        currency: selectedPlanData?.currency || "USD",
      },
      productId: product?.id || product?._id,
      variantId: selectedPlanData?.id || selectedPlanData?._id,
      devices: selectedDevices,
      adultChannels: adultChannels,
      quantity:
        selectedQuantity === "custom" ? customQuantity : selectedQuantity,
      isCustomQuantity: selectedQuantity === "custom",
      priceCalculation: {
        ...priceCalculation,
        // Override the final total with coupon-discounted amount
        finalTotal: finalPrice,
        // Add coupon information to price calculation
        couponApplied: appliedCoupon
          ? {
              code: appliedCoupon.code,
              discountAmount: displayTotals.couponDiscountAmount,
              discountType: appliedCoupon.discountType,
              discountValue: appliedCoupon.discountValue,
            }
          : null,
        // Add the display totals for reference
        displayTotals: displayTotals,
      },
      timestamp: new Date().toISOString(),
      coupon: appliedCoupon
        ? {
            code: appliedCoupon.code,
            discountAmount: displayTotals.couponDiscountAmount,
            discountType: appliedCoupon.discountType,
            discountValue: appliedCoupon.discountValue,
          }
        : null,
      // Add the final price as a separate field for easy access
      finalPrice: finalPrice,
    };

    try {
      localStorage.setItem("cs_order_selection", JSON.stringify(selectionData));
      if (user) {
        setShowThankYou(true);
      } else {
        setShowNotRegister(true);
        setIsModalOpen(true);
      }
    } catch (e) {}
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading || authLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!product || !product.variants) {
    return <div className="text-center py-100">No product data available</div>;
  }

  const closeThankYou = () => {
    setShowThankYou(false);
  };

  return (
    <div className="px-3 sm:px-6">
      <div className="bg-black text-white min-h-screen py-4 sm:py-6 font-primary max-w-[1280px] mx-auto mt-16 sm:mt-20 rounded-xl sm:rounded-2xl border border-[#FFFFFF26]">
        {/* Header */}
        <PricingHeader texts={texts} />

        {/* Subscription Plans */}
        <SubscriptionPlans
          product={product}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          texts={texts}
        />

        {/* Bottom Control Section */}
        <BottomControls
          selectedDevices={selectedDevices}
          setSelectedDevices={setSelectedDevices}
          adultChannels={adultChannels}
          setAdultChannels={setAdultChannels}
          selectedQuantity={selectedQuantity}
          setSelectedQuantity={handleQuantityChange}
          customQuantity={customQuantity}
          setCustomQuantity={setCustomQuantity}
          showCustomInput={showCustomInput}
          setShowCustomInput={setShowCustomInput}
          texts={texts}
        />

        {/* Bulk Discount Offers */}
        <BulkDiscount product={product} />

        {/* Rank Discount Info */}
        {currentRank && (
          <div className="font-secondary max-w-3xl mt-4 mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">★</span>
              </div>
              <h3 className="text-white font-semibold text-lg">
                {currentRank.name} Rank Discount
              </h3>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-2">
                Congratulations! You've earned a {currentRank.discount}%
                discount on all purchases.
              </p>
              <div className="bg-primary/20 border border-primary/30 rounded-lg p-3">
                <span className="text-primary font-bold text-lg">
                  {currentRank.discount}% OFF
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Price Summary */}
        {priceCalculation.finalTotal > 0 && (
          <div className="font-secondary max-w-3xl mt-6 mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl">
            <h3 className="text-white font-semibold text-lg mb-4 text-center">
              Price Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span>
                  {priceCalculation.currency}
                  {priceCalculation.basePrice}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Devices ({selectedDevices}):</span>
                <span>
                  {priceCalculation.currency}
                  {priceCalculation.pricePerDevice} per device
                </span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>{priceCalculation.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>
                  {priceCalculation.currency}
                  {priceCalculation.subtotal}
                </span>
              </div>
              {priceCalculation.bulkDiscountPercentage > 0 && (
                <div className="flex justify-between text-[#00b877]">
                  <span>
                    Bulk Discount ({priceCalculation.bulkDiscountPercentage}%
                    OFF):
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
                    Rank Discount ({currentRank?.name} -{" "}
                    {priceCalculation.rankDiscountPercentage}% OFF):
                  </span>
                  <span>
                    -{priceCalculation.currency}
                    {priceCalculation.rankDiscountAmount}
                  </span>
                </div>
              )}
              {adultChannels && (
                <div className="flex justify-between text-orange-400">
                  <span>Adult Channels Fee:</span>
                  <span>
                    +{priceCalculation.currency}
                    {priceCalculation.adultChannelsFee}
                  </span>
                </div>
              )}
              {appliedCoupon && couponResult && (
                <>
                  <div className="flex justify-between text-[#00b877]">
                    <span>Coupon ({appliedCoupon.code}):</span>
                    <span>
                      -{priceCalculation.currency}
                      {displayTotals.couponDiscountAmount}
                    </span>
                  </div>
                  {adultChannels && (
                    <div className="flex justify-between text-orange-400">
                      <span>Adult Channels Fee (after coupon):</span>
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
                  <span>Final Total:</span>
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
        )}

        {/* Coupon input */}
        <div className="max-w-3xl mt-6 mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1 bg-black border border-white/20 rounded px-3 py-2 text-white"
            />
            <button
              onClick={applyCoupon}
              className="bg-primary text-black font-bold px-4 py-2 rounded"
            >
              Apply
            </button>
          </div>
          {couponError && (
            <div className="text-red-400 mt-2 text-sm">{couponError}</div>
          )}
          {appliedCoupon && couponResult && (
            <div className="text-green-400 mt-2 text-sm">
              Applied {appliedCoupon.code}:{" "}
              {appliedCoupon.discountType === "percentage"
                ? `${appliedCoupon.discountValue}%`
                : `$${appliedCoupon.discountValue}`}{" "}
              off
            </div>
          )}
        </div>

        {/* Proceed Button */}
        <div className="mt-6 sm:mt-8 flex justify-center px-4 ">
          <Button
            className="font-secondary w-full sm:w-[350px] md:w-[420px] lg:w-[526px] font-bold text-base"
            onClick={handleProceedToCheckout}
          >
            {texts.button}
          </Button>
        </div>

        {/* Popups */}
        <ThankRegisterPopup isOpen={showThankYou} onClose={closeThankYou} />
        {/* Register Form Modal */}
        <RegisterFormPopup isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </div>
  );
};

export default PricingPlan;
