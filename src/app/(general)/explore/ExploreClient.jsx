"use client";
import ExploreChannelBanner from "@/components/features/ExploreChannel/ExploreChannelBanner";
import TrendingContentSlider from "@/components/features/ExploreChannel/TrendingContentSlider";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function ExploreClient() {
  usePageTracking("explore");

  return (
    <div className="font-secondary pb-24">
      <ExploreChannelBanner />
      <TrendingContentSlider />
    </div>
  );
}
