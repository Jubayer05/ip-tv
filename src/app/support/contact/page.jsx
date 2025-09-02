import FAQ from "@/components/features/Home/FaqHome";
import ContactBanner from "@/components/features/Support/Contact/ContactBanner";
import ContactForm from "@/components/features/Support/Contact/ContactForm";
import ContactInfo from "@/components/features/Support/Contact/ContactInfo";

export async function generateMetadata() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();

    if (data.success && data.data.metaManagement?.contact) {
      const meta = data.data.metaManagement.contact;
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
    title: "Contact Us - Cheap Stream | Get Support & Help",
    description:
      "Contact Cheap Stream's support team for help with IPTV services, technical support, billing questions, and general inquiries. We're here to help 24/7.",
    keywords:
      "contact Cheap Stream, IPTV support, customer service, technical support, help desk, Cheap Stream contact, streaming support",
    openGraph: {
      title: "Contact Us - Cheap Stream | Get Support & Help",
      description:
        "Contact Cheap Stream's support team for help with IPTV services, technical support, billing questions, and general inquiries. We're here to help 24/7.",
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
