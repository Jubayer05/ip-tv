"use client";
import KnowledgeBaseBanner from "@/components/features/Privacy_Terms/KnowledgeBaseBanner";
import KnowledgeBaseContent from "@/components/features/Privacy_Terms/KnowledgeBaseContent";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function Pricing() {
  usePageTracking("knowledge-base");

  return (
    <div className="-mt-8 md:-mt-14">
      <div className="py-16">
        <KnowledgeBaseBanner />
        <KnowledgeBaseContent />
      </div>
    </div>
  );
}
