"use client";
import { useEffect, useState } from "react";

export default function GoogleAnalytics() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const checkAnalyticsSetting = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.addons) {
          setAnalyticsEnabled(data.data.addons.googleAnalytics);
        }
      } catch (error) {
        console.error("Failed to check Google Analytics setting:", error);
      }
    };

    checkAnalyticsSetting();
  }, []);

  useEffect(() => {
    if (!analyticsEnabled) return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Define gtag function
    function gtag() {
      window.dataLayer.push(arguments);
    }

    // Assign to window so it's globally available
    window.gtag = gtag;

    // Load Google Analytics script
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`;
    script.async = true;

    // Wait for script to load before initializing
    script.onload = () => {
      // Initialize gtag after script loads
      gtag("js", new Date());
      gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
      });

      console.log("Google Analytics loaded successfully");
    };

    script.onerror = () => {
      console.error("Failed to load Google Analytics script");
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Clean up global gtag
      delete window.gtag;
    };
  }, [analyticsEnabled]);

  // Track page views when route changes
  useEffect(() => {
    if (!analyticsEnabled || !window.gtag) return;

    const handleRouteChange = () => {
      if (window.gtag) {
        window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
          page_title: document.title,
          page_location: window.location.href,
        });
      }
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
