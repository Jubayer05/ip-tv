"use client";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

let fpPromise = null;

// Initialize FingerprintJS
const getFingerprint = async () => {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  return fpPromise;
};

// Generate visitor ID using FingerprintJS
export const generateVisitorId = async () => {
  try {
    const fp = await getFingerprint();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error("FingerprintJS failed:", error);
    // Fallback to a simple random string
    return (
      Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    );
  }
};

// Get device info for tracking
export const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString(),
  };
};
