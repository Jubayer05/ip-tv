// IPTV Package IDs
export const IPTV_PACKAGES = {
  2: "1 Month Subscription",
  3: "3 Month Subscription",
  4: "6 Month Subscription",
  5: "12 Month Subscription",
};

// IPTV Template IDs
export const IPTV_TEMPLATES = {
  1: "Bouquet Sorting in Americas",
  2: "Bouquet Sorting in Europe",
  3: "Bouquet Sorting in Middle East",
  4: "Bouquet Sorting in Spain",
  5: "Channels of Arab Countries",
  6: "Channels of Spain",
  7: "Channels of Americas",
  8: "Channels of Europe",
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
