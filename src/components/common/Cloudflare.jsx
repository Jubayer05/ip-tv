"use client";
import { useEffect, useState } from "react";

export default function Cloudflare() {
  const [cloudflareEnabled, setCloudflareEnabled] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const checkCloudflareSetting = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.addons) {
          setCloudflareEnabled(data.data.addons.cloudflare);
          if (data.data.apiKeys?.cloudflare?.token) {
            setToken(data.data.apiKeys.cloudflare.token);
          }
        }
      } catch (error) {
        console.error("Failed to check Cloudflare setting:", error);
      }
    };

    checkCloudflareSetting();
  }, []);

  useEffect(() => {
    if (!cloudflareEnabled || !token) return;

    // Use the exact Cloudflare tracking code format
    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    script.setAttribute("data-cf-beacon", '{"token": "' + token + '"}');

    document.head.appendChild(script);
  }, [cloudflareEnabled, token]);

  return null;
}
