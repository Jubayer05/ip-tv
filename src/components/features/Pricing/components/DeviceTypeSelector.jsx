"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const DeviceTypeSelector = ({
  selectedDeviceType,
  setSelectedDeviceType,
  texts,
  onDeviceInfoChange, // New prop to handle device info changes
  deviceInfo, // Device info from parent
}) => {
  const [localDeviceInfo, setLocalDeviceInfo] = useState({
    macAddress: "",
    enigma2Info: "",
  });

  // Sync with parent device info
  useEffect(() => {
    if (deviceInfo) {
      setLocalDeviceInfo(deviceInfo);
    }
  }, [deviceInfo]);

  const deviceTypes = [
    {
      value: 0,
      name: "M3U Playlist",
      description: "For most IPTV players",
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
      ...localDeviceInfo,
      [inputType]: value,
    };
    setLocalDeviceInfo(newDeviceInfo);

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
    <div className="mb-3">
      <h3 className="text-white font-semibold text-xs sm:text-sm mb-2 text-center">
        {texts.controls.deviceType.title}
      </h3>
      <div className="grid grid-cols-3 gap-2 justify-items-center">
        {deviceTypes.map((type) => {
          const isSelected = selectedDeviceType === type.value;

          return (
            <div key={type.value} className="w-full">
              <button
                onClick={() => setSelectedDeviceType(type.value)}
                className={`relative w-full p-2 rounded-md border-2 transition-all duration-300 hover:scale-105 ${
                  isSelected
                    ? `${type.borderColor} ${type.bgColor} shadow-lg shadow-current/20`
                    : "border-[#FFFFFF26] bg-[#0e0e11] hover:border-white/40 hover:bg-[#1a1a1a]"
                }`}
              >
                {/* Icon Container */}
                <div className="flex justify-center mb-1">
                  <div
                    className={`p-1.5 rounded-full ${
                      isSelected ? `${type.bgColor}` : "bg-gray-700/50"
                    }`}
                  >
                    <Image
                      src={type.icon}
                      alt={type.name}
                      width={16}
                      height={16}
                      className={`${
                        isSelected ? "filter brightness-110" : "opacity-60"
                      }`}
                      unoptimized
                    />
                  </div>
                </div>

                {/* Text Content */}
                <div className="text-center">
                  <div
                    className={`font-semibold text-base mb-0.5 ${
                      isSelected ? type.iconColor : "text-white"
                    }`}
                  >
                    {type.name}
                  </div>
                  <div className="text-xs opacity-75 leading-tight">
                    {type.description}
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-current rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                )}
              </button>

              {/* Input Field for Selected Device */}
              {isSelected && type.requiresInput && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    {type.inputLabel}
                  </label>
                  <input
                    type="text"
                    value={localDeviceInfo[type.inputType] || ""}
                    onChange={(e) =>
                      handleInputChange(e.target.value, type.inputType)
                    }
                    placeholder={type.inputPlaceholder}
                    className={`w-full px-2 py-1 rounded-md border transition-colors text-xs ${
                      type.inputType === "mac" &&
                      localDeviceInfo.macAddress &&
                      !validateMacAddress(localDeviceInfo.macAddress)
                        ? "border-red-500 bg-red-500/10"
                        : "border-gray-600 bg-gray-800/50"
                    } text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-current focus:border-transparent`}
                  />
                  {type.inputType === "mac" &&
                    localDeviceInfo.macAddress &&
                    !validateMacAddress(localDeviceInfo.macAddress) && (
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
