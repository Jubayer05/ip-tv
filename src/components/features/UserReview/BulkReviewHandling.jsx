"use client";
import { Rating } from "@smastrom/react-rating";
import { useEffect, useState } from "react";
import { FaUpload } from "react-icons/fa";
import Swal from "sweetalert2";

// Import the rating styles
import "@smastrom/react-rating/style.css";

const BulkReviewHandling = () => {
  const [bulkText, setBulkText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [timerRange, setTimerRange] = useState({
    min: 1800, // 30 minutes seconds for testing
    max: 7200, // 2 hours seconds for testing
  });
  const [ratingRange, setRatingRange] = useState({
    min: 3.0, // Minimum rating
    max: 5.0, // Maximum rating
  });
  const [scheduledReviews, setScheduledReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all"); // all, pending, posted
  const [reviewsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchScheduledReviews();
  }, [currentPage, filter]);

  const fetchScheduledReviews = async () => {
    setLoading(true);
    try {
      let url = `/api/reviews/schedule-bulk?page=${currentPage}&limit=${reviewsPerPage}`;

      if (filter !== "all") {
        url += `&status=${filter}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setScheduledReviews(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error("Failed to fetch scheduled reviews:", data.error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Failed to fetch scheduled reviews",
        });
      }
    } catch (error) {
      console.error("Error fetching scheduled reviews:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDynamicStatus = (scheduledFor) => {
    const scheduledTime = new Date(scheduledFor);
    const now = new Date();

    if (scheduledTime <= now) {
      return "posted";
    } else {
      return "pending";
    }
  };

  const getTimeRemaining = (scheduledFor) => {
    const scheduledTime = new Date(scheduledFor);
    const now = new Date();
    const diffMs = scheduledTime.getTime() - now.getTime();

    if (diffMs <= 0) {
      return "Posted";
    }

    const diffSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(diffSeconds / (24 * 60 * 60));
    const hours = Math.floor((diffSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diffSeconds % (60 * 60)) / 60);
    const seconds = diffSeconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(" ") || "0s";
  };

  const getStatusBadge = (scheduledFor, actualStatus) => {
    const dynamicStatus = getDynamicStatus(scheduledFor);

    const statusConfig = {
      pending: { color: "yellow", text: "Pending" },
      posted: { color: "green", text: "Posted" },
      failed: { color: "red", text: "Failed" },
    };

    const config = statusConfig[dynamicStatus] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          config.color === "green"
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : config.color === "yellow"
            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}
      >
        {config.text}
      </span>
    );
  };

  const handleBulkUpload = async () => {
    if (!bulkText.trim()) {
      Swal.fire({
        icon: "warning",
        title: "No Reviews Provided",
        text: "Please enter some reviews in the textarea.",
      });
      return;
    }

    const reviewLines = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (reviewLines.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Valid Reviews",
        text: "Please enter valid reviews (one per line).",
      });
      return;
    }

    if (reviewLines.length > 50) {
      Swal.fire({
        icon: "warning",
        title: "Too Many Reviews",
        text: "Maximum 50 reviews allowed per upload.",
      });
      return;
    }

    setUploading(true);

    try {
      const response = await fetch("/api/reviews/schedule-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviews: reviewLines,
          timerRange: timerRange,
          ratingRange: ratingRange,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Reviews Scheduled!",
          text: `${
            data.data.scheduled
          } reviews scheduled for auto-posting. Next posting at ${new Date(
            data.data.nextPosting
          ).toLocaleString()}`,
          timer: 4000,
          showConfirmButton: false,
        });
        setBulkText("");
        fetchScheduledReviews();
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: data.error || "Failed to schedule reviews",
        });
      }
    } catch (error) {
      console.error("Error uploading reviews:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    } finally {
      setUploading(false);
    }
  };

  const formatTimerRange = (seconds) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} minutes`;
    } else {
      return `${Math.floor(seconds / 3600)} hours`;
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

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
          onClick={() => setCurrentPage(i)}
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
      <div className="flex justify-center items-center space-x-2 mt-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading && scheduledReviews.length === 0) {
    return (
      <div className="mt-4 sm:mt-6 font-secondary">
        <h2 className="text-4xl font-bold text-white mb-4">
          Bulk Review Handling
        </h2>
        <div className="border border-[#212121] bg-black rounded-[15px] p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b877]"></div>
            <p className="text-gray-400 mt-4">Loading scheduled reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 font-secondary">
      <h2 className="text-4xl font-bold text-white mb-4">
        Bulk Review Handling
      </h2>

      <div className="border border-[#212121] bg-black rounded-[15px] p-6">
        {/* Bulk Upload Section */}
        <div className="bg-[#0c171c] rounded-lg border border-[#212121] p-4 mb-6">
          <h3 className="text-white font-medium mb-4">Bulk Upload Reviews</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Enter reviews (one per line, max 50):
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Enter reviews here, one per line...&#10;Excellent service! Highly recommended.&#10;Great quality and fast delivery.&#10;Amazing experience!"
                rows="6"
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none"
                maxLength="25000"
              />
              <div className="mt-1 text-gray-400 text-xs">
                {
                  bulkText.split("\n").filter((line) => line.trim().length > 0)
                    .length
                }{" "}
                reviews ready to upload
              </div>
            </div>

            {/* Timer Range Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Min Timer (seconds):
                </label>
                <input
                  type="number"
                  value={timerRange.min}
                  onChange={(e) =>
                    setTimerRange({
                      ...timerRange,
                      min: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
                <div className="mt-1 text-gray-400 text-xs">
                  {formatTimerRange(timerRange.min)}
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Max Timer (seconds):
                </label>
                <input
                  type="number"
                  value={timerRange.max}
                  onChange={(e) =>
                    setTimerRange({
                      ...timerRange,
                      max: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
                <div className="mt-1 text-gray-400 text-xs">
                  {formatTimerRange(timerRange.max)}
                </div>
              </div>
            </div>

            {/* Rating Range Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Min Rating:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={ratingRange.min}
                  onChange={(e) =>
                    setRatingRange({
                      ...ratingRange,
                      min: parseFloat(e.target.value) || 1.0,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  min="1"
                  max="5"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Max Rating:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={ratingRange.max}
                  onChange={(e) =>
                    setRatingRange({
                      ...ratingRange,
                      max: parseFloat(e.target.value) || 5.0,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  min="1"
                  max="5"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleBulkUpload}
                disabled={uploading || !bulkText.trim()}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
              >
                <FaUpload className="mr-2" />
                {uploading ? "Scheduling..." : "Schedule Reviews"}
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="bg-[#0c171c] rounded-lg border border-[#212121] p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-white text-sm font-medium">
                Filter by Status:
              </label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Reviews</option>
                <option value="pending">Pending</option>
                <option value="posted">Posted</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scheduled Reviews Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#212121]">
                <th className="text-left py-3 px-2 text-white font-medium">
                  Reviewer Name
                </th>
                <th className="text-left py-3 px-2 text-white font-medium">
                  Review Text
                </th>
                <th className="text-left py-3 px-2 text-white font-medium">
                  Rating
                </th>
                <th className="text-left py-3 px-2 text-white font-medium">
                  Scheduled For
                </th>
                <th className="text-left py-3 px-2 text-white font-medium">
                  Status
                </th>
                <th className="text-left py-3 px-2 text-white font-medium">
                  Time Remaining
                </th>
              </tr>
            </thead>
            <tbody>
              {scheduledReviews.map((scheduledReview) => (
                <tr
                  key={scheduledReview._id}
                  className="border-b border-[#212121] hover:bg-[#0c171c]/50"
                >
                  <td className="py-3 px-2 text-white text-sm font-medium">
                    {scheduledReview.uniqueName}
                  </td>
                  <td className="py-3 px-2 text-gray-300 text-sm max-w-xs truncate">
                    {scheduledReview.comment}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center">
                      <Rating
                        value={scheduledReview.rating}
                        readOnly
                        style={{ maxWidth: 100 }}
                      />
                      <span className="ml-2 text-gray-300 text-sm">
                        {scheduledReview.rating}/5
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-gray-400 text-sm">
                    {scheduledReview.scheduledFor
                      ? new Date(scheduledReview.scheduledFor).toLocaleString()
                      : "-"}
                  </td>
                  <td className="py-3 px-2">
                    {getStatusBadge(
                      scheduledReview.scheduledFor,
                      scheduledReview.schedulingStatus
                    )}
                  </td>
                  <td className="py-3 px-2 text-gray-400 text-sm">
                    <span
                      className={`font-mono text-xs ${
                        getDynamicStatus(scheduledReview.scheduledFor) ===
                        "posted"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {getTimeRemaining(scheduledReview.scheduledFor)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
};

export default BulkReviewHandling;
