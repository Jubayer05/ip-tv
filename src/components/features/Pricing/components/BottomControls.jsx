"use client";
import ControlButton from "./ControlButton";

const BottomControls = ({
  selectedDevices,
  setSelectedDevices,
  adultChannels,
  setAdultChannels,
  selectedQuantity,
  setSelectedQuantity,
  customQuantity,
  setCustomQuantity,
  showCustomInput,
  setShowCustomInput,
  texts,
}) => {
  // Handle quantity selection with custom logic
  const handleQuantitySelect = (quantity) => {
    if (quantity === "custom") {
      setShowCustomInput(true);
      setSelectedQuantity("custom");
    } else {
      setShowCustomInput(false);
      setSelectedQuantity(quantity);
      setCustomQuantity("");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-b border-[#FFFFFF26]">
      {/* Select Devices */}
      <div className="p-4 sm:p-6 lg:col-span-4 border-r border-[#FFFFFF26]">
        <h3 className="text-white font-semibold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 font-primary">
          {texts.controls.devices.title}
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
          {texts.controls.adultChannels.title}
        </h3>
        <div className="flex gap-2 sm:gap-3">
          <ControlButton
            isActive={adultChannels}
            onClick={() => setAdultChannels(true)}
            size="medium"
          >
            {texts.controls.adultChannels.on}
          </ControlButton>
          <ControlButton
            isActive={!adultChannels}
            onClick={() => setAdultChannels(false)}
            size="medium"
          >
            {texts.controls.adultChannels.off}
          </ControlButton>
        </div>
      </div>

      {/* Select Quantity */}
      <div className="p-4 sm:p-6 lg:col-span-5">
        <h3 className="text-white font-semibold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 font-primary">
          {texts.controls.quantity.title}
        </h3>
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[1, 3, 5].map((quantity) => (
            <ControlButton
              key={quantity}
              isActive={selectedQuantity === quantity}
              onClick={() => handleQuantitySelect(quantity)}
              size="medium"
            >
              {quantity}
            </ControlButton>
          ))}
          <ControlButton
            isActive={selectedQuantity === "custom"}
            onClick={() => handleQuantitySelect("custom")}
            size="medium"
          >
            {texts.controls.quantity.custom}
          </ControlButton>
        </div>

        {/* Custom Quantity Input */}
        {showCustomInput && (
          <div className="mt-4 p-4 bg-[#0e0e11] border border-[#FFFFFF26] rounded-lg">
            <label className="block text-white text-sm font-medium mb-2">
              Enter Custom Quantity:
            </label>
            <input
              type="number"
              min="1"
              value={customQuantity}
              onChange={(e) => setCustomQuantity(e.target.value)}
              placeholder="Enter quantity..."
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#FFFFFF26] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            <p className="text-gray-400 text-xs mt-1">Minimum quantity: 1</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomControls;
