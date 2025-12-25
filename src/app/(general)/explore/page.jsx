import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import ExploreClient from "./ExploreClient";

export async function generateMetadata() {
  try {
    // Direct DB access instead of HTTP fetch (avoids Docker networking issues)
    await connectToDatabase();
    const settings = await Settings.getSettings();

    if (settings?.metaManagement?.explore) {
      const meta = settings.metaManagement.explore;
      return {
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        openGraph: {
          title: meta.openGraph?.title || meta.title,
          description: meta.openGraph?.description || meta.description,
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
  return <ExploreClient />;
}
