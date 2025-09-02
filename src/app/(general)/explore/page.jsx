import ExploreChannelBanner from "@/components/features/ExploreChannel/ExploreChannelBanner";
import TrendingContentSlider from "@/components/features/ExploreChannel/TrendingContentSlider";

export async function generateMetadata() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();

    if (data.success && data.data.metaManagement?.explore) {
      const meta = data.data.metaManagement.explore;
      return {
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        openGraph: {
          title: meta.openGraph.title,
          description: meta.openGraph.description,
        },
      };
    }
  } catch (error) {
    console.error("Failed to fetch meta settings:", error);
  }

  // Fallback metadata
  return {
    title: "Explore Channels - Cheap Stream | Discover Premium Content",
    description:
      "Explore thousands of premium channels, movies, and TV shows on Cheap Stream. Discover new content and enjoy unlimited entertainment.",
    keywords:
      "explore channels, IPTV channels, premium content, streaming channels, Cheap Stream explore, entertainment discovery, TV channels",
    openGraph: {
      title: "Explore Channels - Cheap Stream | Discover Premium Content",
      description:
        "Explore thousands of premium channels, movies, and TV shows on Cheap Stream. Discover new content and enjoy unlimited entertainment.",
    },
  };
}

export default function ExploreChannels() {
  return (
    <div className="font-secondary">
      <ExploreChannelBanner />
      <TrendingContentSlider />
    </div>
  );
}
