"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { Check, Edit, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const ReviewManagement = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all"); // all, pending, approved
  const [editingReview, setEditingReview] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: "",
    isApproved: true,
    createdAt: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
  });
  const [addForm, setAddForm] = useState({
    rating: 5,
    comment: "",
    isApproved: true,
    createdAt: new Date().toISOString().split("T")[0],
    userId: "", // For selecting existing user or creating new one
    reviewerName: "", // For display name
  });

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Review Management",
    subtitle: "Manage customer reviews and ratings",
    loadingReviews: "Loading reviews...",
    customerReviews: "Customer Reviews",
    addReview: "Add Review",
    allReviews: "All Reviews",
    pendingApproval: "Pending Approval",
    approved: "Approved",
    addNewReview: "Add New Review",
    reviewerName: "Reviewer Name",
    enterReviewerName: "Enter reviewer name",
    rating: "Rating",
    createdDate: "Created Date",
    status: "Status",
    comment: "Comment",
    enterReviewComment: "Enter review comment",
    cancel: "Cancel",
    reviewAdded: "Review Added!",
    reviewAddedSuccess: "Review has been successfully added.",
    addFailed: "Add Failed",
    networkError: "Network Error",
    tryAgainLater: "Please try again later.",
    reviewApproved: "Review Approved!",
    reviewRejected: "Review Rejected!",
    operationFailed: "Operation Failed",
    reviewUpdated: "Review Updated!",
    updateFailed: "Update Failed",
    areYouSure: "Are you sure?",
    cannotBeUndone: "This action cannot be undone!",
    yesDeleteIt: "Yes, delete it!",
    reviewDeleted: "Review Deleted!",
    deletionFailed: "Deletion Failed",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    anonymous: "Anonymous",
    previous: "Previous",
    next: "Next",
    noReviewsFound: "No reviews found.",
    approve: "Approve",
    reject: "Reject",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  // Translate texts when language changes
  useEffect(() => {
    if (!isLanguageLoaded || !language) return;

    const translateTexts = async () => {
      const keys = Object.keys(ORIGINAL_TEXTS);
      const values = Object.values(ORIGINAL_TEXTS);

      try {
        const translatedValues = await translate(values);
        const translatedTexts = {};

        keys.forEach((key, index) => {
          translatedTexts[key] = translatedValues[index] || values[index];
        });

        setTexts(translatedTexts);
      } catch (error) {
        console.error("Translation error:", error);
        setTexts(ORIGINAL_TEXTS);
      }
    };

    translateTexts();
  }, [language, isLanguageLoaded, translate]);

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

  const handleAddReview = async () => {
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...addForm,
          createdAt: new Date(addForm.createdAt).toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: texts.reviewAdded,
          text: texts.reviewAddedSuccess,
          timer: 2000,
          showConfirmButton: false,
        });
        setShowAddForm(false);
        setAddForm({
          rating: 5,
          comment: "",
          isApproved: true,
          createdAt: new Date().toISOString().split("T")[0],
          userId: "",
          reviewerName: "",
        });
        fetchReviews();
      } else {
        Swal.fire({
          icon: "error",
          title: texts.addFailed,
          text: data.error,
        });
      }
    } catch (error) {
      console.error("Error adding review:", error);
      Swal.fire({
        icon: "error",
        title: texts.networkError,
        text: texts.tryAgainLater,
      });
    }
  };

  const handleApprove = async (reviewId, approve = true) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isApproved: approve,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: approve ? texts.reviewApproved : texts.reviewRejected,
          text: data.message,
          timer: 2000,
          showConfirmButton: false,
        });
        fetchReviews();
      } else {
        Swal.fire({
          icon: "error",
          title: texts.operationFailed,
          text: data.error,
        });
      }
    } catch (error) {
      console.error("Error updating review:", error);
      Swal.fire({
        icon: "error",
        title: texts.networkError,
        text: texts.tryAgainLater,
      });
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review._id);
    setEditForm({
      rating: review.rating,
      comment: review.comment,
      isApproved: review.isApproved,
      createdAt: new Date(review.createdAt).toISOString().split("T")[0],
    });
  };

  const handleSaveEdit = async (reviewId) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editForm,
          createdAt: new Date(editForm.createdAt).toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: texts.reviewUpdated,
          text: data.message,
          timer: 2000,
          showConfirmButton: false,
        });
        setEditingReview(null);
        fetchReviews();
      } else {
        Swal.fire({
          icon: "error",
          title: texts.updateFailed,
          text: data.error,
        });
      }
    } catch (error) {
      console.error("Error updating review:", error);
      Swal.fire({
        icon: "error",
        title: texts.networkError,
        text: texts.tryAgainLater,
      });
    }
  };

  const handleDelete = async (reviewId) => {
    const result = await Swal.fire({
      title: texts.areYouSure,
      text: texts.cannotBeUndone,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: texts.yesDeleteIt,
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
            title: texts.reviewDeleted,
            text: data.message,
            timer: 2000,
            showConfirmButton: false,
          });
          fetchReviews();
        } else {
          Swal.fire({
            icon: "error",
            title: texts.deletionFailed,
            text: data.error,
          });
        }
      } catch (error) {
        console.error("Error deleting review:", error);
        Swal.fire({
          icon: "error",
          title: texts.networkError,
          text: texts.tryAgainLater,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 w-full max-w-7xl mx-auto font-secondary">
        <div className="flex items-center justify-center h-24 sm:h-32">
          <div className="text-gray-400 text-xs sm:text-sm text-center">
            {texts.loadingReviews}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 font-secondary sm:px-6 lg:px-8">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
        {texts.heading}
      </h2>

      <div className="border border-[#212121] bg-black rounded-[15px] p-3 sm:p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 sm:mb-6 space-y-3 lg:space-y-0">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
            {texts.customerReviews}
          </h3>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs sm:text-sm font-medium transition-colors"
            >
              <Plus className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />{" "}
              {texts.addReview}
            </button>

            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 sm:px-4 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors text-xs sm:text-sm"
            >
              <option value="all">{texts.allReviews}</option>
              <option value="pending">{texts.pendingApproval}</option>
              <option value="approved">{texts.approved}</option>
            </select>
          </div>
        </div>

        {/* Add Review Form */}
        {showAddForm && (
          <div className="bg-[#0c171c] rounded-lg border border-[#212121] p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
            <h4 className="text-white font-medium mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">
              {texts.addNewReview}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  {texts.reviewerName}
                </label>
                <input
                  type="text"
                  value={addForm.reviewerName}
                  onChange={(e) =>
                    setAddForm({ ...addForm, reviewerName: e.target.value })
                  }
                  className="w-full px-2 sm:px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                  placeholder={texts.enterReviewerName}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  {texts.rating}
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <Rating
                    value={addForm.rating}
                    onChange={(value) =>
                      setAddForm({ ...addForm, rating: value })
                    }
                    style={{ maxWidth: 120 }}
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={addForm.rating}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        rating: parseFloat(e.target.value) || 1,
                      })
                    }
                    className="w-full sm:w-16 px-2 sm:px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  {texts.createdDate}
                </label>
                <input
                  type="date"
                  value={addForm.createdAt}
                  onChange={(e) =>
                    setAddForm({ ...addForm, createdAt: e.target.value })
                  }
                  className="w-full px-2 sm:px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  {texts.status}
                </label>
                <select
                  value={addForm.isApproved}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      isApproved: e.target.value === "true",
                    })
                  }
                  className="w-full px-2 sm:px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                >
                  <option value="true">{texts.approved}</option>
                  <option value="false">{texts.pendingApproval}</option>
                </select>
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                {texts.comment}
              </label>
              <textarea
                value={addForm.comment}
                onChange={(e) =>
                  setAddForm({ ...addForm, comment: e.target.value })
                }
                rows="3"
                className="w-full px-2 sm:px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm resize-none"
                placeholder={texts.enterReviewComment}
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-3 sm:mt-4">
              <button
                onClick={handleAddReview}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs sm:text-sm font-medium transition-colors"
              >
                {texts.addReview}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs sm:text-sm font-medium transition-colors"
              >
                {texts.cancel}
              </button>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-400 text-sm sm:text-base md:text-lg">
              {texts.noReviewsFound}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-[#0c171c] rounded-lg border border-[#212121] p-3 sm:p-4 md:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-xs sm:text-sm">
                      {review.userId?.profile?.firstName?.charAt(0) ||
                        review.uniqueName?.charAt(0) ||
                        "A"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white text-xs sm:text-sm md:text-base truncate">
                        {review.userId?.profile?.firstName &&
                        review.userId?.profile?.lastName
                          ? `${review.userId.profile.firstName} ${review.userId.profile.lastName}`
                          : review.uniqueName || texts.anonymous}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end sm:justify-start">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                        review.isApproved
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {review.isApproved
                        ? texts.approved
                        : texts.pendingApproval}
                    </span>
                  </div>
                </div>

                {editingReview === review._id ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                          {texts.rating}
                        </label>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                          <Rating
                            value={editForm.rating}
                            onChange={(value) =>
                              setEditForm({ ...editForm, rating: value })
                            }
                            style={{ maxWidth: 120 }}
                          />
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={editForm.rating}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                rating: parseFloat(e.target.value) || 1,
                              })
                            }
                            className="w-full sm:w-16 px-2 sm:px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                          {texts.createdDate}
                        </label>
                        <input
                          type="date"
                          value={editForm.createdAt}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              createdAt: e.target.value,
                            })
                          }
                          className="w-full px-2 sm:px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                          {texts.status}
                        </label>
                        <select
                          value={editForm.isApproved}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              isApproved: e.target.value === "true",
                            })
                          }
                          className="w-full px-2 sm:px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                        >
                          <option value="true">{texts.approved}</option>
                          <option value="false">{texts.pendingApproval}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                        {texts.comment}
                      </label>
                      <textarea
                        value={editForm.comment}
                        onChange={(e) =>
                          setEditForm({ ...editForm, comment: e.target.value })
                        }
                        rows="3"
                        className="w-full px-2 sm:px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm resize-none"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => handleSaveEdit(review._id)}
                        className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs sm:text-sm font-medium transition-colors"
                      >
                        {texts.save}
                      </button>
                      <button
                        onClick={() => setEditingReview(null)}
                        className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs sm:text-sm font-medium transition-colors"
                      >
                        {texts.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center mb-2 space-y-1 sm:space-y-0 sm:space-x-3">
                      <Rating
                        value={review.rating}
                        readOnly
                        style={{ maxWidth: 120 }}
                      />
                      <span className="text-xs sm:text-sm text-gray-300">
                        {review.rating}/5
                      </span>
                    </div>

                    <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                      {review.comment}
                    </p>

                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-2 lg:space-y-0">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {!review.isApproved && (
                          <button
                            onClick={() => handleApprove(review._id, true)}
                            className="flex items-center px-2 sm:px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-[10px] sm:text-xs font-medium transition-colors"
                          >
                            <Check className="mr-1 w-2 h-2 sm:w-3 sm:h-3" />{" "}
                            {texts.approve}
                          </button>
                        )}

                        {review.isApproved && (
                          <button
                            onClick={() => handleApprove(review._id, false)}
                            className="flex items-center px-2 sm:px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-[10px] sm:text-xs font-medium transition-colors"
                          >
                            <X className="mr-1 w-2 h-2 sm:w-3 sm:h-3" />{" "}
                            {texts.reject}
                          </button>
                        )}

                        <button
                          onClick={() => handleEdit(review)}
                          className="flex items-center px-2 sm:px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-[10px] sm:text-xs font-medium transition-colors"
                        >
                          <Edit className="mr-1 w-2 h-2 sm:w-3 sm:h-3" />{" "}
                          {texts.edit}
                        </button>

                        <button
                          onClick={() => handleDelete(review._id)}
                          className="flex items-center px-2 sm:px-3 py-1 bg-red-600 text-white rounded hover:bg-red-600 text-[10px] sm:text-xs font-medium transition-colors"
                        >
                          <Trash2 className="mr-1 w-2 h-2 sm:w-3 sm:h-3" />{" "}
                          {texts.delete}
                        </button>
                      </div>

                      {review.approvedBy && (
                        <p className="text-[10px] sm:text-xs text-gray-500 text-right lg:text-left">
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
          <div className="flex justify-center mt-6 sm:mt-8">
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 sm:py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors text-xs sm:text-sm font-medium"
              >
                {texts.previous}
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-2 sm:px-3 py-1 sm:py-2 border border-white/15 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
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
                className="px-2 sm:px-3 py-1 sm:py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors text-xs sm:text-sm font-medium"
              >
                {texts.next}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
