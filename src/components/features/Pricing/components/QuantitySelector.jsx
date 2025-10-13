"use client";
import Input from "@/components/ui/input";

const QuantitySelector = ({
  selectedQuantity,
  setSelectedQuantity,
  customQuantity,
  setCustomQuantity,
  showCustomInput,
  setShowCustomInput,
  handleQuantityChange,
  handleCustomQuantityChange,
  texts,
}) => {
  return (
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
  );
};

export default QuantitySelector;
