"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const ReviewShowHome = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews?approved=true&limit=20");
      const data = await response.json();

      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/reviews/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((star, index) => (
      <FaStar
        key={index}
        color={index < rating ? "#00b877" : "#ffffff40"}
        size={16}
      />
    ));
  };

  const CustomArrow = ({ className, style, onClick, direction }) => (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white 
        rounded-full flex items-center justify-center transition-all duration-300
         transform hover:scale-110 border border-[rgba(255,255,255,0.49)] ${
           direction === "next" ? "right-4" : "left-4"
         }`}
      style={{ ...style, display: "flex" }}
    >
      {direction === "next" ? (
        <ChevronRight className="w-6 h-6 " />
      ) : (
        <ChevronLeft className="w-6 h-6" />
      )}
    </button>
  );

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: true,
    nextArrow: <CustomArrow direction="next" />,
    prevArrow: <CustomArrow direction="prev" />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="bg-black pt-12 text-white overflow-hidden">
        <div className="container py-8 px-4 md:px-8 lg:px-12">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-800 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800 p-6 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-16 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className=" bg-black pt-12  text-white overflow-hidden">
        <div className="container py-8 px-4 md:px-8 lg:px-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-wider uppercase mb-4">
            Customer Reviews
          </h2>
          <p className="text-gray-400 font-secondary text-xs md:text-base">
            No reviews available yet. Be the first to leave a review!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-black pt-12 text-white overflow-hidden">
      <div className="container py-8 px-4 md:px-8 lg:px-12">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-wider uppercase mb-4">
            What Our Customers Say
          </h2>

          {stats && (
            <div className="flex justify-center items-center space-x-6 mb-6">
              <div className="text-center">
                <div className="flex justify-center items-center mb-2">
                  {renderStars(Math.round(stats.averageRating))}
                  <span className="ml-2 text-2xl font-bold text-white">
                    {stats.averageRating
                      ? stats.averageRating.toFixed(1)
                      : "0.0"}
                  </span>
                </div>
                <p className="text-gray-400 font-secondary text-xs md:text-base">
                  Based on {stats.totalReviews} review
                  {stats.totalReviews !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          <p className="text-gray-300 font-secondary text-xs md:text-xl max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers
            have to say about our service.
          </p>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          <Slider {...sliderSettings}>
            {reviews.map((review) => (
              <div key={review._id} className="px-2">
                <div className="relative group cursor-pointer">
                  <div className="bg-gray-800 rounded-lg p-6 h-full border border-gray-700 hover:border-[#00b877] transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <FaQuoteLeft className="text-[#00b877] text-2xl mr-3" />
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-400">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-6 line-clamp-4 text-sm md:text-base">
                      "{review.comment}"
                    </p>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#00b877] to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {review.userId?.profile?.firstName?.charAt(0) || "A"}
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-white text-sm md:text-base">
                          {review.userId?.profile?.firstName}{" "}
                          {review.userId?.profile?.lastName}
                        </h4>
                        <p className="text-gray-400 text-xs md:text-sm font-secondary">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Statistics Bar */}
        {stats && stats.starDistribution && (
          <div className="mt-12 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              Rating Breakdown
            </h3>
            <div className="max-w-md mx-auto space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.starDistribution[star.toString()] || 0;
                const percentage =
                  stats.totalReviews > 0
                    ? (count / stats.totalReviews) * 100
                    : 0;

                return (
                  <div key={star} className="flex items-center">
                    <span className="flex items-center w-16">
                      <span className="text-sm mr-1 text-gray-300">{star}</span>
                      <FaStar color="#00b877" size={12} />
                    </span>
                    <div className="flex-1 mx-3">
                      <div className="bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-[#00b877] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Slick Carousel Styles */}
        <style jsx global>{`
          .slick-prev,
          .slick-next {
            display: none !important;
          }

          .slick-track {
            display: flex;
            align-items: center;
          }

          .slick-slide {
            height: auto;
          }

          .slick-slide > div {
            height: 100%;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ReviewShowHome;
