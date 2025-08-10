"use client";
import Button from "@/components/ui/button";
import { useState } from "react";
import { RiFireFill } from "react-icons/ri";
import RegisterFormPopup from "./Popup/RegisterFormPopup";

const PricingPlan = () => {
  const [selectedPlan, setSelectedPlan] = useState(2); // Premium plan is recommended
  const [selectedDevices, setSelectedDevices] = useState(1);
  const [adultChannels, setAdultChannels] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const plans = [
    {
      id: 0,
      name: "BASIC PLAN",
      duration: "1 MONTH",
      description: "Great for casual streamers.",
      features: [
        "17,000+ Live Channels",
        "120,000+ Movies",
        "8,000+ Series",
        "Compatible with all devices & apps",
        "Standard Support",
      ],
    },
    {
      id: 1,
      name: "STANDARD PLAN",
      duration: "3 MONTHS",
      description: "Great for casual streamers.",
      features: [
        "17,000+ Live Channels",
        "120,000+ Movies",
        "8,000+ Series",
        "Compatible with all devices & apps",
        "Pro Support",
      ],
    },
    {
      id: 2,
      name: "PREMIUM PLAN",
      duration: "6 MONTHS",
      description: "Great for casual streamers.",
      recommended: true,
      features: [
        "17,000+ Live Channels",
        "190,000+ Movies",
        "8,000+ Series",
        "Compatible with all devices & apps",
        "VIP Support",
      ],
    },
    {
      id: 3,
      name: "ULTIMATE PLAN",
      duration: "12 MONTHS",
      description: "Great for casual streamers.",
      features: [
        "17,000+ Live Channels",
        "120,000+ Movies",
        "8,000+ Series",
        "Compatible with all devices & apps",
        "Priority Support",
      ],
    },
  ];

  // Reusable button component with responsive sizing
  const ControlButton = ({
    children,
    isActive,
    onClick,
    className = "",
    size = "medium",
  }) => {
    const baseClasses =
      "font-semibold transition-all duration-200 font-secondary";

    const sizeClasses = {
      small: "w-10 h-10 text-xs sm:w-12 sm:h-12 sm:text-sm",
      medium:
        "px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-base",
      large:
        "px-4 py-2.5 text-sm sm:px-5 sm:py-3 sm:text-base md:px-6 md:py-4 md:text-lg",
    };

    const activeClasses = isActive
      ? "bg-cyan-400 text-black rounded-[10px]"
      : "text-white hover:bg-gray-600 border border-[#FFFFFF26] rounded-[10px]";

    return (
      <button
        className={`${baseClasses} ${sizeClasses[size]} ${activeClasses} ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
    );
  };

  const handleProceedToCheckout = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="px-3 sm:px-6">
      <div className="bg-black text-white min-h-screen py-4 sm:py-6 font-primary max-w-[1280px] mx-auto mt-16 sm:mt-20 rounded-xl sm:rounded-2xl border border-[#FFFFFF26]">
        {/* Header */}
        <h1 className="text-white text-sm sm:text-base md:text-lg px-2 sm:px-6 font-semibold mb-6 sm:mb-8 tracking-wide text-left">
          SELECT SUBSCRIPTION PERIOD:
        </h1>
        {/* Subscription Plans */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-6 sm:gap-4 mb-6 sm:mb-8 px-2 sm:px-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border bg-[#0e0e11] rounded-lg p-3 sm:p-4 md:p-5 cursor-pointer transition-all duration-200 ${
                selectedPlan === plan.id
                  ? "border-[#FFFFFF26] md:border-primary"
                  : "border-[#FFFFFF26]"
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.recommended && (
                <div
                  className="absolute w-full mx-auto -top-4 sm:-top-5 left-1/2 transform -translate-x-1/2
                 bg-cyan-400 text-black px-3 sm:px-4 py-1 rounded-t-[20px] text-xs font-semibold flex items-center 
                 justify-center gap-1 font-secondary"
                >
                  <span>
                    <RiFireFill />
                  </span>
                  <span className="hidden sm:inline">Recommended</span>
                  <span className="sm:hidden">Rec.</span>
                </div>
              )}

              <div className="text-left font-secondary">
                <h3 className="text-white font-bold text-lg sm:text-xl md:text-2xl mb-1 font-primary">
                  {plan.name}
                </h3>
                <p className="text-[#AFAFAF] text-[10px] sm:text-sm mb-2 sm:mb-3">
                  {plan.description}
                </p>
                <div className="text-white text-base sm:text-lg font-bold mb-3 sm:mb-4">
                  {plan.duration}
                </div>

                {/* Features Section */}
                <div className="space-y-2">
                  <p className="text-[#AFAFAF] text-xs mb-2 sm:mb-3">
                    Features:
                  </p>
                  <div className="space-y-[8px] sm:space-y-[10px]">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-[#00b877] text-xs mt-0.5">✓</span>
                        <span className="text-white text-[10px] sm:text-sm leading-tight">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Bottom Control Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-b border-[#FFFFFF26]">
          {/* Select Devices */}
          <div className="p-4 sm:p-6 lg:col-span-4 border-r border-[#FFFFFF26]">
            <h3 className="text-white font-semibold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 font-primary">
              Select Devices:
            </h3>
            <div className="flex gap-2 mb-4 sm:mb-6">
              {[1, 2, 3].map((device) => (
                <ControlButton
                  key={device}
                  isActive={selectedDevices === device}
                  onClick={() => setSelectedDevices(device)}
                  size="small"
                >
                  {device}
                </ControlButton>
              ))}
            </div>
          </div>

          {/* Adult Channels */}
          <div className="p-4 sm:p-6 lg:col-span-3 border-r border-[#FFFFFF26]">
            <h3 className="text-white font-semibold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 font-primary">
              Adult Channels:
            </h3>
            <div className="flex gap-2 sm:gap-3">
              <ControlButton
                isActive={adultChannels}
                onClick={() => setAdultChannels(true)}
                size="medium"
              >
                On
              </ControlButton>
              <ControlButton
                isActive={!adultChannels}
                onClick={() => setAdultChannels(false)}
                size="medium"
              >
                Off
              </ControlButton>
            </div>
          </div>

          {/* Select Quantity */}
          <div className="p-4 sm:p-6 lg:col-span-5">
            <h3 className="text-white font-semibold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 font-primary">
              Select Quantity:
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
              {[1, 3, 5].map((quantity) => (
                <ControlButton
                  key={quantity}
                  isActive={selectedQuantity === quantity}
                  onClick={() => setSelectedQuantity(quantity)}
                  size="medium"
                >
                  {quantity}
                </ControlButton>
              ))}
              <ControlButton
                isActive={![1, 3, 5].includes(selectedQuantity)}
                onClick={() => setSelectedQuantity(10)}
                size="medium"
              >
                Custom
              </ControlButton>
            </div>
          </div>
        </div>
        {/* Bulk Discount Offers */}
        <div className="max-w-lg ml-4 mr-4 md:mx-auto mt-5 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl p-4 sm:p-6 shadow-lg shadow-[#00b877]/10">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="w-2 h-2 bg-[#00b877] rounded-full"></div>
            <span className="text-[#00b877] text-xs sm:text-sm font-semibold uppercase tracking-wide">
              Bulk Discount Offers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-center justify-between bg-[#ffffff]/5 border border-[#00b877]/20 rounded-lg p-3 hover:bg-[#00b877]/5 transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#00b877] rounded-full"></div>
                <span className="text-[#ffffff] font-medium text-xs sm:text-sm">
                  3 Orders
                </span>
              </div>
              <span className="text-[#00b877] font-bold text-xs sm:text-sm">
                5% OFF
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#ffffff]/5 border border-[#00b877]/20 rounded-lg p-3 hover:bg-[#00b877]/5 transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#00b877] rounded-full"></div>
                <span className="text-[#ffffff] font-medium text-xs sm:text-sm">
                  5 Orders
                </span>
              </div>
              <span className="text-[#00b877] font-bold text-xs sm:text-sm">
                10% OFF
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#ffffff]/5 border border-[#00b877]/20 rounded-lg p-3 hover:bg-[#00b877]/5 transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#00b877] rounded-full"></div>
                <span className="text-[#ffffff] font-medium text-xs sm:text-sm">
                  10 Orders
                </span>
              </div>
              <span className="text-[#00b877] font-bold text-xs sm:text-sm">
                15% OFF
              </span>
            </div>
          </div>
        </div>
        {/* Proceed Button */}
        <div className="mt-6 sm:mt-8 flex justify-center px-4 ">
          <Button
            className="font-secondary w-full sm:w-[350px] md:w-[420px] lg:w-[526px] font-bold text-base"
            onClick={handleProceedToCheckout}
          >
            PROCEED TO PURCHASE
          </Button>
        </div>
      </div>

      {/* Register Form Modal */}
      <RegisterFormPopup isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default PricingPlan;
