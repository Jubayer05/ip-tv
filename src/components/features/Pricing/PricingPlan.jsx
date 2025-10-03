"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserSpending } from "@/contexts/UserSpendingContext";
import { useEffect, useState } from "react";
import GuestCheckoutPopup from "./Popup/GuestCheckoutPopup";
import RegisterFormPopup from "./Popup/RegisterFormPopup";
import ThankRegisterPopup from "./Popup/ThankRegisterPopup";

// Import the new components
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
  const [showGuestCheckout, setShowGuestCheckout] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Add state for coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Add state to store translated plan names
  const [translatedPlans, setTranslatedPlans] = useState([]);

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

  // Enhanced translation effect for all plan fields
  useEffect(() => {
    if (!product?.variants || !isLanguageLoaded || language.code === "en") {
      setTranslatedPlans(product?.variants || []);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        // Collect all translatable text from plan variants
        const textsToTranslate = [];
        const planTexts = [];

        product.variants.forEach((variant, variantIndex) => {
          // Plan name
          planTexts.push({ variantIndex, type: "name", text: variant.name });
          textsToTranslate.push(variant.name);

          // Plan description
          if (variant.description) {
            planTexts.push({
              variantIndex,
              type: "description",
              text: variant.description,
            });
            textsToTranslate.push(variant.description);
          }

          // Plan features (array of strings)
          if (variant.features && Array.isArray(variant.features)) {
            variant.features.forEach((feature, featureIndex) => {
              planTexts.push({
                variantIndex,
                type: "feature",
                featureIndex,
                text: feature,
              });
              textsToTranslate.push(feature);
            });
          }

          // Plan duration (if it's a string)
          if (variant.duration && typeof variant.duration === "string") {
            planTexts.push({
              variantIndex,
              type: "duration",
              text: variant.duration,
            });
            textsToTranslate.push(variant.duration);
          }

          // Plan duration text (if it exists)
          if (variant.durationText) {
            planTexts.push({
              variantIndex,
              type: "durationText",
              text: variant.durationText,
            });
            textsToTranslate.push(variant.durationText);
          }

          // Plan subtitle (if it exists)
          if (variant.subtitle) {
            planTexts.push({
              variantIndex,
              type: "subtitle",
              text: variant.subtitle,
            });
            textsToTranslate.push(variant.subtitle);
          }

          // Plan benefits (if it exists as array)
          if (variant.benefits && Array.isArray(variant.benefits)) {
            variant.benefits.forEach((benefit, benefitIndex) => {
              planTexts.push({
                variantIndex,
                type: "benefit",
                benefitIndex,
                text: benefit,
              });
              textsToTranslate.push(benefit);
            });
          }
        });

        const translated = await translate(textsToTranslate);
        if (!isMounted) return;

        // Create translated variants
        const translatedVariants = product.variants.map(
          (variant, variantIndex) => {
            const translatedVariant = { ...variant };

            // Translate name
            const nameText = planTexts.find(
              (pt) => pt.variantIndex === variantIndex && pt.type === "name"
            );
            if (nameText) {
              const translatedIndex = planTexts.indexOf(nameText);
              translatedVariant.name = translated[translatedIndex];
            }

            // Translate description
            const descText = planTexts.find(
              (pt) =>
                pt.variantIndex === variantIndex && pt.type === "description"
            );
            if (descText) {
              const translatedIndex = planTexts.indexOf(descText);
              translatedVariant.description = translated[translatedIndex];
            }

            // Translate features
            if (variant.features && Array.isArray(variant.features)) {
              translatedVariant.features = variant.features.map(
                (feature, featureIndex) => {
                  const featureText = planTexts.find(
                    (pt) =>
                      pt.variantIndex === variantIndex &&
                      pt.type === "feature" &&
                      pt.featureIndex === featureIndex
                  );
                  if (featureText) {
                    const translatedIndex = planTexts.indexOf(featureText);
                    return translated[translatedIndex];
                  }
                  return feature;
                }
              );
            }

            // Translate duration
            if (variant.duration && typeof variant.duration === "string") {
              const durationText = planTexts.find(
                (pt) =>
                  pt.variantIndex === variantIndex && pt.type === "duration"
              );
              if (durationText) {
                const translatedIndex = planTexts.indexOf(durationText);
                translatedVariant.duration = translated[translatedIndex];
              }
            }

            // Translate duration text
            if (variant.durationText) {
              const durationTextObj = planTexts.find(
                (pt) =>
                  pt.variantIndex === variantIndex && pt.type === "durationText"
              );
              if (durationTextObj) {
                const translatedIndex = planTexts.indexOf(durationTextObj);
                translatedVariant.durationText = translated[translatedIndex];
              }
            }

            // Translate subtitle
            if (variant.subtitle) {
              const subtitleText = planTexts.find(
                (pt) =>
                  pt.variantIndex === variantIndex && pt.type === "subtitle"
              );
              if (subtitleText) {
                const translatedIndex = planTexts.indexOf(subtitleText);
                translatedVariant.subtitle = translated[translatedIndex];
              }
            }

            // Translate benefits
            if (variant.benefits && Array.isArray(variant.benefits)) {
              translatedVariant.benefits = variant.benefits.map(
                (benefit, benefitIndex) => {
                  const benefitText = planTexts.find(
                    (pt) =>
                      pt.variantIndex === variantIndex &&
                      pt.type === "benefit" &&
                      pt.benefitIndex === benefitIndex
                  );
                  if (benefitText) {
                    const translatedIndex = planTexts.indexOf(benefitText);
                    return translated[translatedIndex];
                  }
                  return benefit;
                }
              );
            }

            return translatedVariant;
          }
        );

        setTranslatedPlans(translatedVariants);
      } catch (error) {
        console.error("Error translating plan data:", error);
        setTranslatedPlans(product.variants || []);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [product?.variants, language.code, isLanguageLoaded, translate]);

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
      const qty = parseInt(value);
      setSelectedQuantity(qty);
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

    const effectiveDevices = selectedDevices;

    // Get device pricing from product configuration
    const devicePricing = product.devicePricing || [
      { deviceCount: 1, multiplier: 1 },
      { deviceCount: 2, multiplier: 1.5 },
      { deviceCount: 3, multiplier: 2 },
    ];

    // Find the device multiplier for selected devices
    const deviceRule = devicePricing.find(
      (d) => d.deviceCount === effectiveDevices
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

    // Calculate adult channels fee
    let adultChannelsFee = 0;
    if (adultChannels) {
      adultChannelsFee = (afterRankDiscount * adultChannelsFeePercentage) / 100;
    }

    const finalTotal = afterRankDiscount + adultChannelsFee;

    return {
      basePrice,
      pricePerDevice,
      deviceMultiplier,
      quantity: actualQuantity,
      effectiveDevices,
      subtotal,
      bulkDiscountPercentage,
      bulkDiscountAmount,
      rankDiscountPercentage,
      rankDiscountAmount: Math.round(rankDiscountAmount * 100) / 100,
      afterBulkDiscount,
      afterRankDiscount,
      adultChannelsFee: Math.round(adultChannelsFee * 100) / 100,
      finalTotal: Math.round(finalTotal * 100) / 100,
      currency: "$",
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
        setCouponError(texts.coupon.amountMustBeGreater);
        return;
      }
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount }),
      });
      const data = await res.json();
      if (!data.success) {
        setCouponError(data.error || texts.coupon.invalidCoupon);
        return;
      }
      setAppliedCoupon(data.coupon);
      setCouponResult({
        discountAmount: data.discountAmount,
        finalOnEligible: data.finalTotal,
      });
    } catch (e) {
      setCouponError(texts.coupon.validationFailed);
    }
  };

  // derive final total incl. adult fee, after coupon if applied
  const displayTotals = (() => {
    const pc = calculateTotalPrice();
    const base = {
      ...pc,
      couponDiscountAmount: 0,
      finalTotalWithCoupon: pc.finalTotal,
    };

    if (appliedCoupon && couponResult) {
      const afterCouponEligible = couponResult.finalOnEligible;

      // Recalculate adult fee based on discounted amount
      let adultFee = 0;
      if (adultChannels) {
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
  })();

  // Original text constants
  const ORIGINAL_TEXTS = {
    header: "SELECT SUBSCRIPTION PERIOD:",
    controls: {
      devices: {
        title: "Select Devices:",
        recommended: "Recommended",
        device: "Device",
        devices: "Devices",
      },
      adultChannels: {
        title: "Adult Channels:",
        on: "On",
        off: "Off",
      },
      quantity: {
        title: "Select Quantity:",
        custom: "Custom",
        enterQuantity: "Enter quantity",
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
    rankDiscount: {
      congratulations: "Congratulations! You've earned a",
      discountOnAllPurchases: "discount on all purchases.",
      rankDiscount: "Rank Discount",
    },
    priceSummary: {
      title: "Price Summary",
      basePrice: "Base Price:",
      devices: "Devices",
      perDevice: "per device",
      quantity: "Quantity:",
      subtotal: "Subtotal:",
      bulkDiscount: "Bulk Discount",
      off: "OFF",
      rankDiscount: "Rank Discount",
      adultChannelsFee: "Adult Channels Fee:",
      adultChannelsFeeAfterCoupon: "Adult Channels Fee (after coupon):",
      coupon: "Coupon",
      finalTotal: "Final Total:",
    },
    coupon: {
      placeholder: "Enter coupon code",
      apply: "Apply",
      applied: "Applied",
      off: "off",
      validationFailed: "Validation failed",
      invalidCoupon: "Invalid coupon",
      amountMustBeGreater: "Amount must be greater than 0",
    },
    loading: "Loading...",
    noProductData: "No product data available",
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
          ORIGINAL_TEXTS.controls.devices.device,
          ORIGINAL_TEXTS.controls.devices.devices,
          ORIGINAL_TEXTS.controls.adultChannels.title,
          ORIGINAL_TEXTS.controls.adultChannels.on,
          ORIGINAL_TEXTS.controls.adultChannels.off,
          ORIGINAL_TEXTS.controls.quantity.title,
          ORIGINAL_TEXTS.controls.quantity.custom,
          ORIGINAL_TEXTS.controls.quantity.enterQuantity,
          ORIGINAL_TEXTS.bulkDiscount.title,
          ...ORIGINAL_TEXTS.bulkDiscount.offers.flatMap((offer) => [
            offer.orders,
            offer.discount,
          ]),
          ORIGINAL_TEXTS.button,
          ORIGINAL_TEXTS.rankDiscount.congratulations,
          ORIGINAL_TEXTS.rankDiscount.discountOnAllPurchases,
          ORIGINAL_TEXTS.rankDiscount.rankDiscount,
          ORIGINAL_TEXTS.priceSummary.title,
          ORIGINAL_TEXTS.priceSummary.basePrice,
          ORIGINAL_TEXTS.priceSummary.devices,
          ORIGINAL_TEXTS.priceSummary.perDevice,
          ORIGINAL_TEXTS.priceSummary.quantity,
          ORIGINAL_TEXTS.priceSummary.subtotal,
          ORIGINAL_TEXTS.priceSummary.bulkDiscount,
          ORIGINAL_TEXTS.priceSummary.off,
          ORIGINAL_TEXTS.priceSummary.rankDiscount,
          ORIGINAL_TEXTS.priceSummary.adultChannelsFee,
          ORIGINAL_TEXTS.priceSummary.adultChannelsFeeAfterCoupon,
          ORIGINAL_TEXTS.priceSummary.coupon,
          ORIGINAL_TEXTS.priceSummary.finalTotal,
          ORIGINAL_TEXTS.coupon.placeholder,
          ORIGINAL_TEXTS.coupon.apply,
          ORIGINAL_TEXTS.coupon.applied,
          ORIGINAL_TEXTS.coupon.off,
          ORIGINAL_TEXTS.coupon.validationFailed,
          ORIGINAL_TEXTS.coupon.invalidCoupon,
          ORIGINAL_TEXTS.coupon.amountMustBeGreater,
          ORIGINAL_TEXTS.loading,
          ORIGINAL_TEXTS.noProductData,
        ];

        const translated = await translate(allTexts);
        if (!isMounted) return;

        let currentIndex = 0;

        setTexts({
          header: translated[currentIndex++],
          controls: {
            devices: {
              title: translated[currentIndex++],
              recommended: translated[currentIndex++],
              device: translated[currentIndex++],
              devices: translated[currentIndex++],
            },
            adultChannels: {
              title: translated[currentIndex++],
              on: translated[currentIndex++],
              off: translated[currentIndex++],
            },
            quantity: {
              title: translated[currentIndex++],
              custom: translated[currentIndex++],
              enterQuantity: translated[currentIndex++],
            },
          },
          bulkDiscount: {
            title: translated[currentIndex++],
            offers: ORIGINAL_TEXTS.bulkDiscount.offers.map(() => ({
              orders: translated[currentIndex++],
              discount: translated[currentIndex++],
            })),
          },
          button: translated[currentIndex++],
          rankDiscount: {
            congratulations: translated[currentIndex++],
            discountOnAllPurchases: translated[currentIndex++],
            rankDiscount: translated[currentIndex++],
          },
          priceSummary: {
            title: translated[currentIndex++],
            basePrice: translated[currentIndex++],
            devices: translated[currentIndex++],
            perDevice: translated[currentIndex++],
            quantity: translated[currentIndex++],
            subtotal: translated[currentIndex++],
            bulkDiscount: translated[currentIndex++],
            off: translated[currentIndex++],
            rankDiscount: translated[currentIndex++],
            adultChannelsFee: translated[currentIndex++],
            adultChannelsFeeAfterCoupon: translated[currentIndex++],
            coupon: translated[currentIndex++],
            finalTotal: translated[currentIndex++],
          },
          coupon: {
            placeholder: translated[currentIndex++],
            apply: translated[currentIndex++],
            applied: translated[currentIndex++],
            off: translated[currentIndex++],
            validationFailed: translated[currentIndex++],
            invalidCoupon: translated[currentIndex++],
            amountMustBeGreater: translated[currentIndex++],
          },
          loading: translated[currentIndex++],
          noProductData: translated[currentIndex++],
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  // Generate random username and password
  const generateRandomCredentials = (orderNumber, index = 0) => {
    // Generate shorter username (8 characters max)
    const randomString = Math.random().toString(36).substring(2, 10);
    const username = index > 0 ? `${randomString}${index}` : randomString;

    // Generate shorter password (8 characters max)
    const password = Math.random().toString(36).substring(2, 10);

    return { username, password };
  };

  const handleProceedToCheckout = () => {
    // Get the selected plan details
    const selectedPlanData = product?.variants[selectedPlan];

    // Calculate the final price with coupon discount
    const finalPrice =
      appliedCoupon && couponResult
        ? displayTotals.finalTotalWithCoupon
        : priceCalculation.finalTotal;

    // Generate random credentials for each account
    const actualQuantity =
      selectedQuantity === "custom"
        ? parseInt(customQuantity) || 0
        : selectedQuantity;

    const generatedCredentials = [];
    const orderNumber = `ORD${Date.now()}`; // Generate a temporary order number for credential generation

    // M3U - one account for multiple devices
    const { username, password } = generateRandomCredentials(orderNumber);
    generatedCredentials.push({ username, password });

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
      quantity: actualQuantity,
      isCustomQuantity: selectedQuantity === "custom",

      // Generated credentials
      generatedCredentials: generatedCredentials,

      priceCalculation: {
        ...priceCalculation,
        finalTotal: finalPrice,
        couponApplied: appliedCoupon
          ? {
              code: appliedCoupon.code,
              discountAmount: displayTotals.couponDiscountAmount,
              discountType: appliedCoupon.discountType,
              discountValue: appliedCoupon.discountValue,
            }
          : null,
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
      finalPrice: finalPrice,
    };

    try {
      localStorage.setItem("cs_order_selection", JSON.stringify(selectionData));
      if (user) {
        setShowThankYou(true);
      } else {
        setShowGuestCheckout(true);
      }
    } catch (e) {}
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading || authLoading) {
    return <div className="text-center py-8">{texts.loading}</div>;
  }

  if (!product || !product.variants) {
    return <div className="text-center py-100">{texts.noProductData}</div>;
  }

  const closeThankYou = () => {
    setShowThankYou(false);
  };

  const closeGuestCheckout = () => {
    setShowGuestCheckout(false);
  };

  const actualQuantity =
    selectedQuantity === "custom"
      ? parseInt(customQuantity) || 0
      : selectedQuantity;

  return (
    <div className="px-3 sm:px-6">
      <div className="bg-black text-white min-h-screen py-4 sm:py-6 font-primary max-w-[1280px] mx-auto mt-16 sm:mt-20 rounded-xl sm:rounded-2xl border border-[#FFFFFF26]">
        {/* Header */}
        <PricingHeader texts={texts} />

        {/* Subscription Plans */}
        <SubscriptionPlans
          product={{ ...product, variants: translatedPlans }}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          texts={texts}
        />

        {/* Bottom Control Section */}
        <div className="font-secondary max-w-3xl mt-6 mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl">
          {/* Device Selection */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-4 text-center">
              {texts.controls.devices.title}
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[1, 2, 3].map((deviceCount) => (
                <button
                  key={deviceCount}
                  onClick={() => setSelectedDevices(deviceCount)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                    selectedDevices === deviceCount
                      ? "border-[#00b877] bg-[#00b877]/20 text-[#00b877]"
                      : "border-[#FFFFFF26] text-gray-300 hover:border-[#44dcf3]/50"
                  }`}
                >
                  {texts.controls.devices.device} {deviceCount}
                  {deviceCount > 1 && texts.controls.devices.devices}
                  {deviceCount === 2 && (
                    <span className="ml-2 text-xs text-[#44dcf3]">
                      ({texts.controls.devices.recommended})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Adult Channels */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-4 text-center">
              {texts.controls.adultChannels.title}
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setAdultChannels(false)}
                className={`px-6 py-2 rounded-lg border transition-all duration-200 ${
                  !adultChannels
                    ? "border-[#00b877] bg-[#00b877]/20 text-[#00b877]"
                    : "border-[#FFFFFF26] text-gray-300 hover:border-[#44dcf3]/50"
                }`}
              >
                {texts.controls.adultChannels.off}
              </button>
              <button
                onClick={() => setAdultChannels(true)}
                className={`px-6 py-2 rounded-lg border transition-all duration-200 ${
                  adultChannels
                    ? "border-[#00b877] bg-[#00b877]/20 text-[#00b877]"
                    : "border-[#FFFFFF26] text-gray-300 hover:border-[#44dcf3]/50"
                }`}
              >
                {texts.controls.adultChannels.on}
              </button>
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-4 text-center">
              {texts.controls.quantity.title}
            </h3>
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {[1, 3, 5, 10].map((qty) => (
                <button
                  key={qty}
                  onClick={() => handleQuantityChange(qty)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                    selectedQuantity === qty
                      ? "border-[#00b877] bg-[#00b877]/20 text-[#00b877]"
                      : "border-[#FFFFFF26] text-gray-300 hover:border-[#44dcf3]/50"
                  }`}
                >
                  {qty}
                </button>
              ))}
              <button
                onClick={() => handleQuantityChange("custom")}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                  selectedQuantity === "custom"
                    ? "border-[#00b877] bg-[#00b877]/20 text-[#00b877]"
                    : "border-[#FFFFFF26] text-gray-300 hover:border-[#44dcf3]/50"
                }`}
              >
                {texts.controls.quantity.custom}
              </button>
            </div>

            {showCustomInput && (
              <div className="flex justify-center">
                <Input
                  type="number"
                  min="1"
                  placeholder={texts.controls.quantity.enterQuantity}
                  value={customQuantity}
                  onChange={handleCustomQuantityChange}
                  className="max-w-xs text-center"
                />
              </div>
            )}
          </div>
        </div>

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
        )}

        {/* Price Summary */}
        {priceCalculation.finalTotal > 0 && (
          <div className="font-secondary max-w-3xl mt-6 mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl">
            <h3 className="text-white font-semibold text-lg mb-4 text-center">
              {texts.priceSummary.title}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{texts.priceSummary.basePrice}</span>
                <span>
                  {priceCalculation.currency}
                  {priceCalculation.basePrice}
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  {texts.priceSummary.devices} ({selectedDevices}):
                </span>
                <span>
                  {priceCalculation.currency}
                  {priceCalculation.pricePerDevice}{" "}
                  {texts.priceSummary.perDevice}
                </span>
              </div>

              <div className="flex justify-between">
                <span>{texts.priceSummary.quantity}</span>
                <span>{priceCalculation.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>{texts.priceSummary.subtotal}:</span>
                <span>
                  {priceCalculation.currency}
                  {priceCalculation.subtotal}
                </span>
              </div>
              {priceCalculation.bulkDiscountPercentage > 0 && (
                <div className="flex justify-between text-[#00b877]">
                  <span>
                    {texts.priceSummary.bulkDiscount} (
                    {priceCalculation.bulkDiscountPercentage}%
                    {texts.priceSummary.off}):
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
                    {texts.priceSummary.rankDiscount} ({currentRank?.name} -{" "}
                    {priceCalculation.rankDiscountPercentage}%{" "}
                    {texts.priceSummary.off}):
                  </span>
                  <span>
                    -{priceCalculation.currency}
                    {priceCalculation.rankDiscountAmount}
                  </span>
                </div>
              )}

              {/* Adult Channels Fee Display */}
              {priceCalculation.adultChannelsFee > 0 && (
                <div className="flex justify-between text-orange-400">
                  <span>{texts.priceSummary.adultChannelsFee}:</span>
                  <span>
                    +{priceCalculation.currency}
                    {priceCalculation.adultChannelsFee}
                  </span>
                </div>
              )}

              {appliedCoupon && couponResult && (
                <>
                  <div className="flex justify-between text-[#00b877]">
                    <span>
                      {texts.priceSummary.coupon} ({appliedCoupon.code}):
                    </span>
                    <span>
                      -{priceCalculation.currency}
                      {displayTotals.couponDiscountAmount}
                    </span>
                  </div>
                  {displayTotals.adultFeeAfterCoupon > 0 && (
                    <div className="flex justify-between text-orange-400">
                      <span>
                        {texts.priceSummary.adultChannelsFeeAfterCoupon}:
                      </span>
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
                  <span>{texts.priceSummary.finalTotal}:</span>
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
        <GuestCheckoutPopup
          isOpen={showGuestCheckout}
          onClose={closeGuestCheckout}
          setShowRegisterForm={setShowRegisterForm}
        />
        {/* Register Form Modal */}
        <RegisterFormPopup
          isOpen={showRegisterForm}
          onClose={() => setShowRegisterForm(false)}
        />
      </div>
    </div>
  );
};

export default PricingPlan;
