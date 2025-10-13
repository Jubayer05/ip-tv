"use client";
const DeviceSelector = ({ selectedDevices, setSelectedDevices, texts }) => {
  return (
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
  );
};

export default DeviceSelector;
