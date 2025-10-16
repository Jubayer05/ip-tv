"use client";

import AccountConfigurationBox from "./AccountConfigurationBox";
import DeviceTypeSelector from "./DeviceTypeSelector";
import QuantitySelector from "./QuantitySelector";

const PricingControls = ({
  selectedQuantity,
  setSelectedQuantity,
  customQuantity,
  setCustomQuantity,
  showCustomInput,
  setShowCustomInput,
  handleQuantityChange,
  handleCustomQuantityChange,
  selectedDeviceType,
  setSelectedDeviceType,
  accountConfigurations,
  updateAccountConfiguration,
  getActualQuantity,
  texts,
  deviceInfo, // New prop for device info
  onDeviceInfoChange, // New prop for device info callback
}) => {
  const actualQuantity = getActualQuantity();

  return (
    <div className="font-secondary max-w-3xl mt-6 mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl">
      {/* Device Type Selector */}
      <DeviceTypeSelector
        selectedDeviceType={selectedDeviceType}
        setSelectedDeviceType={setSelectedDeviceType}
        texts={texts}
        deviceInfo={deviceInfo}
        onDeviceInfoChange={onDeviceInfoChange}
      />

      {/* Quantity Selector */}
      <QuantitySelector
        selectedQuantity={selectedQuantity}
        setSelectedQuantity={setSelectedQuantity}
        customQuantity={customQuantity}
        setCustomQuantity={setCustomQuantity}
        showCustomInput={showCustomInput}
        setShowCustomInput={setShowCustomInput}
        handleQuantityChange={handleQuantityChange}
        handleCustomQuantityChange={handleCustomQuantityChange}
        texts={texts}
      />

      {/* Individual Account Configuration Boxes */}
      {actualQuantity > 0 && (
        <div className="mt-6">
          <h3 className="text-white font-semibold text-lg mb-4 text-center">
            {texts.controls.accountConfiguration.title}
          </h3>
          <div className="space-y-4">
            {accountConfigurations
              .slice(0, actualQuantity)
              .map((config, index) => (
                <AccountConfigurationBox
                  key={index}
                  index={index}
                  configuration={config}
                  onUpdateConfiguration={updateAccountConfiguration}
                  texts={texts}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingControls;
