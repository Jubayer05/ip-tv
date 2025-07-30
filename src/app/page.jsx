import FAQ from "@/components/features/Home/FaqHome";
import FeatureHome from "@/components/features/Home/FeatureHome";
import HomeSubscribe from "@/components/features/Home/HomeSubscribe";
import LatestTrailers from "@/components/features/Home/LatestTrailers";
import MainBanner from "@/components/features/Home/MainBanner";
import TrendingMovies from "@/components/features/Home/TrendingMovie";

export default function Home() {
  return (
    <div className="-mt-14">
      <div className="py-16">
        <MainBanner />
        <TrendingMovies />
        <FeatureHome />
        <LatestTrailers />
        <HomeSubscribe />
        <FAQ />
      </div>
    </div>
  );
}
