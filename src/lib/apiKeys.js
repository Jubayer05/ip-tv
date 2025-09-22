"use client";

// Cache for API keys to avoid repeated database calls
let apiKeysCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getApiKeys = async () => {
  // Return cached data if still valid
  if (
    apiKeysCache &&
    cacheTimestamp &&
    Date.now() - cacheTimestamp < CACHE_DURATION
  ) {
    return apiKeysCache;
  }

  try {
    const response = await fetch("/api/admin/settings");
    const data = await response.json();

    if (data.success) {
      apiKeysCache = data.data;
      cacheTimestamp = Date.now();
      return data.data;
    }
  } catch (error) {
    console.error("Failed to fetch API keys:", error);
  }

  return null;
};

export const clearApiKeysCache = () => {
  apiKeysCache = null;
  cacheTimestamp = null;
};
