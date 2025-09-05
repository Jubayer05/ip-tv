import { useEffect, useState } from "react";

export const useVPNDetection = () => {
  const [vpnStatus, setVpnStatus] = useState({
    loading: true,
    isVPN: false,
    isBlocked: false,
    country: null,
    countryCode: null,
    error: null,
  });

  useEffect(() => {
    const detectVPN = async () => {
      try {
        setVpnStatus((prev) => ({ ...prev, loading: true, error: null }));

        // First get the IP address (same as FreeTrial)
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        if (!ipResponse.ok) {
          throw new Error("Failed to get IP address");
        }
        const { ip } = await ipResponse.json();

        // Then check VPN status using the existing API
        const vpnResponse = await fetch("/api/vpn/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ip }),
        });

        if (!vpnResponse.ok) {
          throw new Error("Failed to check VPN status");
        }

        const vpnData = await vpnResponse.json();
        if (!vpnData.success) {
          throw new Error(vpnData.error || "VPN check failed");
        }

        // Get country information separately
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

        setVpnStatus({
          loading: false,
          isVPN: vpnData.data.isVPN,
          isBlocked: vpnData.data.isVPN, // Block if VPN is detected
          country: countryInfo?.country || "Unknown",
          countryCode: countryInfo?.countryCode || "XX",
          error: null,
        });
      } catch (error) {
        console.error("VPN detection error:", error);
        setVpnStatus({
          loading: false,
          isVPN: false,
          isBlocked: false, // Allow registration if detection fails
          country: null,
          countryCode: null,
          error: error.message,
        });
      }
    };

    detectVPN();
  }, []);

  return vpnStatus;
};
