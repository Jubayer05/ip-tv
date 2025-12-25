import MainBanner from "@/components/features/Home/MainBanner";
import dynamic from "next/dynamic";

// Minimal loading skeletons with fixed heights to prevent CLS
const FreeTrialSkeleton = () => (
  <div className="max-w-4xl mx-auto p-4 sm:p-6 mt-3 sm:mt-5 min-h-[600px] sm:min-h-[700px] bg-gray-800/20 rounded-2xl" />
);
const MoviesSkeleton = () => (
  <div className="container mx-auto px-4 py-8 min-h-[400px]" />
);
const SectionSkeleton = () => (
  <div className="container mx-auto px-4 py-6 min-h-[300px]" />
);

// Below-the-fold components - lazy loaded for code splitting
const FreeTrialCard = dynamic(
  () => import("@/components/features/Home/FreeTrial"),
  { loading: () => <FreeTrialSkeleton /> }
);

const TrendingMovies = dynamic(
  () => import("@/components/features/Home/TrendingMovie"),
  { loading: () => <MoviesSkeleton /> }
);

const FeatureHome = dynamic(
  () => import("@/components/features/Home/FeatureHome"),
  { loading: () => <SectionSkeleton /> }
);

const LatestTrailers = dynamic(
  () => import("@/components/features/Home/LatestTrailers"),
  { loading: () => <SectionSkeleton /> }
);

const HomeSubscribe = dynamic(
  () => import("@/components/features/Home/HomeSubscribe"),
  { loading: () => <SectionSkeleton /> }
);

const TrustPilotWidget = dynamic(
  () => import("@/components/common/TrustPilotWidget"),
  { loading: () => <SectionSkeleton /> }
);

const ReviewShowHome = dynamic(
  () => import("@/components/features/UserReview/ReviewShowHome"),
  { loading: () => <SectionSkeleton /> }
);

const FAQ = dynamic(() => import("@/components/features/Home/FaqHome"), {
  loading: () => <SectionSkeleton />,
});

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
    title: "Watch live TV, movies, and sports online for cheap",
    description:
      "Finally, a streaming service that doesn't break the bank. Get thousands of live channels, movies, and sports on any device. Plans start at just $5/month.",
    keywords:
      "IPTV, live TV online, stream sports, watch movies, cord cutting, cable replacement, streaming service",
    openGraph: {
      title: "Watch live TV, movies, and sports online for cheap",
      description:
        "Finally, a streaming service that doesn't break the bank. Get thousands of live channels, movies, and sports on any device. Plans start at just $5/month.",
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
