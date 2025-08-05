import FAQ from "@/components/features/Home/FaqHome";
import ContactBanner from "@/components/features/Support/Contact/ContactBanner";
import ContactForm from "@/components/features/Support/Contact/ContactForm";
import ContactInfo from "@/components/features/Support/Contact/ContactInfo";

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
