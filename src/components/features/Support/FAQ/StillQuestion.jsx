"use client";

import Button from "@/components/ui/button";
import Link from "next/link";

const FaqStillQuestion = () => {
  return (
    <div className="text-white pt-16 px-8 font-secondary">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h2 className="text-3xl uppercase md:text-5xl font-bold mb-6 tracking-wide text-center">
          Still have questions?{" "}
        </h2>
        <p className="text-white text-sm font-bold max-w-3xl mx-auto leading-relaxed text-center">
          Visit our Contact Page or Submit a Ticket for personalized support.
        </p>
        <div className="flex justify-center">
          <Link href="/support/contact">
            <Button className="mt-10">Contact Us Now</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FaqStillQuestion;
