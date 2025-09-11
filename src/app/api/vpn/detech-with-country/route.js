import { checkVPN } from "@/lib/vpnDetection";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Get client IP from request headers
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    let ip = forwarded?.split(",")[0] || realIp || "127.0.0.1";

    // If we're in development or localhost, try to get real IP
    if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          ip = ipData.ip;
        }
      } catch (error) {
        console.warn("Failed to get external IP:", error);
      }
    }

    // Detect VPN using the same method as FreeTrial
    const vpnResult = await checkVPN(ip);

    // Get country information using the same IP
    let countryInfo = null;
    try {
      const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        countryInfo = {
          country: geoData.country_name,
          countryCode: geoData.country_code,
          city: geoData.city,
          region: geoData.region,
        };
      }
    } catch (geoError) {
      console.warn("Failed to get country info:", geoError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ip,
        isVPN: vpnResult.isVPN,
        isProxy: vpnResult.isProxy,
        isHosting: vpnResult.isHosting,
        isTor: vpnResult.isTor,
        isRelay: vpnResult.isRelay,
        isMobile: vpnResult.isMobile,
        source: vpnResult.source,
        status: vpnResult.status,
        country: countryInfo?.country || "Unknown",
        countryCode: countryInfo?.countryCode || "XX",
        city: countryInfo?.city || "Unknown",
        region: countryInfo?.region || "Unknown",
      },
    });
  } catch (error) {
    console.error("VPN detection with country error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to detect VPN and location" },
      { status: 500 }
    );
  }
}
