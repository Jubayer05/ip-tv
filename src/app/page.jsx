import TrustPilotWidget from "@/components/common/TrustPilotWidget";
import FAQ from "@/components/features/Home/FaqHome";
import FeatureHome from "@/components/features/Home/FeatureHome";
import FreeTrialCard from "@/components/features/Home/FreeTrial";
import HomeSubscribe from "@/components/features/Home/HomeSubscribe";
import MainBanner from "@/components/features/Home/MainBanner";
import dynamic from "next/dynamic";

// Lazy load heavy components
const LatestTrailers = dynamic(
  () => import("@/components/features/Home/LatestTrailers"),
  {
    loading: () => (
      <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
    ),
  }
);

const TrendingMovies = dynamic(
  () => import("@/components/features/Home/TrendingMovie"),
  {
    loading: () => (
      <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
    ),
  }
);

const ReviewShowHome = dynamic(
  () => import("@/components/features/UserReview/ReviewShowHome"),
  {
    loading: () => (
      <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
    ),
  }
);

export async function generateMetadata() {
  try {
    // Read settings directly from DB (no HTTP, no env URL issues)
    const { connectToDatabase } = await import("@/lib/db");
    const Settings = (await import("@/models/Settings")).default;

    await connectToDatabase();
    const settings = await Settings.getSettings();

    const meta = settings?.metaManagement?.home;
    if (meta) {
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
    console.error("Failed to load meta settings:", error);
  }

  // Fallback metadata
  return {
    title: "Cheap Stream | Premium IPTV Service - Live TV, Movies & Sports",
    description:
      "Cheap Stream offers premium IPTV services with thousands of live TV channels, movies, TV shows, and sports. Start streaming today with our affordable plans.",
    keywords:
      "IPTV service, live TV streaming, movie streaming, sports streaming, Cheap Stream, premium streaming, affordable IPTV, entertainment streaming",
    openGraph: {
      title: "Cheap Stream | Premium IPTV Service - Live TV, Movies & Sports",
      description:
        "Cheap Stream offers premium IPTV services with thousands of live TV channels, movies, TV shows, and sports. Start streaming today with our affordable plans.",
    },
  };
}

export default function Home() {
  return (
    <div className="-mt-8 md:-mt-14">
      <div className="py-16">
        <MainBanner />
        <FreeTrialCard />
        <TrendingMovies />
        <FeatureHome />
        <LatestTrailers />
        <HomeSubscribe />
        <TrustPilotWidget />
        <ReviewShowHome />
        <FAQ />
      </div>
    </div>
  );
}
