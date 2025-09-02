"use client";
import { useEffect, useState } from "react";

export default function TrustPilot() {
  const [trustPilotEnabled, setTrustPilotEnabled] = useState(false);

  useEffect(() => {
    const checkTrustPilotSetting = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.addons) {
          setTrustPilotEnabled(data.data.addons.trustPilot);
        }
      } catch (error) {
        console.error("Failed to check Trustpilot setting:", error);
      }
    };

    checkTrustPilotSetting();
  }, []);

  useEffect(() => {
    if (!trustPilotEnabled) return;

    // Trustpilot widget script
    const script = document.createElement("script");
    script.src =
      "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
    script.async = true;

    script.onload = () => {
      // Wait a bit for the widget to fully initialize
      setTimeout(() => {
        // Check if Trustpilot and collect are available
        if (
          window.Trustpilot &&
          window.Trustpilot.collect &&
          typeof window.Trustpilot.collect.show === "function"
        ) {
          try {
            window.Trustpilot.collect.show();
          } catch (error) {
            console.error("Error showing Trustpilot collect:", error);
          }
        } else {
          console.warn("Trustpilot collect not fully loaded yet");
        }
      }, 1000); // Wait 1 second for full initialization
    };

    script.onerror = () => {
      console.error("Failed to load Trustpilot widget script");
    };

    document.head.appendChild(script);
  }, [trustPilotEnabled]);

  return null;
}
