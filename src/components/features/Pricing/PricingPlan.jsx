// PricingPlan.jsx (Refactored)
"use client";
import Button from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserSpending } from "@/contexts/UserSpendingContext";

// Import custom hooks
import { useCoupon } from "./hooks/useCoupon";
import { usePopupStates } from "./hooks/usePopupStates";
import { usePricingCalculation } from "./hooks/usePricingCalculation";
import { usePricingPlan } from "./hooks/usePricingPlan";
import { useTranslation } from "./hooks/useTranslation";

// Import components
import BulkDiscount from "./components/BulkDiscount";
import CouponInput from "./components/CouponInput";
import PriceSummary from "./components/PriceSummary";
import PricingControls from "./components/PricingControls";
import PricingHeader from "./components/PricingHeader";
import PricingPopups from "./components/PricingPopups";
import RankDiscountInfo from "./components/RankDiscountInfo";
import SubscriptionPlans from "./components/SubscriptionPlans";

// Import utilities
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import { createMultiAccountSelectionData } from "./utils/pricingUtils";

const PricingPlan = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { currentRank, loading: rankLoading } = useUserSpending();

  // Use custom hooks
  const pricingPlan = usePricingPlan();
  const popupStates = usePopupStates();

  // Add device info state
  const [deviceInfo, setDeviceInfo] = useState({});

  // Device info change handler
  const handleDeviceInfoChange = (accountIndex, newDeviceInfo) => {
    setDeviceInfo((prev) => ({
      ...prev,
      [accountIndex]: newDeviceInfo,
    }));
  };

  // Add to cart handler
  const handleAddToCart = () => {
    const selectedPlanData =
      pricingPlan.product?.variants[pricingPlan.selectedPlan];
    const actualQuantity = pricingPlan.getActualQuantity();

    // Calculate final price with coupon discount
    const finalPrice =
      coupon.appliedCoupon && coupon.couponResult
        ? coupon.displayTotals.finalTotalWithCoupon
        : priceCalculation.finalTotal;

    // Create comprehensive cart item data similar to order selection
    const cartItem = {
      // Main product info (similar to order selection)
      product: {
        _id: pricingPlan.product._id,
        name: pricingPlan.product.name,
        variants: pricingPlan.product.variants,
      },
      productId: pricingPlan.product._id,
      variantId: selectedPlanData._id, // Use the actual variant _id
      selectedPlan: pricingPlan.selectedPlan,
      selectedQuantity: actualQuantity,

      // Plan info
      plan: {
        name: selectedPlanData.name,
        duration: selectedPlanData.duration,
        price: selectedPlanData.price,
      },

      // Legacy fields for compatibility
      quantity: actualQuantity,
      selectedDevices: pricingPlan.accountConfigurations.reduce(
        (acc, config) => acc + config.devices,
        0
      ),
      devices: pricingPlan.accountConfigurations.reduce(
        (acc, config) => acc + config.devices,
        0
      ),
      adultChannels: pricingPlan.accountConfigurations.some(
        (config) => config.adultChannels
      ),

      // Account configurations
      accountConfigurations: pricingPlan.accountConfigurations.slice(
        0,
        actualQuantity
      ),

      // Pricing info
      priceCalculation: {
        finalTotal: finalPrice,
        originalTotal: priceCalculation.finalTotal,
        discount: priceCalculation.finalTotal - finalPrice,
      },
      finalPrice: finalPrice,

      // Device info
      deviceInfo: deviceInfo,

      // Coupon info
      appliedCoupon: coupon.appliedCoupon,
      couponResult: coupon.couponResult,
      coupon: coupon.appliedCoupon
        ? {
            code: coupon.appliedCoupon.code,
            discount: coupon.displayTotals.couponDiscount,
          }
        : null,

      // Cart specific info
      id: `${pricingPlan.product._id}_${
        pricingPlan.selectedPlan
      }_${Date.now()}`,
      productName: pricingPlan.product.name,
      planName: selectedPlanData.name,
      planDuration: selectedPlanData.duration,
      planPrice: selectedPlanData.price,
      accounts: pricingPlan.accountConfigurations
        .slice(0, actualQuantity)
        .map((config, index) => ({
          ...config,
          deviceInfo: deviceInfo[index] || { macAddress: "", enigma2Info: "" },
        })),
      originalPrice: priceCalculation.finalTotal,
      discount: priceCalculation.finalTotal - finalPrice,
      addedAt: new Date().toISOString(),

      // Metadata
      type: "cart_item",
      timestamp: new Date().toISOString(),
    };

    // Get existing cart items
    const existingCart = localStorage.getItem("cs_cart");
    const cartItems = existingCart ? JSON.parse(existingCart) : [];

    // Add new item to cart
    const newCartItems = [...cartItems, cartItem];
    localStorage.setItem("cs_cart", JSON.stringify(newCartItems));

    // Dispatch custom event to update navbar immediately
    window.dispatchEvent(new CustomEvent("cartUpdated"));

    // Show success message with SweetAlert2
    Swal.fire({
      icon: "success",
      title: "Added to Cart!",
      text: `${selectedPlanData.name} has been added to your cart`,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
      background: "#1a1a1a",
      color: "#ffffff",
      customClass: {
        popup: "swal2-popup-dark",
      },
    });
  };

  // Update price calculation to handle multiple accounts
  const { priceCalculation } = usePricingCalculation(
    pricingPlan.selectedPlan,
    pricingPlan.accountConfigurations,
    pricingPlan.product,
    currentRank
  );

  const coupon = useCoupon(
    priceCalculation,
    pricingPlan.accountConfigurations,
    pricingPlan.product
  );

  const translation = useTranslation(
    pricingPlan.product,
    isLanguageLoaded,
    language,
    translate
  );

  // Handler functions
  const handleProceedToCheckout = () => {
    const selectedPlanData =
      pricingPlan.product?.variants[pricingPlan.selectedPlan];
    const actualQuantity = pricingPlan.getActualQuantity();

    // Calculate final price with coupon discount
    const finalPrice =
      coupon.appliedCoupon && coupon.couponResult
        ? coupon.displayTotals.finalTotalWithCoupon
        : priceCalculation.finalTotal;

    // Create selection data for multiple accounts
    const selectionData = createMultiAccountSelectionData(
      selectedPlanData,
      pricingPlan.product,
      pricingPlan.accountConfigurations.slice(0, actualQuantity),
      priceCalculation,
      coupon.appliedCoupon,
      coupon.displayTotals,
      finalPrice,
      pricingPlan.selectedDeviceType,
      deviceInfo
    );

    try {
      localStorage.setItem("cs_order_selection", JSON.stringify(selectionData));
      if (user) {
        popupStates.setShowThankYou(true);
      } else {
        popupStates.setShowGuestCheckout(true);
      }
    } catch (e) {}
  };

  if (pricingPlan.loading || authLoading) {
    return <div className="text-center py-8">{translation.texts.loading}</div>;
  }

  if (!pricingPlan.product || !pricingPlan.product.variants) {
    return (
      <div className="text-center py-100">
        {translation.texts.noProductData}
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6">
      <div className="bg-black text-white min-h-screen py-4 sm:py-6 font-primary max-w-[1280px] mx-auto mt-16 sm:mt-20 rounded-xl sm:rounded-2xl border border-[#FFFFFF26]">
        {/* Header */}
        <PricingHeader texts={translation.texts} />

        {/* Subscription Plans */}
        <SubscriptionPlans
          product={{
            ...pricingPlan.product,
            variants: translation.translatedPlans,
          }}
          selectedPlan={pricingPlan.selectedPlan}
          setSelectedPlan={pricingPlan.setSelectedPlan}
          texts={translation.texts}
        />

        {/* Controls */}
        <PricingControls
          selectedQuantity={pricingPlan.selectedQuantity}
          setSelectedQuantity={pricingPlan.setSelectedQuantity}
          customQuantity={pricingPlan.customQuantity}
          setCustomQuantity={pricingPlan.setCustomQuantity}
          showCustomInput={pricingPlan.showCustomInput}
          setShowCustomInput={pricingPlan.setShowCustomInput}
          handleQuantityChange={pricingPlan.handleQuantityChange}
          handleCustomQuantityChange={pricingPlan.handleCustomQuantityChange}
          selectedDeviceType={pricingPlan.selectedDeviceType}
          setSelectedDeviceType={pricingPlan.setSelectedDeviceType}
          accountConfigurations={pricingPlan.accountConfigurations}
          updateAccountConfiguration={pricingPlan.updateAccountConfiguration}
          getActualQuantity={pricingPlan.getActualQuantity}
          texts={translation.texts}
          deviceInfo={deviceInfo}
          onDeviceInfoChange={handleDeviceInfoChange}
        />

        {/* Bulk Discount Offers */}
        <BulkDiscount product={pricingPlan.product} />

        {/* Rank Discount Info */}
        <RankDiscountInfo currentRank={currentRank} texts={translation.texts} />

        {/* Price Summary */}
        <PriceSummary
          priceCalculation={priceCalculation}
          currentRank={currentRank}
          appliedCoupon={coupon.appliedCoupon}
          couponResult={coupon.couponResult}
          displayTotals={coupon.displayTotals}
          texts={translation.texts}
        />

        {/* Coupon Input */}
        <CouponInput
          couponCode={coupon.couponCode}
          setCouponCode={coupon.setCouponCode}
          applyCoupon={coupon.applyCoupon}
          couponError={coupon.couponError}
          appliedCoupon={coupon.appliedCoupon}
          couponResult={coupon.couponResult}
          texts={translation.texts}
        />

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 justify-center px-4">
          {/* Add to Cart Button */}
          <Button
            variant="primary"
            className="font-secondary w-full sm:w-[250px] md:w-[300px] lg:w-[350px] font-bold 
            flex items-center justify-center"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={20} className="mr-2" />
            Add to Cart
          </Button>

          {/* Proceed to Checkout Button */}
          <Button
            className="font-secondary w-full sm:w-[350px] md:w-[420px] lg:w-[526px] font-bold text-base"
            onClick={handleProceedToCheckout}
          >
            {translation.texts.button}
          </Button>
        </div>

        {/* Popups */}
        <PricingPopups
          showThankYou={popupStates.showThankYou}
          closeThankYou={popupStates.closeThankYou}
          showGuestCheckout={popupStates.showGuestCheckout}
          closeGuestCheckout={popupStates.closeGuestCheckout}
          showRegisterForm={popupStates.showRegisterForm}
          setShowRegisterForm={popupStates.setShowRegisterForm}
          showPaymentConfirm={popupStates.showPaymentConfirm}
          closePaymentConfirm={popupStates.closePaymentConfirm}
          orderWithCredentials={popupStates.orderWithCredentials}
          showGatewaySelect={popupStates.showGatewaySelect}
          setShowGatewaySelect={popupStates.setShowGatewaySelect}
          hideThankYouWhenOtherPopupOpens={
            popupStates.hideThankYouWhenOtherPopupOpens
          }
          showBalanceCheckout={popupStates.showBalanceCheckout}
          setShowBalanceCheckout={popupStates.setShowBalanceCheckout}
          handleBalancePaymentSuccess={popupStates.handleBalancePaymentSuccess}
          showDepositPopup={popupStates.showDepositPopup}
          setShowDepositPopup={popupStates.setShowDepositPopup}
          handleDepositSuccess={popupStates.handleDepositSuccess}
          placing={popupStates.placing}
          setPlacing={popupStates.setPlacing}
          user={user}
        />
      </div>
    </div>
  );
};

export default PricingPlan;
