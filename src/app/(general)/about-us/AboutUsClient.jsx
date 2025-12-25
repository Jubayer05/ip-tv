"use client";
import AboutOurMission from "@/components/features/AboutUs/AboutOurMission";
import AboutStatistics from "@/components/features/AboutUs/AboutStatistic";
import FAQ from "@/components/features/Home/FaqHome";
import FeatureHome from "@/components/features/Home/FeatureHome";
import HomeSubscribe from "@/components/features/Home/HomeSubscribe";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function AboutUsClient() {
  usePageTracking("about-us");

  return (
    <div className="-mt-8 md:-mt-14">
      <div className="pt-24">
        <AboutOurMission />
        <FeatureHome featureAbout={true} />
        <AboutStatistics />
        <HomeSubscribe />
        <FAQ />
      </div>
    </div>
  );
}
