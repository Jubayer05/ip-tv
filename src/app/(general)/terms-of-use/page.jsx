import TermsOfUseBanner from "@/components/features/Privacy_Terms/TermsUseBanner";
import TermsOfUseSection from "@/components/features/Privacy_Terms/TermsUseContent";

export async function generateMetadata() {
  try {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`,
        {
          cache: "no-store",
        }
      );
      const data = await response.json();

      if (data.success && data.data.metaManagement?.termsOfUse) {
        const meta = data.data.metaManagement.termsOfUse;
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
      title: "Terms of Use - Cheap Stream | Service Terms & Conditions",
      description:
        "Read Cheap Stream's terms of use, service conditions, and user agreement. Understand your rights and responsibilities when using our IPTV services.",
      keywords:
        "terms of use, service terms, Cheap Stream terms, IPTV conditions, user agreement, service agreement, terms and conditions",
      openGraph: {
        title: "Terms of Use - Cheap Stream | Service Terms & Conditions",
        description:
          "Read Cheap Stream's terms of use, service conditions, and user agreement. Understand your rights and responsibilities when using our IPTV services.",
      },
    };
  } catch (error) {
    console.error("Failed to fetch meta settings:", error);
  }
}

export default function Pricing() {
  return (
    <div className="-mt-8 md:-mt-14">
      <div className="py-16">
        <TermsOfUseBanner />
        <TermsOfUseSection />
      </div>
    </div>
  );
}
