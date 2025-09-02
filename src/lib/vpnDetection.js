const cache = new Map(); // Simple in-memory cache (replace with Redis for production)

const PRIMARY_API_KEY = process.env.IP_API_KEY || "free"; // ip-api.com is free
const SECONDARY_API_KEY = process.env.VPNAPI_KEY;

async function checkVPN(ip) {
  // 1. Check cache (24 hour cache)
  const cached = cache.get(ip);

  if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
    return cached.result;
  }

  // 2. Try primary API (ip-api.com - free)
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,proxy,hosting,mobile`
    );
    if (res.ok) {
      const data = await res.json();
      const result = {
        status: "success",
        ip,
        isVPN: data.proxy || data.hosting,
        isProxy: data.proxy,
        isHosting: data.hosting,
        isMobile: data.mobile,
        source: "ip-api.com",
      };
      cache.set(ip, { result, timestamp: Date.now() });
      return result;
    }
    throw new Error("Primary API failed");
  } catch (err) {
    console.warn("Primary API (ip-api.com) failed:", err.message);
  }

  // 3. Try secondary API (vpnapi.io)
  if (SECONDARY_API_KEY) {
    try {
      const res = await fetch(
        `https://vpnapi.io/api/${ip}?key=${SECONDARY_API_KEY}`
      );
      if (res.ok) {
        const data = await res.json();
        const result = {
          status: "success",
          ip,
          isVPN:
            data.security?.vpn ||
            data.security?.proxy ||
            data.security?.tor ||
            data.security?.relay,
          isProxy: data.security?.proxy,
          isTor: data.security?.tor,
          isRelay: data.security?.relay,
          source: "vpnapi.io",
        };
        cache.set(ip, { result, timestamp: Date.now() });
        return result;
      }
      throw new Error("Secondary API failed");
    } catch (err) {
      console.warn("Secondary API (vpnapi.io) failed:", err.message);
    }
  }

  // 4. Fallback if both fail
  const unknownResult = {
    status: "unknown",
    ip,
    isVPN: false, // Default to allowing if we can't detect
    source: "fallback",
  };
  cache.set(ip, { result: unknownResult, timestamp: Date.now() });
  return unknownResult;
}

export { checkVPN };
