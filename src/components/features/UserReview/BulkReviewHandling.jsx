"use client";
import TableCustom from "@/components/ui/TableCustom";
import { Rating } from "@smastrom/react-rating";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
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
        className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
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

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        // Show first 4 pages + ellipsis + last page
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page + ellipsis + last 4 pages
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Define columns for the TableCustom component
  const columns = [
    {
      title: "Reviewer Name",
      dataIndex: "uniqueName",
      key: "uniqueName",
      width: "100px",
      render: (text) => (
        <span className="text-white text-xs sm:text-sm font-medium pl-2">
          {text}
        </span>
      ),
    },
    {
      title: "Review Text",
      dataIndex: "comment",
      key: "comment",
      width: "100px",
      render: (text) => (
        <span className="text-gray-300 text-xs sm:text-sm max-w-xs truncate block">
          {text}
        </span>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: "100px",
      render: (rating) => (
        <div className="flex items-center">
          <Rating value={rating} readOnly style={{ maxWidth: 80 }} />
          <span className="ml-2 text-gray-300 text-xs sm:text-sm">
            {rating}/5
          </span>
        </div>
      ),
    },
    {
      title: "Scheduled For",
      dataIndex: "scheduledFor",
      width: "200px",
      key: "scheduledFor",
      render: (scheduledFor) => (
        <span className="text-gray-400 text-xs sm:text-sm">
          {scheduledFor ? new Date(scheduledFor).toLocaleString() : "-"}
        </span>
      ),
    },
    {
      title: "Status",
      width: "80px",
      key: "status",
      render: (_, record) =>
        getStatusBadge(record.scheduledFor, record.schedulingStatus),
    },
    {
      title: "Time Remaining",
      width: "100px",
      key: "timeRemaining",
      render: (_, record) => (
        <span
          className={`font-mono text-[10px] sm:text-xs ${
            getDynamicStatus(record.scheduledFor) === "posted"
              ? "text-green-400"
              : "text-yellow-400"
          }`}
        >
          {getTimeRemaining(record.scheduledFor)}
        </span>
      ),
    },
  ];

  if (loading && scheduledReviews.length === 0) {
    return (
      <div className="mt-4 sm:mt-6 font-secondary sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
          Bulk Review Handling
        </h2>
        <div className="border border-[#212121] bg-black rounded-[15px] p-4 sm:p-6">
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#00b877]"></div>
            <p className="text-gray-400 mt-3 sm:mt-4 text-xs sm:text-sm">
              Loading scheduled reviews...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 font-secondary sm:px-6 lg:px-8">
      <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
        Bulk Review Handling
      </h2>

      <div className="border border-[#212121] bg-black rounded-[15px] p-4 sm:p-6">
        {/* Bulk Upload Section */}
        <div className="bg-[#0c171c] rounded-lg border border-[#212121] p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="text-white font-medium mb-3 sm:mb-4 text-sm sm:text-base">
            Bulk Upload Reviews
          </h3>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-2">
                Enter reviews (one per line, max 50):
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Enter reviews here, one per line...&#10;Excellent service! Highly recommended.&#10;Great quality and fast delivery.&#10;Amazing experience!"
                rows="4"
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none text-xs sm:text-sm"
                maxLength="25000"
              />
              <div className="mt-1 text-gray-400 text-[10px] sm:text-xs">
                {
                  bulkText.split("\n").filter((line) => line.trim().length > 0)
                    .length
                }{" "}
                reviews ready to upload
              </div>
            </div>

            {/* Timer Range Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-2">
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
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                />
                <div className="mt-1 text-gray-400 text-[10px] sm:text-xs">
                  {formatTimerRange(timerRange.min)}
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-2">
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
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                />
                <div className="mt-1 text-gray-400 text-[10px] sm:text-xs">
                  {formatTimerRange(timerRange.max)}
                </div>
              </div>
            </div>

            {/* Rating Range Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-2">
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
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                  min="1"
                  max="5"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-2">
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
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                  min="1"
                  max="5"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleBulkUpload}
                disabled={uploading || !bulkText.trim()}
                className="flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                <Upload className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                {uploading ? "Scheduling..." : "Schedule Reviews"}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-[#0c171c] rounded-lg border border-[#212121] p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <label className="text-white text-xs sm:text-sm font-medium">
                Filter by Status:
              </label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 sm:px-4 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
              >
                <option value="all">All Reviews</option>
                <option value="pending">Pending</option>
                <option value="posted">Posted</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* TableCustom Component without internal pagination */}
        <TableCustom
          title="Scheduled Reviews"
          data={scheduledReviews}
          columns={columns}
          pageSize={scheduledReviews.length} // Set to current data length to disable internal pagination
          showButton={false}
          rowKey="_id"
          pagination={false} // Disable TableCustom's internal pagination
          className="overflow-x-scroll w-full"
        />

        {/* Custom Pagination with Page Numbers */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors text-xs sm:text-sm"
              >
                Previous
              </button>

              {/* Page Numbers */}
              {generatePageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (typeof page === "number") {
                      setCurrentPage(page);
                    }
                  }}
                  disabled={page === "..."}
                  className={`px-2 sm:px-3 py-2 border rounded-lg transition-colors text-xs sm:text-sm ${
                    currentPage === page
                      ? "bg-cyan-500 text-white border-cyan-500"
                      : page === "..."
                      ? "bg-gray-800 text-gray-500 border-gray-700 cursor-default"
                      : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors text-xs sm:text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkReviewHandling;
