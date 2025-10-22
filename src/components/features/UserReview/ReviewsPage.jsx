"use client";
import Button from "@/components/ui/button";
import { MessageSquare, Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import Masonry from 'react-masonry-css';

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

  // Breakpoint configuration for responsive masonry
  const breakpointColumnsObj = {
    default: 4,
    1280: 3,
    1024: 2,
    768: 1
  };

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
        sort: "-createdAt", // Sort by createdAt descending (newest first)
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

        // Sort by createdAt descending (newest first)
        const sortedReviews = filteredReviews.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        });

        setReviews(sortedReviews);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
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
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((star, index) => (
      <Star
        key={index}
        color={index < rating ? "#00b877" : "#ffffff40"}
        size={16}
        fill={index < rating ? "#00b877" : "transparent"}
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

        {/* Horizontal Masonry Grid */}
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {reviews.map((review) => (
            <div
              key={review._id}
              className="masonry-item bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-[#00b877] transition-all duration-300 break-inside-avoid mb-6"
            >
              <div className="flex items-center mb-4">
                <Quote className="text-[#00b877] text-2xl mr-3" />
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
        </Masonry>

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
              <MessageSquare className="w-5 h-5 mr-2" />
              Write a Review
            </div>
          </Button>
        </div>

        {/* Updated Masonry Grid Styles */}
        <style jsx>{`
          .masonry-grid {
            display: flex;
            margin-left: -1.5rem;
            width: auto;
          }

          .masonry-grid_column {
            padding-left: 1.5rem;
            background-clip: padding-box;
          }

          .masonry-item {
            margin-bottom: 1.5rem;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ReviewsPage;