import FAQ from "@/components/features/Home/FaqHome";
import FeatureHome from "@/components/features/Home/FeatureHome";
import FreeTrialCard from "@/components/features/Home/FreeTrial";
import HomeSubscribe from "@/components/features/Home/HomeSubscribe";
import LatestTrailers from "@/components/features/Home/LatestTrailers";
import MainBanner from "@/components/features/Home/MainBanner";
import TrendingMovies from "@/components/features/Home/TrendingMovie";
import ReviewShowHome from "@/components/features/UserReview/ReviewShowHome";

export async function generateMetadata() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();

    if (data.success && data.data.metaManagement?.home) {
      const meta = data.data.metaManagement.home;
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
        <ReviewShowHome />
        <FAQ />
      </div>
    </div>
  );
}
