import BlogBanner from "@/components/features/Blogs/BlogBaner";
import BlogContent from "@/components/features/Blogs/BlogsContent";

export async function generateMetadata() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();

    if (data.success && data.data.metaManagement?.blogs) {
      const meta = data.data.metaManagement.blogs;
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

export default function Pricing() {
  return (
    <div className="-mt-8 md:-mt-14">
      <div className="py-16">
        <BlogBanner />
        <BlogContent />
      </div>
    </div>
  );
}
