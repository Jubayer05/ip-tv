"use client";

import { generateVisitorId, getDeviceInfo } from "@/lib/fingerprint";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SlugTrackPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    // Prevent duplicate tracking calls (especially in React StrictMode)
    if (hasTracked.current) {
      return;
    }

    const trackAndRedirect = async () => {
      let responseData = null;
      try {
        // Mark as tracked immediately to prevent duplicate calls
        hasTracked.current = true;
        setLoading(true);

        if (!slug) {
          throw new Error("Slug is required");
        }

        // Generate visitor ID
        const visitorId = await generateVisitorId();

        // Get device info
        const deviceInfo = getDeviceInfo();

        // Track the click using slug - wait for the API call to complete
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

        if (!response.ok) {
          throw new Error(
            `Tracking API failed with status: ${response.status}`
          );
        }

        responseData = await response.json();

        if (responseData.success) {
          // If pageType is "existing", navigate to the actual page without redirect
          if (
            responseData.data.pageType === "existing" &&
            !responseData.data.shouldRedirect
          ) {
            // For existing pages, use the slug directly to navigate
            // The slug already matches the route (e.g., "reviews" -> "/reviews")
            const targetPath = `/${slug}`;

            // Wait a small moment to ensure tracking is saved, then navigate
            // Use replace instead of push to avoid adding to history
            setTimeout(() => {
              router.replace(targetPath);
            }, 100);
          } else {
            // For non-existing pages, redirect to homepage
            setTimeout(() => {
              window.location.href =
                responseData.data.redirectUrl ||
                "https://www.cheapstreamtv.com";
            }, 1000);
          }
        } else {
          throw new Error(responseData.error || "Failed to track click");
        }
      } catch (err) {
        console.error("Tracking error:", err);
        setError(err.message);

        // Redirect to default URL even on error
        setTimeout(() => {
          window.location.href = "https://www.cheapstreamtv.com";
        }, 2000);
      } finally {
        // Only set loading to false if it's not an existing page
        // (existing pages handle loading state in the if block above)
        if (responseData?.data?.pageType !== "existing") {
          setLoading(false);
        }
      }
    };

    if (slug) {
      trackAndRedirect();
    } else {
      // If no slug, redirect immediately
      window.location.href = "https://www.cheapstreamtv.com";
    }
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {loading && (
          <>
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
            <p className="text-white text-lg">Loading...</p>
            <p className="text-gray-400 text-sm mt-2">Please wait</p>
          </>
        )}
        {error && (
          <>
            <div className="mb-4">
              <svg
                className="w-12 h-12 text-red-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-white text-lg">Error: {error}</p>
            <p className="text-gray-400 text-sm mt-2">
              Redirecting to homepage...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
