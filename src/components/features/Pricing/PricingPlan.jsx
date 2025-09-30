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

  // Add state for line type (M3U, MAG, Enigma2)
  const [selectedLineType, setSelectedLineType] = useState(0); // 0: M3U, 1: MAG, 2: Enigma2
  const [macAddresses, setMacAddresses] = useState([]); // For MAG/Enigma2 devices
  const [adultChannelsConfig, setAdultChannelsConfig] = useState([]); // Per-device adult channel config

  // Line type options
  const lineTypes = [
    {
      id: 0,
      name: "M3U Playlist",
      description: "Compatible with most IPTV players",
      icon: "📱",
      supportsMultiDevice: true,
    },
    {
      id: 1,
      name: "MAG Device",
      description: "For MAG set-top boxes",
      icon: "📺",
      supportsMultiDevice: false,
    },
    {
      id: 2,
      name: "Enigma2",
      description: "For Enigma2 receivers",
      icon: "📡",
      supportsMultiDevice: false,
    },
  ];

  // Template options for IPTV API
  const templateOptions = [
    { id: 1, name: "Bouquet Sorting in Americas" },
    { id: 2, name: "Bouquet Sorting in Europe" },
    { id: 3, name: "Bouquet Sorting in Middle East" },
    { id: 4, name: "Bouquet Sorting in Spain" },
    { id: 5, name: "Channels of Arab Countries" },
    { id: 6, name: "Channels of Spain" },
    { id: 7, name: "Channels of Americas" },
    { id: 8, name: "Channels of Europe" },
  ];
  const [selectedTemplate, setSelectedTemplate] = useState(2); // Default to Europe

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

  // Handle line type change
  const handleLineTypeChange = (lineType) => {
    setSelectedLineType(lineType);

    // Reset devices to 1 for MAG/Enigma2 since they don't support multi-device
    if (lineType > 0) {
      setSelectedDevices(1);
    }

    // Initialize MAC addresses and adult config arrays based on quantity
    const actualQuantity =
      selectedQuantity === "custom"
        ? parseInt(customQuantity) || 1
        : selectedQuantity;
    initializeDeviceArrays(actualQuantity);
  };

  // Initialize MAC addresses and adult config arrays
  const initializeDeviceArrays = (quantity) => {
    if (selectedLineType > 0) {
      // MAG or Enigma2
      setMacAddresses(Array(quantity).fill(""));
      setAdultChannelsConfig(Array(quantity).fill(false));
    } else {
      // M3U
      setMacAddresses([]);
      setAdultChannelsConfig([]);
    }
  };

  // Handle quantity selection
  const handleQuantityChange = (quantity) => {
    if (quantity === "custom") {
      setShowCustomInput(true);
      setSelectedQuantity("custom");
    } else {
      setShowCustomInput(false);
      setSelectedQuantity(quantity);
      setCustomQuantity("");

      // Initialize device arrays for the new quantity
      initializeDeviceArrays(quantity);
    }
  };

  // Handle custom quantity input
  const handleCustomQuantityChange = (e) => {
    const value = e.target.value;
    setCustomQuantity(value);
    if (value && !isNaN(value) && parseInt(value) > 0) {
      const qty = parseInt(value);
      setSelectedQuantity(qty);
      initializeDeviceArrays(qty);
    }
  };

  // Handle MAC address change for specific device
  const handleMacAddressChange = (index, value) => {
    const newMacAddresses = [...macAddresses];
    newMacAddresses[index] = value;
    setMacAddresses(newMacAddresses);
  };

  // Handle adult channels config for specific device
  const handleAdultChannelsConfigChange = (index, enabled) => {
    const newAdultConfig = [...adultChannelsConfig];
    newAdultConfig[index] = enabled;
    setAdultChannelsConfig(newAdultConfig);
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

    // For MAG/Enigma2, devices are always 1 per line
    const effectiveDevices = selectedLineType > 0 ? 1 : selectedDevices;

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
    if (selectedLineType === 0) {
      // M3U
      // For M3U, adult channels apply to all devices if enabled
      if (adultChannels) {
        adultChannelsFee =
          (afterRankDiscount * adultChannelsFeePercentage) / 100;
      }
    } else {
      // MAG or Enigma2
      // For MAG/Enigma2, calculate fee per device based on individual adult config
      const adultEnabledCount = adultChannelsConfig.filter(
        (enabled) => enabled
      ).length;
      if (adultEnabledCount > 0) {
        const pricePerLine = afterRankDiscount / actualQuantity;
        adultChannelsFee =
          (pricePerLine * adultEnabledCount * adultChannelsFeePercentage) / 100;
      }
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
      lineType: selectedLineType,
      adultChannelsConfig: selectedLineType > 0 ? adultChannelsConfig : null,
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
        finalOnEligible: data.finalTotal,
      });
    } catch (e) {
      setCouponError("Validation failed");
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
      if (selectedLineType === 0) {
        // M3U
        if (adultChannels) {
          adultFee =
            (afterCouponEligible *
              (product?.adultChannelsFeePercentage || 20)) /
            100;
        }
      } else {
        // MAG or Enigma2
        const adultEnabledCount = adultChannelsConfig.filter(
          (enabled) => enabled
        ).length;
        if (adultEnabledCount > 0) {
          const pricePerLine = afterCouponEligible / pc.quantity;
          adultFee =
            (pricePerLine *
              adultEnabledCount *
              (product?.adultChannelsFeePercentage || 20)) /
            100;
        }
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
      lineType: {
        title: "Select Device Type:",
      },
      devices: {
        title: "Select Devices:",
        recommended: "Recommended",
      },
      template: {
        title: "Select Template:",
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
      macAddress: {
        title: "MAC Address:",
        placeholder: "Enter MAC address (e.g., 1A:2B:3C:4D:5E:6F)",
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
          ORIGINAL_TEXTS.controls.lineType.title,
          ORIGINAL_TEXTS.controls.devices.title,
          ORIGINAL_TEXTS.controls.devices.recommended,
          ORIGINAL_TEXTS.controls.template.title,
          ORIGINAL_TEXTS.controls.adultChannels.title,
          ORIGINAL_TEXTS.controls.adultChannels.on,
          ORIGINAL_TEXTS.controls.adultChannels.off,
          ORIGINAL_TEXTS.controls.quantity.title,
          ORIGINAL_TEXTS.controls.quantity.custom,
          ORIGINAL_TEXTS.controls.macAddress.title,
          ORIGINAL_TEXTS.controls.macAddress.placeholder,
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

        setTexts({
          header: translated[currentIndex++],
          controls: {
            lineType: {
              title: translated[currentIndex++],
            },
            devices: {
              title: translated[currentIndex++],
              recommended: translated[currentIndex++],
            },
            template: {
              title: translated[currentIndex++],
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
            macAddress: {
              title: translated[currentIndex++],
              placeholder: translated[currentIndex++],
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

    // Validate MAC addresses for MAG/Enigma2
    if (selectedLineType > 0) {
      const actualQuantity =
        selectedQuantity === "custom"
          ? parseInt(customQuantity) || 0
          : selectedQuantity;
      for (let i = 0; i < actualQuantity; i++) {
        if (!macAddresses[i] || macAddresses[i].trim() === "") {
          alert(
            `Please enter MAC address for ${
              lineTypes[selectedLineType].name
            } #${i + 1}`
          );
          return;
        }
      }
    }

    // Generate random credentials for each account
    const actualQuantity =
      selectedQuantity === "custom"
        ? parseInt(customQuantity) || 0
        : selectedQuantity;

    const generatedCredentials = [];
    const orderNumber = `ORD${Date.now()}`; // Generate a temporary order number for credential generation

    if (selectedLineType === 0) {
      // M3U - one account for multiple devices
      const { username, password } = generateRandomCredentials(orderNumber);
      generatedCredentials.push({ username, password });
    } else {
      // MAG/Enigma2 - separate account for each device
      for (let i = 0; i < actualQuantity; i++) {
        const { username, password } = generateRandomCredentials(
          orderNumber,
          i
        );
        generatedCredentials.push({ username, password });
      }
    }

    const selectionData = {
      plan: {
        name: selectedPlanData?.name || "Unknown",
        duration: selectedPlanData?.durationMonths || 0,
        price: selectedPlanData?.price || 0,
        currency: selectedPlanData?.currency || "USD",
      },
      productId: product?.id || product?._id,
      variantId: selectedPlanData?.id || selectedPlanData?._id,
      devices: selectedLineType > 0 ? 1 : selectedDevices, // Always 1 for MAG/Enigma2
      adultChannels: selectedLineType === 0 ? adultChannels : false, // For M3U only
      quantity: actualQuantity,
      isCustomQuantity: selectedQuantity === "custom",

      // IPTV Configuration
      lineType: selectedLineType,
      templateId: selectedTemplate,
      macAddresses: selectedLineType > 0 ? macAddresses : [],
      adultChannelsConfig: selectedLineType > 0 ? adultChannelsConfig : [],

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
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!product || !product.variants) {
    return <div className="text-center py-100">No product data available</div>;
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
          product={product}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          texts={texts}
        />

        {/* Line Type Selection */}
        <div className="font-secondary max-w-3xl mt-6 mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl">
          <h3 className="text-white font-semibold text-lg mb-4 text-center">
            {texts.controls.lineType.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lineTypes.map((type) => (
              <div
                key={type.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedLineType === type.id
                    ? "border-[#00b877] bg-[#00b877]/10"
                    : "border-[#FFFFFF26] hover:border-[#44dcf3]/50"
                }`}
                onClick={() => handleLineTypeChange(type.id)}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <h4 className="text-white font-medium text-base mb-1">
                  {type.name}
                </h4>
                <p className="text-gray-400 text-sm">{type.description}</p>
                {!type.supportsMultiDevice && (
                  <p className="text-yellow-400 text-xs mt-2">
                    Single device only
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Template Selection */}
        <div className="font-secondary max-w-3xl mt-6 mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl">
          <h3 className="text-white font-semibold text-lg mb-4 text-center">
            {texts.controls.template.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templateOptions.map((template) => (
              <div
                key={template.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedTemplate === template.id
                    ? "border-[#00b877] bg-[#00b877]/10"
                    : "border-[#FFFFFF26] hover:border-[#44dcf3]/50"
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <span className="text-white text-sm">{template.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Control Section - Modified for line type support */}
        <div className="font-secondary max-w-3xl mt-6 mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl">
          {/* Device Selection - Only for M3U */}
          {selectedLineType === 0 && (
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
                    {deviceCount} Device{deviceCount > 1 ? "s" : ""}
                    {deviceCount === 2 && (
                      <span className="ml-2 text-xs text-[#44dcf3]">
                        ({texts.controls.devices.recommended})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Adult Channels - For M3U only */}
          {selectedLineType === 0 && (
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
          )}

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
                  placeholder="Enter quantity"
                  value={customQuantity}
                  onChange={handleCustomQuantityChange}
                  className="max-w-xs text-center"
                />
              </div>
            )}
          </div>
        </div>

        {/* MAC Address and Adult Config for MAG/Enigma2 */}
        {selectedLineType > 0 && actualQuantity > 0 && (
          <div className="font-secondary max-w-3xl mt-6 mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl">
            <h3 className="text-white font-semibold text-lg mb-4 text-center">
              {lineTypes[selectedLineType].name} Configuration
            </h3>
            <div className="space-y-4">
              {Array.from({ length: actualQuantity }, (_, index) => (
                <div
                  key={index}
                  className="p-4 bg-black/30 rounded-lg border border-[#FFFFFF26]"
                >
                  <h4 className="text-white font-medium mb-3">
                    {lineTypes[selectedLineType].name} #{index + 1}
                  </h4>

                  {/* MAC Address Input */}
                  <div className="mb-3">
                    <label className="block text-gray-300 text-sm mb-2">
                      {texts.controls.macAddress.title}
                    </label>
                    <Input
                      type="text"
                      placeholder={texts.controls.macAddress.placeholder}
                      value={macAddresses[index] || ""}
                      onChange={(e) =>
                        handleMacAddressChange(index, e.target.value)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Adult Channels Toggle */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      {texts.controls.adultChannels.title}
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          handleAdultChannelsConfigChange(index, false)
                        }
                        className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200 ${
                          !adultChannelsConfig[index]
                            ? "border-[#00b877] bg-[#00b877]/20 text-[#00b877]"
                            : "border-[#FFFFFF26] text-gray-300 hover:border-[#44dcf3]/50"
                        }`}
                      >
                        Non Adult
                      </button>
                      <button
                        onClick={() =>
                          handleAdultChannelsConfigChange(index, true)
                        }
                        className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200 ${
                          adultChannelsConfig[index]
                            ? "border-[#00b877] bg-[#00b877]/20 text-[#00b877]"
                            : "border-[#FFFFFF26] text-gray-300 hover:border-[#44dcf3]/50"
                        }`}
                      >
                        Adult Enabled
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

              {selectedLineType === 0 && (
                <div className="flex justify-between">
                  <span>Devices ({selectedDevices}):</span>
                  <span>
                    {priceCalculation.currency}
                    {priceCalculation.pricePerDevice} per device
                  </span>
                </div>
              )}

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

              {/* Adult Channels Fee Display */}
              {priceCalculation.adultChannelsFee > 0 && (
                <div className="flex justify-between text-orange-400">
                  <span>
                    Adult Channels Fee
                    {selectedLineType > 0 && (
                      <span className="text-xs ml-1">
                        (
                        {
                          adultChannelsConfig.filter((enabled) => enabled)
                            .length
                        }{" "}
                        devices)
                      </span>
                    )}
                    :
                  </span>
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
                  {displayTotals.adultFeeAfterCoupon > 0 && (
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

            {/* Device Configuration Summary for MAG/Enigma2 */}
            {selectedLineType > 0 && actualQuantity > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <h4 className="text-white font-medium mb-3">
                  Configuration Summary:
                </h4>
                <div className="space-y-2 text-sm">
                  {Array.from({ length: actualQuantity }, (_, index) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {lineTypes[selectedLineType].name} #{index + 1}:
                      </span>
                      <span
                        className={
                          adultChannelsConfig[index]
                            ? "text-orange-400"
                            : "text-gray-300"
                        }
                      >
                        {adultChannelsConfig[index]
                          ? "Adult Enabled"
                          : "Non Adult"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
