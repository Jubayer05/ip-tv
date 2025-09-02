import AboutOurMission from "@/components/features/AboutUs/AboutOurMission";
import AboutStatistics from "@/components/features/AboutUs/AboutStatistic";
import FAQ from "@/components/features/Home/FaqHome";
import FeatureHome from "@/components/features/Home/FeatureHome";
import HomeSubscribe from "@/components/features/Home/HomeSubscribe";

export async function generateMetadata() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();

    if (data.success && data.data.metaManagement?.about) {
      const meta = data.data.metaManagement.about;
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
    title: "About Us - Cheap Stream | Premium IPTV Service Provider",
    description:
      "Discover Cheap Stream's mission to provide premium IPTV services worldwide.",
    keywords: "IPTV service provider, streaming service, Cheap Stream about us",
    openGraph: {
      title: "About Us - Cheap Stream | Premium IPTV Service Provider",
      description:
        "Discover Cheap Stream's mission to provide premium IPTV services worldwide.",
    },
  };
}

export default function AboutUs() {
  return (
    <div className="-mt-8 md:-mt-14">
      <div className="py-16">
        <AboutOurMission />
        <FeatureHome featureAbout={true} />
        <AboutStatistics />
        <AboutOurMission />
        <HomeSubscribe />
        <FAQ />
      </div>
    </div>
  );
}
