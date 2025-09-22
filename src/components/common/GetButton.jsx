"use client";
import { useEffect, useState } from "react";

export default function GetButton() {
  const [getButtonEnabled, setGetButtonEnabled] = useState(false);
  const [widgetId, setWidgetId] = useState("");

  useEffect(() => {
    const checkGetButtonSetting = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.addons) {
          setGetButtonEnabled(data.data.addons.getButton);
          if (data.data.apiKeys?.getButton?.widgetId) {
            setWidgetId(data.data.apiKeys.getButton.widgetId);
          }
        }
      } catch (error) {
        console.error("Failed to check GetButton setting:", error);
      }
    };

    checkGetButtonSetting();
  }, []);

  useEffect(() => {
    if (!getButtonEnabled || !widgetId) return;

    // GetButton.io chat widget
    const script = document.createElement("script");
    script.src = "https://w.app/widget.js";
    script.setAttribute("data-id", widgetId);
    script.async = true;

    // Customize widget appearance
    script.setAttribute("data-color", "#3B82F6"); // Blue color
    script.setAttribute("data-text", "Need help?"); // Custom text
    script.setAttribute("data-position", "right"); // Position on right

    document.head.appendChild(script);

  }, [getButtonEnabled, widgetId]);

  return null;
}
