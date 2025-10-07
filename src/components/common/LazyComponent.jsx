"use client";
import { Suspense, lazy } from "react";

// Lazy load heavy components
export const LazyTrendingCommon = lazy(() =>
  import("@/components/ui/TrendingCommon")
);
export const LazyMainBanner = lazy(() =>
  import("@/components/features/Home/MainBanner")
);
export const LazyFooter = lazy(() => import("@/components/layout/Footer"));

// Loading component
export const ComponentLoader = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-800 rounded-lg h-64 w-full"></div>
  </div>
);

// Wrapper for lazy components
export const LazyWrapper = ({ children, fallback }) => (
  <Suspense fallback={fallback || <ComponentLoader />}>{children}</Suspense>
);
