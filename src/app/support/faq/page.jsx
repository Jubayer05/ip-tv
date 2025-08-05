import FAQ from "@/components/features/Home/FaqHome";
import FaqBanner from "@/components/features/Support/FAQ/FaqBanner";
import FaqTimeline from "@/components/features/Support/FAQ/FaqTimeline";
import FaqStillQuestion from "@/components/features/Support/FAQ/StillQuestion";

export default function FaqPage() {
  return (
    <div className="-mt-8 md:-mt-14">
      <div className="py-16">
        <FaqBanner />
        <FaqTimeline />
        <div className="bg-black pt-1 pb-16">
          <FAQ />
        </div>
        <FaqStillQuestion />
      </div>
    </div>
  );
}
