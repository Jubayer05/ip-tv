"use client";
import { generateVisitorId, getDeviceInfo } from "@/lib/fingerprint";
import { useEffect, useRef } from "react";

export const usePageTracking = (slug) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!slug || hasTracked.current) {
      return;
    }

    const trackPageVisit = async () => {
      try {
        hasTracked.current = true;

        const visitorId = await generateVisitorId();
        const deviceInfo = getDeviceInfo();

        const response = await fetch(`/api/url-tracking/track-by-slug`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            visitorId,
            deviceInfo,
            slug: slug.toString(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log(`Page visit tracked for slug: ${slug}`);
          }
        }
      } catch (error) {
        console.error("Failed to track page visit:", error);
      }
    };

    trackPageVisit();
  }, [slug]);
};
