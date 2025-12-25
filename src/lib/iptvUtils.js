// IPTV Package IDs (MegaOTT)
export const IPTV_PACKAGES = {
  4: "1 Month Subscription",
  6: "3 Month Subscription",
  3: "6 Month Subscription",
  5: "12 Month Subscription",
  8: "24 Month Subscription",
};

// IPTV Template IDs - Auto-selected based on Adult Channels
export const IPTV_TEMPLATES = {
  10742: "Standard",
  13316: "Adult",
};

// Line Types
export const LINE_TYPES = {
  0: "m3u",
  1: "mag",
  2: "enigma2",
};

// Validation functions
export function validateTemplateId(templateId) {
  return Object.keys(IPTV_TEMPLATES).map(Number).includes(templateId);
}

export function validatePackageId(packageId) {
  return Object.keys(IPTV_PACKAGES).map(Number).includes(packageId);
}

export function validateLineType(lineType) {
  return Object.keys(LINE_TYPES).map(Number).includes(lineType);
}

export function validateDeviceCount(count) {
  return count >= 1 && count <= 3;
}

export function validateStatusValue(val) {
  return [0, 1].includes(val);
}

// Helper function to get templateId based on adult channels setting
export function getTemplateIdByAdultChannels(adultChannels) {
  return adultChannels ? 13316 : 10742;
}
