import AboutOurMission from "@/components/features/AboutUs/AboutOurMission";
import AboutStatistics from "@/components/features/AboutUs/AboutStatistic";
import AboutUsBanner from "@/components/features/AboutUs/AboutUsBanner";
import FAQ from "@/components/features/Home/FaqHome";
import FeatureHome from "@/components/features/Home/FeatureHome";
import HomeSubscribe from "@/components/features/Home/HomeSubscribe";

export default function AboutUs() {
  return (
    <div className="-mt-14">
      <div className="py-16">
        <AboutUsBanner />
        <FeatureHome featureAbout={true} />
        <AboutStatistics />
        <AboutOurMission />
        <HomeSubscribe />
        <FAQ />
      </div>
    </div>
  );
}
