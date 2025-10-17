"use client";

import Image from "next/image";
import { useState } from "react";

const DeviceTypeSelector = ({
  selectedDeviceType,
  setSelectedDeviceType,
  texts,
  onDeviceInfoChange, // New prop to handle device info changes
}) => {
  const [deviceInfo, setDeviceInfo] = useState({
    macAddress: "",
    enigma2Info: "",
  });

  const deviceTypes = [
    {
      value: 0,
      name: "M3U Playlist",
      description: "Compatible with most IPTV players",
      icon: "https://cdn-icons-png.flaticon.com/128/10422/10422338.png",
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-400/30",
      requiresInput: false,
    },
    {
      value: 1,
      name: "MAG Device",
      description: "For MAG set-top boxes",
      icon: "https://cdn-icons-png.flaticon.com/128/4663/4663580.png",
      iconColor: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-400/30",
      requiresInput: true,
      inputType: "mac",
      inputLabel: "MAC Address",
      inputPlaceholder: "Enter MAC address (e.g., 00:1A:2B:3C:4D:5E)",
    },
    {
      value: 2,
      name: "Enigma2",
      description: "For Enigma2 receivers",
      icon: "https://cdn-icons-png.flaticon.com/128/5393/5393167.png",
      iconColor: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-400/30",
      requiresInput: true,
      inputType: "enigma2",
      inputLabel: "Device Information",
      inputPlaceholder: "Enter device model or additional info",
    },
  ];

  const handleInputChange = (value, inputType) => {
    const newDeviceInfo = {
      ...deviceInfo,
      [inputType]: value,
    };
    setDeviceInfo(newDeviceInfo);

    // Call parent component callback if provided
    if (onDeviceInfoChange) {
      onDeviceInfoChange(newDeviceInfo);
    }
  };

  const validateMacAddress = (mac) => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  };

  return (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 text-center">
        {texts.controls.deviceType.title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 justify-items-center">
        {deviceTypes.map((type) => {
          const isSelected = selectedDeviceType === type.value;

          return (
            <div
              key={type.value}
              className="w-full max-w-[200px] sm:max-w-[220px]"
            >
              <button
                onClick={() => setSelectedDeviceType(type.value)}
                className={`relative w-full p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  isSelected
                    ? `${type.borderColor} ${type.bgColor} shadow-lg shadow-current/20`
                    : "border-[#FFFFFF26] bg-[#0e0e11] hover:border-white/40 hover:bg-[#1a1a1a]"
                }`}
              >
                {/* Icon Container */}
                <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
                  <div
                    className={`p-2 sm:p-3 rounded-full ${
                      isSelected ? `${type.bgColor}` : "bg-gray-700/50"
                    }`}
                  >
                    <Image
                      src={type.icon}
                      alt={type.name}
                      width={20}
                      height={20}
                      className={`sm:w-6 sm:h-6 md:w-8 md:h-8 ${
                        isSelected ? "filter brightness-110" : "opacity-60"
                      }`}
                      unoptimized
                    />
                  </div>
                </div>

                {/* Text Content */}
                <div className="text-center">
                  <div
                    className={`font-semibold text-xs sm:text-sm md:text-base mb-1 sm:mb-2 ${
                      isSelected ? type.iconColor : "text-white"
                    }`}
                  >
                    {type.name}
                  </div>
                  <div className="text-xs sm:text-sm opacity-75 leading-relaxed">
                    {type.description}
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-current rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>

              {/* Input Field for Selected Device */}
              {isSelected && type.requiresInput && (
                <div className="mt-3 sm:mt-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    {type.inputLabel}
                  </label>
                  <input
                    type="text"
                    value={deviceInfo[type.inputType] || ""}
                    onChange={(e) =>
                      handleInputChange(e.target.value, type.inputType)
                    }
                    placeholder={type.inputPlaceholder}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border transition-colors text-xs sm:text-sm ${
                      type.inputType === "mac" &&
                      deviceInfo.macAddress &&
                      !validateMacAddress(deviceInfo.macAddress)
                        ? "border-red-500 bg-red-500/10"
                        : "border-gray-600 bg-gray-800/50"
                    } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-current focus:border-transparent`}
                  />
                  {type.inputType === "mac" &&
                    deviceInfo.macAddress &&
                    !validateMacAddress(deviceInfo.macAddress) && (
                      <p className="text-red-400 text-xs mt-1">
                        Please enter a valid MAC address format
                      </p>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeviceTypeSelector;
