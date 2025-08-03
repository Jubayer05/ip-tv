import ExploreChannelBanner from "@/components/features/ExploreChannel/ExploreChannelBanner";
import TrendingContentSlider from "@/components/features/ExploreChannel/TrendingContentSlider";

export default function ExploreChannels() {
  return (
    <div className="font-secondary">
      <ExploreChannelBanner />
      <TrendingContentSlider />
    </div>
  );
}
