"use client";

const AccountConfigurationBox = ({
  index,
  configuration,
  onUpdateConfiguration,
  texts,
}) => {
  return (
    <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-[#00b877]/20 rounded-lg p-4 mb-4">
      <h4 className="text-white font-semibold text-lg mb-4 text-center">
        {texts.controls.accountBox.title} #{index + 1}
      </h4>

      {/* Device Selector for this account */}
      <div className="mb-4">
        <h5 className="text-white font-medium text-sm mb-2 text-center">
          {texts.controls.devices.title}
        </h5>
        <div className="flex flex-wrap justify-center gap-2">
          {[1, 2, 3].map((deviceCount) => (
            <button
              key={deviceCount}
              onClick={() =>
                onUpdateConfiguration(index, "devices", deviceCount)
              }
              className={`px-3 py-1 rounded-lg border transition-all duration-200 text-sm ${
                configuration.devices === deviceCount
                  ? "border-[#00b877] bg-[#00b877]/20 text-[#00b877]"
                  : "border-[#FFFFFF26] text-gray-300 hover:border-[#44dcf3]/50"
              }`}
            >
              {deviceCount}{" "}
              {deviceCount === 1
                ? texts.controls.devices.device
                : texts.controls.devices.devices}
            </button>
          ))}
        </div>
      </div>

      {/* Adult Channels Selector for this account */}
      <div>
        <h5 className="text-white font-medium text-sm mb-2 text-center">
          {texts.controls.adultChannels.title}
        </h5>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => onUpdateConfiguration(index, "adultChannels", false)}
            className={`px-4 py-1 rounded-lg border transition-all duration-200 text-sm ${
              !configuration.adultChannels
                ? "border-[#00b877] bg-[#00b877]/20 text-[#00b877]"
                : "border-[#FFFFFF26] text-gray-300 hover:border-[#44dcf3]/50"
            }`}
          >
            {texts.controls.adultChannels.off}
          </button>
          <button
            onClick={() => onUpdateConfiguration(index, "adultChannels", true)}
            className={`px-4 py-1 rounded-lg border transition-all duration-200 text-sm ${
              configuration.adultChannels
                ? "border-[#00b877] bg-[#00b877]/20 text-[#00b877]"
                : "border-[#FFFFFF26] text-gray-300 hover:border-[#44dcf3]/50"
            }`}
          >
            {texts.controls.adultChannels.on}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountConfigurationBox;
