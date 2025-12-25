import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import AboutUsClient from "./AboutUsClient";

export async function generateMetadata() {
  try {
    // Direct DB access instead of HTTP fetch (avoids Docker networking issues)
    await connectToDatabase();
    const settings = await Settings.getSettings();

    if (settings?.metaManagement?.about) {
      const meta = settings.metaManagement.about;
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
    title: "About Cheap Stream TV - Our Story and What Drives Us",
    description:
      "We started Cheap Stream because everyone deserves good TV at a fair price. Learn how we built a service that puts viewers first, not profits.",
    keywords: "about Cheap Stream, streaming company, who we are, our mission",
    openGraph: {
      title: "About Cheap Stream TV - Our Story and What Drives Us",
      description:
        "We started Cheap Stream because everyone deserves good TV at a fair price. Learn how we built a service that puts viewers first, not profits.",
    },
  };
}

export default function AboutUs() {
  return <AboutUsClient />;
}
