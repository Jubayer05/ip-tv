"use client";
const AdultChannelsSelector = ({ adultChannels, setAdultChannels, texts }) => {
  return (
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
  );
};

export default AdultChannelsSelector;
