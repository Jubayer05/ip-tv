import FAQ from "@/components/features/Home/FaqHome";
import ContactBanner from "@/components/features/Support/Contact/ContactBanner";
import ContactForm from "@/components/features/Support/Contact/ContactForm";
import ContactInfo from "@/components/features/Support/Contact/ContactInfo";

export default function ContactPage() {
  return (
    <div className="-mt-14">
      <div className="py-16">
        <ContactBanner />
        <div className="flex justify-between items-start container mt-16">
          <ContactInfo />
          <ContactForm />
        </div>

        <FAQ />
      </div>
    </div>
  );
}
