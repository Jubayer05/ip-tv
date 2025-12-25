import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import AffiliateClient from "./AffiliateClient";

export async function generateMetadata() {
  try {
    // Direct DB access instead of HTTP fetch (avoids Docker networking issues)
    await connectToDatabase();
    const settings = await Settings.getSettings();

    if (settings?.metaManagement?.affiliate) {
      const meta = settings.metaManagement.affiliate;
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
    title: "Earn Money Sharing Cheap Stream - Affiliate Program",
    description:
      "Know people who'd love cheap TV? Refer them and earn cash. Our affiliate program pays real commissions—no gimmicks, just straight-up money for every sale you bring in.",
    keywords:
      "affiliate program, refer and earn, side income, streaming referral, make money online",
    openGraph: {
      title: "Earn Money Sharing Cheap Stream - Affiliate Program",
      description:
        "Know people who'd love cheap TV? Refer them and earn cash. Our affiliate program pays real commissions—no gimmicks, just straight-up money for every sale you bring in.",
    },
  };
}

export default function Affiliate() {
  return <AffiliateClient />;
}
