import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import FAQ from "@/components/features/Home/FaqHome";
import ContactBanner from "@/components/features/Support/Contact/ContactBanner";
import ContactForm from "@/components/features/Support/Contact/ContactForm";
import ContactInfo from "@/components/features/Support/Contact/ContactInfo";

export async function generateMetadata() {
  try {
    // Direct DB access instead of HTTP fetch (avoids Docker networking issues)
    await connectToDatabase();
    const settings = await Settings.getSettings();

    if (settings?.metaManagement?.contact) {
      const meta = settings.metaManagement.contact;
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
    title: "Need Help? Get in Touch - Cheap Stream Support",
    description:
      "Have a question or running into issues? Our support team is here around the clock. Drop us a message and we'll get back to you fast—usually within a few hours.",
    keywords:
      "contact support, get help, customer service, reach us, support team",
    openGraph: {
      title: "Need Help? Get in Touch - Cheap Stream Support",
      description:
        "Have a question or running into issues? Our support team is here around the clock. Drop us a message and we'll get back to you fast—usually within a few hours.",
    },
  };
}

export default function ContactPage() {
  return (
    <div className="-mt-8 md:-mt-14">
      <div className="py-8 sm:py-12 md:py-16">
        <ContactBanner />
        <div className="flex flex-col lg:flex-row justify-between items-start container mt-8 sm:mt-12 md:mt-16 gap-8 lg:gap-12">
          <ContactInfo />
          <ContactForm />
        </div>

        <FAQ />
      </div>
    </div>
  );
}
