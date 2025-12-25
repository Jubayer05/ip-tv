import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import FAQ from "@/components/features/Home/FaqHome";
import FaqBanner from "@/components/features/Support/FAQ/FaqBanner";
import FaqTimeline from "@/components/features/Support/FAQ/FaqTimeline";
import FaqStillQuestion from "@/components/features/Support/FAQ/StillQuestion";

export async function generateMetadata() {
  try {
    // Direct DB access instead of HTTP fetch (avoids Docker networking issues)
    await connectToDatabase();
    const settings = await Settings.getSettings();

    if (settings?.metaManagement?.faq) {
      const meta = settings.metaManagement.faq;
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
    title: "Common Questions Answered - Cheap Stream FAQ",
    description:
      "Got questions? We've got answers. Learn how to set up your service, fix common issues, understand billing, and get the most out of your Cheap Stream subscription.",
    keywords:
      "FAQ, help center, setup guide, troubleshooting, billing questions, how to use IPTV",
    openGraph: {
      title: "Common Questions Answered - Cheap Stream FAQ",
      description:
        "Got questions? We've got answers. Learn how to set up your service, fix common issues, understand billing, and get the most out of your Cheap Stream subscription.",
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
