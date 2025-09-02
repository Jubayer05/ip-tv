import FAQ from "@/components/features/Home/FaqHome";
import FaqBanner from "@/components/features/Support/FAQ/FaqBanner";
import FaqTimeline from "@/components/features/Support/FAQ/FaqTimeline";
import FaqStillQuestion from "@/components/features/Support/FAQ/StillQuestion";

export async function generateMetadata() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();

    if (data.success && data.data.metaManagement?.faq) {
      const meta = data.data.metaManagement.faq;
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
    title: "FAQ - Cheap Stream | Frequently Asked Questions",
    description:
      "Find answers to frequently asked questions about Cheap Stream IPTV services, setup, troubleshooting, billing, and more. Quick solutions to common issues.",
    keywords:
      "FAQ, frequently asked questions, IPTV help, Cheap Stream FAQ, streaming questions, common issues, troubleshooting help",
    openGraph: {
      title: "FAQ - Cheap Stream | Frequently Asked Questions",
      description:
        "Find answers to frequently asked questions about Cheap Stream IPTV services, setup, troubleshooting, billing, and more. Quick solutions to common issues.",
    },
  };
}

export default function FaqPage() {
  return (
    <div className="-mt-8 md:-mt-14">
      <div className="py-16">
        <FaqBanner />
        <FaqTimeline />
        <div className="bg-black pt-1 pb-16">
          <FAQ />
        </div>
        <FaqStillQuestion />
      </div>
    </div>
  );
}
