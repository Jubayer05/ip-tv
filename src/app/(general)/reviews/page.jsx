import ReviewsPage from "@/components/features/UserReview/ReviewsPage";

export const metadata = {
  title: "Customer Reviews - See What People Say About Cheap Stream",
  description:
    "Real reviews from real customers. See why thousands of people switched to Cheap Stream for their TV and movie streaming. No fake testimonials, just honest feedback.",
  keywords:
    "Cheap Stream reviews, customer feedback, streaming reviews, IPTV testimonials, user ratings",
  openGraph: {
    title: "Customer Reviews - See What People Say About Cheap Stream",
    description:
      "Real reviews from real customers. See why thousands of people switched to Cheap Stream for their TV and movie streaming. No fake testimonials, just honest feedback.",
  },
};

export default function Reviews() {
  return (
    <div className="-mt-8 md:-mt-14">
      <ReviewsPage />
    </div>
  );
}
