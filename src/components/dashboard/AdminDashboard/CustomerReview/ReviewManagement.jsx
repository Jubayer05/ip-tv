"use client";
import { useEffect, useState } from "react";
import { FaCheck, FaEdit, FaStar, FaTimes, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all"); // all, pending, approved
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    fetchReviews();
  }, [currentPage, filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let url = `/api/reviews?page=${currentPage}&limit=10`;

      if (filter === "pending") {
        url += "&approved=false";
      } else if (filter === "approved") {
        url += "&approved=true";
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        console.error("Failed to fetch reviews:", data.error);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId, approve = true) => {
    try {
      // You need to get the actual admin user ID from your auth context
      // For now, I'll remove the adminId since it's not required for approval
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isApproved: approve,
          // Remove adminId for now - you can add it back when you have proper admin authentication
          // adminId: "currentAdminId", // This was causing the error
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: approve ? "Review Approved!" : "Review Rejected!",
          text: data.message,
          timer: 2000,
          showConfirmButton: false,
        });
        fetchReviews();
      } else {
        Swal.fire({
          icon: "error",
          title: "Operation Failed",
          text: data.error,
        });
      }
    } catch (error) {
      console.error("Error updating review:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review._id);
    setEditForm({
      rating: review.rating,
      comment: review.comment,
    });
  };

  const handleSaveEdit = async (reviewId) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Review Updated!",
          text: data.message,
          timer: 2000,
          showConfirmButton: false,
        });
        setEditingReview(null);
        fetchReviews();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.error,
        });
      }
    } catch (error) {
      console.error("Error updating review:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    }
  };

  const handleDelete = async (reviewId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Review Deleted!",
            text: data.message,
            timer: 2000,
            showConfirmButton: false,
          });
          fetchReviews();
        } else {
          Swal.fire({
            icon: "error",
            title: "Deletion Failed",
            text: data.error,
          });
        }
      } catch (error) {
        console.error("Error deleting review:", error);
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Please try again later.",
        });
      }
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

  if (loading) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 w-full max-w-7xl mx-auto font-secondary">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400 text-sm text-center">
            Loading reviews...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 font-secondary">
      <h2 className="text-4xl font-bold text-white mb-4">Review Management</h2>

      <div className="border border-[#212121] bg-black rounded-[15px] p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-white">
            Customer Reviews
          </h3>

          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No reviews found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-[#0c171c] rounded-lg border border-[#212121] p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.userId?.profile?.firstName?.charAt(0) || "A"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">
                        {review.userId?.profile?.firstName}{" "}
                        {review.userId?.profile?.lastName}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.isApproved
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>

                {editingReview === review._id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rating
                      </label>
                      <select
                        value={editForm.rating}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            rating: parseInt(e.target.value),
                          })
                        }
                        className="w-20 px-3 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Comment
                      </label>
                      <textarea
                        value={editForm.comment}
                        onChange={(e) =>
                          setEditForm({ ...editForm, comment: e.target.value })
                        }
                        rows="3"
                        className="w-full px-3 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveEdit(review._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingReview(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mb-2">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-300">
                        {review.rating}/5
                      </span>
                    </div>

                    <p className="text-gray-300 mb-4 text-sm">
                      {review.comment}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        {!review.isApproved && (
                          <button
                            onClick={() => handleApprove(review._id, true)}
                            className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          >
                            <FaCheck className="mr-1" /> Approve
                          </button>
                        )}

                        {review.isApproved && (
                          <button
                            onClick={() => handleApprove(review._id, false)}
                            className="flex items-center px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-xs"
                          >
                            <FaTimes className="mr-1" /> Reject
                          </button>
                        )}

                        <button
                          onClick={() => handleEdit(review)}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>

                        <button
                          onClick={() => handleDelete(review._id)}
                          className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-600 text-xs"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </div>

                      {review.approvedBy && (
                        <p className="text-xs text-gray-500">
                          Approved by: {review.approvedBy.profile?.firstName}{" "}
                          {review.approvedBy.profile?.lastName}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-2 border border-white/15 rounded-lg transition-colors ${
                    currentPage === index + 1
                      ? "bg-cyan-500 text-white border-cyan-500"
                      : "bg-[#0c171c] text-white hover:bg-[#1a1a1a]"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors"
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

export default ReviewManagement;
