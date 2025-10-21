"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const ReviewInput = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  // Fetch user's orders available for review
  useEffect(() => {
    if (user?._id) {
      fetchAvailableOrders();
    }
  }, [user]);

  const fetchAvailableOrders = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/reviews/user-orders?userId=${user?._id}`
      );

      const data = await response.json();

      if (data.success) {
        setAvailableOrders(data.data);
      } else {
        console.error("Failed to fetch orders:", data.error);
        setAvailableOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setAvailableOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    setRating(value);
  };

  const handleStarClick = (starIndex) => {
    const starValue = starIndex + 1;
    setRating(starValue);
  };

  const handleStarHover = (starIndex) => {
    setHover(starIndex + 1);
  };

  const handleStarLeave = () => {
    setHover(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      Swal.fire({
        icon: "error",
        title: "Rating Required",
        text: "Please select a star rating.",
      });
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      Swal.fire({
        icon: "error",
        title: "Comment Too Short",
        text: "Please write at least 10 characters for your review.",
      });
      return;
    }

    // Check if user has any completed orders
    if (availableOrders.length === 0) {
      Swal.fire({
        icon: "error",
        title: "No Orders Available",
        text: "You need to have at least one completed order to leave a review.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?._id,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Review Submitted!",
          text: data.message,
        });

        // Reset form
        setRating(0);
        setHover(0);
        setComment("");

        // Refresh available orders
        fetchAvailableOrders();
      } else {
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: data.error || "Failed to submit review",
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?._id) {
    return (
      <div className="max-w-[600px] font-secondary ml-4 mr-4 md:mx-auto mt-5 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl p-4 sm:p-6 shadow-lg shadow-[#00b877]/10">
        <div className="text-center">
          <div className="w-2 h-2 bg-[#00b877] rounded-full mx-auto mb-3"></div>
          <p className="text-[#ffffff] text-sm">
            Please log in to leave a review.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-[600px] font-secondary ml-4 mr-4 md:mx-auto mt-5 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl p-4 sm:p-6 shadow-lg shadow-[#00b877]/10">
        <div className="animate-pulse">
          <div className="w-2 h-2 bg-[#00b877] rounded-full mb-4"></div>
          <div className="h-4 bg-[#ffffff]/20 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-[#ffffff]/20 rounded w-1/2 mb-2"></div>
          <div className="h-20 bg-[#ffffff]/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (availableOrders.length === 0) {
    return (
      <div className="max-w-[600px] font-secondary ml-4 mr-4 md:mx-auto mt-5 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl p-4 sm:p-6 shadow-lg shadow-[#00b877]/10">
        <div className="text-center">
          <div className="w-2 h-2 bg-[#00b877] rounded-full mx-auto mb-3"></div>
          <p className="text-[#ffffff] text-sm mb-2">
            No orders available for review.
          </p>
          <p className="text-[#ffffff]/60 text-xs">
            You need to have at least one completed order to leave a review.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] font-secondary ml-4 mr-4 md:mx-auto mt-5 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00b877]/30 rounded-xl p-4 sm:p-6 shadow-lg shadow-[#00b877]/10">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="w-2 h-2 bg-[#00b877] rounded-full"></div>
        <span className="text-[#00b877] text-xs sm:text-sm font-semibold uppercase tracking-wide">
          Leave a Review
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-[#ffffff] text-xs sm:text-sm font-medium mb-2">
            Rating
          </label>

          {/* Interactive Stars */}
          <div
            className="flex items-center space-x-1 mb-3"
            onMouseLeave={() => setHover(0)}
          >
            {[...Array(5)].map((_, index) => {
              const displayRating = hover > 0 ? hover : rating; // slider drives when not hovering
              const fullStars = Math.floor(displayRating);
              const fraction = displayRating - fullStars;
              const fillWidth =
                index < fullStars
                  ? "100%"
                  : index === fullStars && fraction > 0
                  ? `${fraction * 100}%`
                  : "0%";

              return (
                <div
                  key={index}
                  className="relative cursor-pointer"
                  onClick={() => handleStarClick(index)}
                  onMouseEnter={() => handleStarHover(index)}
                >
                  <Star
                    className="transition-colors duration-200"
                    color="#ffffff40"
                    size={24}
                    fill="transparent"
                  />
                  <div
                    className="absolute top-0 left-0 overflow-hidden transition-all duration-200 z-10"
                    style={{ width: fillWidth }}
                  >
                    <Star
                      className="top-0 left-0"
                      color="#00b877"
                      size={24}
                      fill="#00b877"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rating Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={handleSliderChange}
              className="w-full h-2 bg-[#ffffff]/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #00b877 0%, #00b877 ${
                  (rating / 5) * 100
                }%, #ffffff20 ${(rating / 5) * 100}%, #ffffff20 100%)`,
              }}
            />

            {/* Rating Display */}
            <div className="flex justify-between items-center">
              <span className="text-[#00b877] text-xs sm:text-sm font-medium">
                {rating > 0
                  ? `${rating.toFixed(1)} star${rating !== 1 ? "s" : ""}`
                  : "Select rating"}
              </span>
              <div className="flex space-x-1 text-[#ffffff]/40 text-xs">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="comment"
            className="block text-[#ffffff] text-xs sm:text-sm font-medium mb-2"
          >
            Your Review
          </label>
          <textarea
            id="comment"
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with our service... (minimum 10 characters)"
            className="w-full px-3 py-2 bg-[#ffffff]/5 border border-[#00b877]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b877] focus:border-transparent resize-none text-[#ffffff] placeholder-[#ffffff]/60"
            maxLength="1000"
          />
          <div className="mt-1 text-[#ffffff]/60 text-xs text-right">
            {comment.length}/1000
            {comment.length > 0 && comment.length < 10 && (
              <span className="ml-2 text-red-400">
                (Need {10 - comment.length} more characters)
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            submitting ||
            rating === 0 ||
            !comment.trim() ||
            comment.trim().length < 10
          }
          className="w-full bg-[#00b877] text-[#ffffff] py-2 px-4 rounded-lg hover:bg-[#00a066] focus:outline-none focus:ring-2 focus:ring-[#00b877] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] disabled:bg-[#ffffff]/20 disabled:text-[#ffffff]/40 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #00b877;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #00b877;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ReviewInput;
