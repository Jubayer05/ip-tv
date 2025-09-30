"use client";
import Button from "@/components/ui/button";
import { useEffect, useState } from "react";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import { MdReviews } from "react-icons/md";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    rating: "all",
    sort: "newest",
  });

  const reviewsPerPage = 12;

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [currentPage, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        approved: "true",
        page: currentPage.toString(),
        limit: reviewsPerPage.toString(),
        sort: filters.sort,
        populate: "userId",
      });

      if (filters.rating !== "all") {
        params.append("rating", filters.rating);
      }

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();

      if (data.success) {
        const currentTime = new Date();
        // Filter reviews to only show those that are ready to be displayed
        const filteredReviews = data.data.filter((review) => {
          // If no scheduledFor, it's a regular review (always show)
          if (!review.scheduledFor) {
            return true;
          }
          // If scheduledFor exists, only show if it's in the past or current time
          return new Date(review.scheduledFor) <= currentTime;
        });

        // Shuffle the filtered reviews
        const shuffledReviews = shuffleArray([...filteredReviews]);
        setReviews(shuffledReviews);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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

  const getUserDisplayName = (review) => {
    if (review.userId?.profile?.firstName && review.userId?.profile?.lastName) {
      return `${review.userId.profile.firstName} ${review.userId.profile.lastName}`;
    }
    return review.uniqueName || "Anonymous";
  };

  const getUserInitial = (review) => {
    if (review.userId?.profile?.firstName) {
      return review.userId.profile.firstName.charAt(0).toUpperCase();
    }
    if (review.uniqueName) {
      return review.uniqueName.charAt(0).toUpperCase();
    }
    return "A";
  };

  const getDisplayDate = (review) => {
    // Use scheduledFor if available, otherwise use createdAt
    const dateToUse = review.scheduledFor || review.createdAt;
    return new Date(dateToUse)
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(
        /(\d+)\/(\d+)\/(\d+),?\s*(\d+):(\d+)\s*(AM|PM)/,
        (match, month, day, year, hour, minute, period) => {
          return `${year}/${month}/${day} ${hour}:${minute} ${period}`;
        }
      );
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 rounded-lg transition-colors ${
            i === currentPage
              ? "bg-[#00b877] text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="bg-black pt-12 text-white overflow-hidden min-h-screen">
        <div className="container py-8 px-4 md:px-8 lg:px-12">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-800 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
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

  if (reviews.length === 0 && !loading) {
    return (
      <div className="bg-black pt-12 text-white overflow-hidden min-h-screen">
        <div className="container py-8 px-4 md:px-8 lg:px-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider uppercase mb-4">
            Customer Reviews
          </h1>
          <p className="text-gray-400 font-secondary text-lg">
            No reviews available yet. Be the first to leave a review!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black pt-12 text-white overflow-hidden min-h-screen">
      <div className="container py-8 px-4 md:px-8 lg:px-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider uppercase mb-6">
            Customer Reviews
          </h1>

          {stats && (
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="text-center">
                <div className="flex justify-center items-center mb-2">
                  {renderStars(Math.round(stats.averageRating))}
                  <span className="ml-2 text-3xl font-bold text-white">
                    {stats.averageRating
                      ? stats.averageRating.toFixed(1)
                      : "0.0"}
                  </span>
                </div>
                <p className="text-gray-400 font-secondary text-sm">
                  Based on {stats.totalReviews} review
                  {stats.totalReviews !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          <p className="text-gray-300 font-secondary text-lg max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers
            have to say about our service.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div className="flex items-center space-x-4">
              <label className="text-gray-300 font-medium">
                Filter by Rating:
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#00b877]"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-gray-300 font-medium">Sort by:</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#00b877]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating-high">Highest Rating</option>
                <option value="rating-low">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Masonry-style Reviews Grid */}
        <div className="masonry-grid mb-8">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="masonry-item bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-[#00b877] transition-all duration-300 break-inside-avoid mb-6"
            >
              <div className="flex items-center mb-4">
                <FaQuoteLeft className="text-[#00b877] text-2xl mr-3" />
                <div className="flex items-center">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-sm text-gray-400">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              <p className="text-gray-300 mb-6 text-sm md:text-base leading-relaxed">
                "{review.comment}"
              </p>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#00b877] to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {getUserInitial(review)}
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-white text-sm md:text-base">
                    {getUserDisplayName(review)}
                  </h4>
                  <p className="text-gray-400 text-xs md:text-sm font-secondary">
                    {getDisplayDate(review)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator for pagination */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#00b877]"></div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && renderPagination()}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-bold mb-4">Share Your Experience</h3>
          <p className="text-gray-400 mb-6">
            Have you used our service? We'd love to hear from you!
          </p>
          <Button variant="primary" size="md">
            <div className="flex items-center">
              <MdReviews className="w-5 h-5 mr-2" />
              Write a Review
            </div>
          </Button>
        </div>

        {/* Masonry Grid Styles */}
        <style jsx>{`
          .masonry-grid {
            column-count: 1;
            column-gap: 1.5rem;
            column-fill: balance;
          }

          @media (min-width: 768px) {
            .masonry-grid {
              column-count: 2;
            }
          }

          @media (min-width: 1024px) {
            .masonry-grid {
              column-count: 3;
            }
          }

          @media (min-width: 1280px) {
            .masonry-grid {
              column-count: 4;
            }
          }

          .masonry-item {
            display: inline-block;
            width: 100%;
            break-inside: avoid;
            margin-bottom: 1.5rem;
          }

          /* Alternative CSS Grid approach */
          .masonry-grid-alt {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            grid-auto-rows: min-content;
            gap: 1.5rem;
            grid-auto-flow: row dense;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ReviewsPage;
