"use client";
import { useEffect, useState } from "react";

export default function TrustPilotWidget() {
  const [trustPilotEnabled, setTrustPilotEnabled] = useState(false);
  const [businessId, setBusinessId] = useState("");

  useEffect(() => {
    const checkTrustPilotSetting = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.addons) {
          setTrustPilotEnabled(data.data.addons.trustPilot);
          if (data.data.apiKeys?.trustPilot) {
            setBusinessId(data.data.apiKeys.trustPilot.businessId || "");
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

    // Load TrustPilot widget script
    const script = document.createElement("script");
    script.src =
      "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        'script[src*="trustpilot"]'
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [trustPilotEnabled, businessId]);

  if (!trustPilotEnabled || !businessId) {
    return null;
  }

  return (
    <div className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-400 text-lg">
            Trusted by thousands of satisfied customers worldwide
          </p>
        </div>

        {/* TrustPilot Widget */}
        <div
          className="trustpilot-widget"
          data-locale="en-US"
          data-template-id="54ad5defc6454f065c28af8b"
          data-businessunit-id={businessId}
          data-style-height="400px"
          data-style-width="100%"
          data-theme="dark"
        >
          <a
            href={`https://www.trustpilot.com/review/cheapstream.com?businessunit=${businessId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Trustpilot
          </a>
        </div>
      </div>
    </div>
  );
}
