export const parseUserAgent = (userAgent) => {
  const ua = userAgent.toLowerCase();

  // Detect browser
  let browser = "Unknown";
  if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("edg")) browser = "Edge";
  else if (ua.includes("opera")) browser = "Opera";

  // Detect OS
  let os = "Unknown";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad"))
    os = "iOS";

  // Detect device type
  let device = "Desktop";
  if (ua.includes("mobile")) device = "Mobile";
  else if (ua.includes("tablet") || ua.includes("ipad")) device = "Tablet";

  // Detect platform
  let platform = "Web";
  if (ua.includes("mobile")) platform = "Mobile App";
  else if (ua.includes("tablet")) platform = "Tablet App";

  return {
    browser,
    os,
    device,
    platform,
  };
};

export const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    "Unknown"
  );
};
