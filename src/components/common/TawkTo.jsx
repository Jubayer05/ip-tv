"use client";
import { useEffect, useState } from "react";

export default function TawkTo() {
  const [enabled, setEnabled] = useState(false);
  const [propertyId, setPropertyId] = useState("");
  const [widgetId, setWidgetId] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Fetch IDs from backend settings
  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        const json = await res.json();

        if (!json?.success || cancelled) return;

        // Toggle
        setEnabled(!!json?.data?.addons?.tawkTo);

        // Get both propertyId and widgetId from settings
        const pid = json?.data?.apiKeys?.tawkTo?.propertyId || "";
        const wid = json?.data?.apiKeys?.tawkTo?.widgetId || "";

        setPropertyId(pid);
        setWidgetId(wid);

        console.log("TawkTo settings loaded:", {
          enabled: !!json?.data?.addons?.tawkTo,
          propertyId: pid,
          widgetId: wid,
        });
      } catch (error) {
        console.error("Failed to load TawkTo settings:", error);
      }
    };

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  // Inject Tawk script with IDs from server
  useEffect(() => {
    if (!enabled || !propertyId || !widgetId || loaded) return;
    if (typeof window === "undefined") return;

    // Lazy load when user scrolls or after 3 seconds
    const loadTawk = () => {
      const srcUrl = `https://embed.tawk.to/${propertyId}/${widgetId}`;

      if (document.querySelector(`script[src="${srcUrl}"]`)) {
        setLoaded(true);
        return;
      }

      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      const s1 = document.createElement("script");
      s1.async = true;
      s1.src = srcUrl;
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      s1.onload = () => setLoaded(true);

      document.head.appendChild(s1);
    };

    // Load after 3 seconds or on user interaction
    const timer = setTimeout(loadTawk, 3000);
    const loadOnInteraction = () => {
      clearTimeout(timer);
      loadTawk();
      document.removeEventListener("scroll", loadOnInteraction);
      document.removeEventListener("click", loadOnInteraction);
    };

    document.addEventListener("scroll", loadOnInteraction, { once: true });
    document.addEventListener("click", loadOnInteraction, { once: true });

    return () => clearTimeout(timer);
  }, [enabled, propertyId, widgetId, loaded]);

  return null;
}
