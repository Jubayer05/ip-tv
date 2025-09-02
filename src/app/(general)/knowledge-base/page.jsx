import KnowledgeBaseBanner from "@/components/features/Privacy_Terms/KnowledgeBaseBanner";
import KnowledgeBaseContent from "@/components/features/Privacy_Terms/KnowledgeBaseContent";

export async function generateMetadata() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();

    if (data.success && data.data.metaManagement?.knowledgeBase) {
      const meta = data.data.metaManagement.knowledgeBase;
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
    title: "Knowledge Base - Cheap Stream | IPTV Help & Support",
    description:
      "Find answers to common IPTV questions, setup guides, troubleshooting tips, and comprehensive support resources for Cheap Stream services.",
    keywords:
      "knowledge base, IPTV help, streaming support, setup guides, troubleshooting, Cheap Stream support, IPTV tutorials",
    openGraph: {
      title: "Knowledge Base - Cheap Stream | IPTV Help & Support",
      description:
        "Find answers to common IPTV questions, setup guides, troubleshooting tips, and comprehensive support resources for Cheap Stream services.",
    },
  };
}

export default function Pricing() {
  return (
    <div className="-mt-8 md:-mt-14">
      <div className="py-16">
        <KnowledgeBaseBanner />
        <KnowledgeBaseContent />
      </div>
    </div>
  );
}
