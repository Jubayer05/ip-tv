import ReviewsPage from "@/components/features/UserReview/ReviewsPage";

export async function generateMetadata() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();

    if (data.success && data.data.metaManagement?.reviews) {
      const meta = data.data.metaManagement.reviews;
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
    title: "Customer Reviews - Cheap Stream | Premium IPTV Service",
    description:
      "Read honest customer reviews and testimonials about Cheap Stream's premium IPTV service. See what our satisfied customers have to say.",
    keywords:
      "IPTV reviews, customer testimonials, Cheap Stream reviews, streaming service reviews",
    openGraph: {
      title: "Customer Reviews - Cheap Stream | Premium IPTV Service",
      description:
        "Read honest customer reviews and testimonials about Cheap Stream's premium IPTV service. See what our satisfied customers have to say.",
    },
  };
}

export default function Reviews() {
  return (
    <div className="-mt-8 md:-mt-14">
      <ReviewsPage />
    </div>
  );
}
