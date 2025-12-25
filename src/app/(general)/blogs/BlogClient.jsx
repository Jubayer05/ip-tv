"use client";
import BlogBanner from "@/components/features/Blogs/BlogBaner";
import BlogContent from "@/components/features/Blogs/BlogsContent";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function BlogClient() {
  usePageTracking("blogs");

  return (
    <div className="-mt-8 md:-mt-14">
      <div className="py-16">
        <BlogBanner />
        <BlogContent />
      </div>
    </div>
  );
}
