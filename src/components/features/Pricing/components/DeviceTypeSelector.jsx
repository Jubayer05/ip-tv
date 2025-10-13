"use client";

const DeviceTypeSelector = ({
  selectedDeviceType,
  setSelectedDeviceType,
  texts,
}) => {
  const deviceTypes = [
    {
      value: 0,
      name: "M3U Playlist",
      description: "For IPTV players, VLC, etc.",
    },
    { value: 1, name: "MAG Device", description: "For MAG set-top boxes" },
    { value: 2, name: "Enigma2", description: "For Enigma2 receivers" },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-white font-semibold text-lg mb-4 text-center">
        {texts.controls.deviceType.title}
      </h3>
      <div className="flex flex-wrap justify-center gap-3">
        {deviceTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedDeviceType(type.value)}
            className={`px-4 py-3 rounded-lg border transition-all duration-200 text-left min-w-[200px] ${
              selectedDeviceType === type.value
                ? "border-[#00b877] bg-[#00b877]/20 text-[#00b877]"
                : "border-[#FFFFFF26] text-gray-300 hover:border-[#44dcf3]/50"
            }`}
          >
            <div className="font-medium text-sm">{type.name}</div>
            <div className="text-xs opacity-75 mt-1">{type.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DeviceTypeSelector;
