import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import BlogClient from "./BlogClient";

export async function generateMetadata() {
  try {
    // Direct DB access instead of HTTP fetch (avoids Docker networking issues)
    await connectToDatabase();
    const settings = await Settings.getSettings();

    if (settings?.metaManagement?.blogs) {
      const meta = settings.metaManagement.blogs;
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
    title: "Blog - Cheap Stream | Latest IPTV News & Updates",
    description:
      "Stay updated with the latest IPTV news, streaming technology updates, and entertainment industry insights from Cheap Stream's expert team.",
    keywords:
      "IPTV blog, streaming news, entertainment blog, Cheap Stream blog, IPTV updates, streaming technology, entertainment industry",
    openGraph: {
      title: "Blog - Cheap Stream | Latest IPTV News & Updates",
      description:
        "Stay updated with the latest IPTV news, streaming technology updates, and entertainment industry insights from Cheap Stream's expert team.",
    },
  };
}

export default function Blog() {
  return <BlogClient />;
}
