"use client";
import { useEffect, useState } from "react";

export default function TrustPilotWidget() {
  const [trustPilotEnabled, setTrustPilotEnabled] = useState(false);
  const [businessId, setBusinessId] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const checkTrustPilotSetting = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.addons) {
          setTrustPilotEnabled(data.data.addons.trustPilot);
          if (data.data.apiKeys?.trustPilot) {
            setBusinessId(data.data.apiKeys.trustPilot.businessId || "");
            setApiKey(data.data.apiKeys.trustPilot.apiKey || "");
          }
        }
      } catch (error) {
        console.error("Failed to check TrustPilot setting:", error);
      }
    };

    checkTrustPilotSetting();
  }, []);

  useEffect(() => {
    if (!trustPilotEnabled || !businessId) return;

    // TrustPilot widget implementation
    // You can implement the TrustPilot widget here using businessId and apiKey
    console.log("TrustPilot enabled with business ID:", businessId);
  }, [trustPilotEnabled, businessId, apiKey]);

  return null;
}
