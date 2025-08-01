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

  // Reusable button component
  const ControlButton = ({
    children,
    isActive,
    onClick,
    className = "",
    size = "medium",
  }) => {
    const baseClasses =
      "font-semibold text-sm transition-all duration-200 font-secondary";
    const sizeClasses = {
      small: "w-12 h-12",
      medium: "px-6 py-3",
      large: "px-4 py-3",
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
    <div className="bg-black text-white min-h-screen py-6 font-primary max-w-[1280px] mx-auto mt-20 rounded-2xl border border-[#FFFFFF26]">
      <div className="">
        {/* Header */}
        <h1 className="text-white text-lg px-6 font-semibold mb-8 tracking-wide">
          SELECT SUBSCRIPTION PERIOD:
        </h1>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 px-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border rounded-lg p-5 cursor-pointer transition-all duration-200 ${
                selectedPlan === plan.id
                  ? "border-primary bg-[#0e0e11]"
                  : "border-[#FFFFFF26] bg-[#0e0e11]"
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.recommended && (
                <div
                  className="absolute w-full mx-auto -top-5 left-1/2 transform -translate-x-1/2
                 bg-cyan-400 text-black px-4 py-1 rounded-t-[20px] text-xs font-semibold flex items-center 
                 justify-center gap-1 font-secondary"
                >
                  <span>
                    <RiFireFill />
                  </span>
                  Recommended
                </div>
              )}

              <div className="text-left font-secondary">
                <h3 className="text-white font-bold text-2xl mb-1 font-primary">
                  {plan.name}
                </h3>
                <p className="text-[#AFAFAF] text-xs mb-3">
                  {plan.description}
                </p>
                <div className="text-white text-xl font-bold mb-4">
                  {plan.duration}
                </div>

                {/* Features Section */}
                <div className="space-y-2">
                  <p className="text-[#AFAFAF] text-xs mb-3">Features:</p>
                  <div className="space-y-[10px]">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-[#00b877] text-xs">✓</span>
                        <span className="text-white text-sm leading-tight">
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
          <div className="p-6 lg:col-span-4 border-r border-[#FFFFFF26]">
            <h3 className="text-white font-semibold text-2xl mb-4 font-primary">
              Select Devices:
            </h3>
            <div className="flex gap-2 mb-6">
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
            <div className="space-y-2">
              <p className="text-[#afafaf] font-medium font-secondary">
                Devices Discount Details:
              </p>
              <div className="flex justify-between font-secondary">
                <div className="flex items-center gap-2">
                  <span className="text-[#00b877]">✓</span>
                  <span className="text-[#ffffff]">3 = 5% OFF</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00b877]">✓</span>
                  <span className="text-[#ffffff]">5 = 10% OFF</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00b877]">✓</span>
                  <span className="text-[#ffffff]">10 = 15% OFF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Adult Channels */}
          <div className="p-6 lg:col-span-3 border-r border-[#FFFFFF26] px-6">
            <h3 className="text-white font-semibold text-2xl mb-4 font-primary">
              Adult Channels:
            </h3>
            <div className="flex gap-3">
              <ControlButton
                isActive={adultChannels}
                onClick={() => setAdultChannels(true)}
                size="medium"
              >
                Yes
              </ControlButton>
              <ControlButton
                isActive={!adultChannels}
                onClick={() => setAdultChannels(false)}
                size="medium"
              >
                No
              </ControlButton>
            </div>
          </div>

          {/* Select Quantity */}
          <div className=" p-6 lg:col-span-5">
            <h3 className="text-white font-semibold text-2xl mb-4 font-primary">
              Select Quantity:
            </h3>
            <div className="flex gap-3 mb-6">
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
            <div className="space-y-2">
              <p className="text-[#afafaf] font-medium font-secondary">
                Quantity Discount Details:{" "}
              </p>
              <div className="flex justify-between font-secondary md:pr-16">
                <div className="flex items-center gap-2">
                  <span className="text-[#00b877]">✓</span>
                  <span className="text-[#ffffff]">3 = 5% OFF</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00b877]">✓</span>
                  <span className="text-[#ffffff]">5 = 10% OFF</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00b877]">✓</span>
                  <span className="text-[#ffffff]">10 = 15% OFF</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="mt-8 flex justify-center">
          <Button
            className="font-secondary w-[526px] font-bold text-base"
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
