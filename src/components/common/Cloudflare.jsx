"use client";
import { useEffect, useState } from "react";

export default function Cloudflare() {
  const [cloudflareEnabled, setCloudflareEnabled] = useState(false);

  useEffect(() => {
    const checkCloudflareSetting = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.addons) {
          setCloudflareEnabled(data.data.addons.cloudflare);
        }
      } catch (error) {
        console.error("Failed to check Cloudflare setting:", error);
      }
    };

    checkCloudflareSetting();
  }, []);

  useEffect(() => {
    if (!cloudflareEnabled) return;

    // Use the exact Cloudflare tracking code format
    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    script.setAttribute(
      "data-cf-beacon",
      '{"token": "' + process.env.NEXT_PUBLIC_CLOUDFLARE_TOKEN + '"}'
    );

    document.head.appendChild(script);
  }, [cloudflareEnabled]);

  return null;
}
