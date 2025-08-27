"use client";
import { useEffect, useState } from "react";

export default function GoogleAnalytics() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [measurementId, setMeasurementId] = useState("");

  useEffect(() => {
    const checkAnalyticsSetting = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.addons) {
          setAnalyticsEnabled(data.data.addons.googleAnalytics);
          // You can also store the measurement ID from settings if needed
          // setMeasurementId(data.data.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
        }
      } catch (error) {
        console.error("Failed to check Google Analytics setting:", error);
      }
    };

    checkAnalyticsSetting();
  }, []);

  useEffect(() => {
    if (!analyticsEnabled) return;

    // Load Google Analytics script
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [analyticsEnabled]);

  // Track page views when route changes
  useEffect(() => {
    if (!analyticsEnabled || !window.gtag) return;

    const handleRouteChange = () => {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
      });
    };

    // Listen for route changes
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [analyticsEnabled]);

  // Don't render anything - this component only handles script injection
  return null;
}
