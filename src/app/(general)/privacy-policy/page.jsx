import PrivacyBanner from "@/components/features/Privacy_Terms/PrivacyBanner";
import PrivacyPolicySection from "@/components/features/Privacy_Terms/PrivacyPolicyContent";

export async function generateMetadata() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();

    if (data.success && data.data.metaManagement?.privacyPolicy) {
      const meta = data.data.metaManagement.privacyPolicy;
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
    title: "Privacy Policy - Cheap Stream | Data Protection & Privacy",
    description:
      "Learn about Cheap Stream's privacy policy, data protection practices, and how we safeguard your personal information while using our IPTV services.",
    keywords:
      "privacy policy, data protection, Cheap Stream privacy, IPTV privacy, user data, personal information, privacy terms",
    openGraph: {
      title: "Privacy Policy - Cheap Stream | Data Protection & Privacy",
      description:
        "Learn about Cheap Stream's privacy policy, data protection practices, and how we safeguard your personal information while using our IPTV services.",
    },
  };
}

export default function Pricing() {
  return (
    <div className="-mt-8 md:-mt-14">
      <div className="py-16">
        <PrivacyBanner />
        <PrivacyPolicySection />
      </div>
    </div>
  );
}
