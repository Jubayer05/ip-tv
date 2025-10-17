"use client";
import {
  Check,
  Download,
  Edit,
  Search,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const UniqueNameHandle = () => {
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, used, unused
  const [bulkText, setBulkText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    reviewUsed: false,
  });
  const [totalStats, setTotalStats] = useState({
    totalNames: 0,
    usedNames: 0,
    availableNames: 0,
  });

  const namesPerPage = 10;

  useEffect(() => {
    fetchNames();
  }, [currentPage, filter, searchTerm]);

  const fetchNames = async () => {
    setLoading(true);
    try {
      let url = `/api/unique-names?page=${currentPage}&limit=${namesPerPage}`;

      if (filter === "used") {
        url += "&reviewUsed=true";
      } else if (filter === "unused") {
        url += "&reviewUsed=false";
      }

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setNames(data.data);
        setTotalPages(data.pagination.totalPages);

        await fetchTotalStats();
      } else {
        console.error("Failed to fetch names:", data.error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Failed to fetch names",
        });
      }
    } catch (error) {
      console.error("Error fetching names:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalStats = async () => {
    try {
      // Fetch all names to get total counts
      const response = await fetch("/api/unique-names?limit=100000");
      const data = await response.json();

      if (data.success) {
        const totalNames = data.data.length;
        const usedNames = data.data.filter((name) => name.reviewUsed).length;
        const availableNames = data.data.filter(
          (name) => !name.reviewUsed
        ).length;

        setTotalStats({
          totalNames,
          usedNames,
          availableNames,
        });
      }
    } catch (error) {
      console.error("Error fetching total stats:", error);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkText.trim()) {
      Swal.fire({
        icon: "warning",
        title: "No Names Provided",
        text: "Please enter some names in the textarea.",
      });
      return;
    }

    const nameLines = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (nameLines.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Valid Names",
        text: "Please enter valid names (one per line).",
      });
      return;
    }

    setUploading(true);

    try {
      const response = await fetch("/api/unique-names", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ names: nameLines }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Upload Successful!",
          text: `${data.data.created} names created, ${data.data.skipped} skipped (already exist)`,
          timer: 3000,
          showConfirmButton: false,
        });
        setBulkText("");
        fetchNames();
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: data.error || "Failed to upload names",
        });
      }
    } catch (error) {
      console.error("Error uploading names:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (name) => {
    setEditingName(name._id);
    setEditForm({
      name: name.name,
      reviewUsed: name.reviewUsed,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/unique-names/${editingName}`, {
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
          title: "Updated!",
          text: "Name updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        setEditingName(null);
        fetchNames();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.error || "Failed to update name",
        });
      }
    } catch (error) {
      console.error("Error updating name:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    }
  };

  const handleDelete = async (nameId) => {
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
        const response = await fetch(`/api/unique-names/${nameId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Name deleted successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchNames();
        } else {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: data.error || "Failed to delete name",
          });
        }
      } catch (error) {
        console.error("Error deleting name:", error);
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Please try again later.",
        });
      }
    }
  };

  const handleToggleReviewUsed = async (nameId, currentStatus) => {
    try {
      const response = await fetch(`/api/unique-names/${nameId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewUsed: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Status Updated!",
          text: `Name marked as ${!currentStatus ? "used" : "unused"}.`,
          timer: 2000,
          showConfirmButton: false,
        });
        fetchNames();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.error || "Failed to update status",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/unique-names?limit=10000");
      const data = await response.json();

      if (data.success) {
        const csvContent = [
          "Name,Review Used,Created At",
          ...data.data.map(
            (name) =>
              `"${name.name}",${name.reviewUsed},"${new Date(
                name.createdAt
              ).toISOString()}"`
          ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "unique_names_export.csv";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting names:", error);
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Failed to export names.",
      });
    }
  };

  const handleClearAll = async () => {
    const result = await Swal.fire({
      title: "Clear All Names?",
      text: "This will delete ALL names and cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, clear all!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch("/api/unique-names", {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Cleared!",
            text: `${data.deletedCount} names deleted.`,
            timer: 2000,
            showConfirmButton: false,
          });
          fetchNames();
        } else {
          Swal.fire({
            icon: "error",
            title: "Clear Failed",
            text: data.error || "Failed to clear names",
          });
        }
      } catch (error) {
        console.error("Error clearing names:", error);
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Please try again later.",
        });
      }
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

  if (loading && names.length === 0) {
    return (
      <div className="mt-4 sm:mt-6 font-secondary">
        <h2 className="text-4xl font-bold text-white mb-4">
          Unique Name Handle
        </h2>
        <div className="border border-[#212121] bg-black rounded-[15px] p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b877]"></div>
            <p className="text-gray-400 mt-4">Loading names...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 font-secondary">
      <h2 className="text-4xl font-bold text-white mb-4">Unique Name Handle</h2>

      <div className="border border-[#212121] bg-black rounded-[15px] p-6">
        {/* Bulk Upload Section */}
        <div className="bg-[#0c171c] rounded-lg border border-[#212121] p-4 mb-6">
          <h3 className="text-white font-medium mb-4">Bulk Upload Names</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Enter names (one per line):
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Enter names here, one per line...&#10;John Doe&#10;Jane Smith&#10;Mike Johnson"
                rows="6"
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none"
                maxLength="50000"
              />
              <div className="mt-1 text-gray-400 text-xs">
                {
                  bulkText.split("\n").filter((line) => line.trim().length > 0)
                    .length
                }{" "}
                names ready to upload
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleBulkUpload}
                disabled={uploading || !bulkText.trim()}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
              >
                <Upload className="mr-2" />
                {uploading ? "Uploading..." : "Upload Names"}
              </button>

              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                <Download className="mr-2" />
                Export CSV
              </button>

              <button
                onClick={handleClearAll}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                <Trash2 className="mr-2" />
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-[#0c171c] rounded-lg border border-[#212121] p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-[#1a1a1a] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Names</option>
              <option value="used">Used in Reviews</option>
              <option value="unused">Not Used</option>
            </select>
          </div>
        </div>

        {/* Names Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#212121]">
                <th className="text-left py-3 px-2 text-white font-medium">
                  Name
                </th>
                <th className="text-left py-3 px-2 text-white font-medium">
                  Status
                </th>
                <th className="text-left py-3 px-2 text-white font-medium">
                  Created At
                </th>
                <th className="text-left py-3 px-2 text-white font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {names.map((name) => (
                <tr
                  key={name._id}
                  className="border-b border-[#212121] hover:bg-[#0c171c]/50"
                >
                  <td className="py-3 px-2">
                    {editingName === name._id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 bg-[#1a1a1a] border border-white/15 rounded text-white text-sm focus:outline-none focus:border-cyan-400"
                      />
                    ) : (
                      <span className="text-gray-300">{name.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        name.reviewUsed
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {name.reviewUsed ? "Used" : "Available"}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-400 text-sm">
                    {new Date(name.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex space-x-2">
                      {editingName === name._id ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-400 hover:text-green-300"
                            title="Save"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingName(null)}
                            className="p-1 text-red-400 hover:text-red-300"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(name)}
                            className="p-1 text-blue-400 hover:text-blue-300"
                            title="Edit Name"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleReviewUsed(name._id, name.reviewUsed)
                            }
                            className={`p-1 ${
                              name.reviewUsed
                                ? "text-yellow-400 hover:text-yellow-300"
                                : "text-green-400 hover:text-green-300"
                            }`}
                            title={
                              name.reviewUsed
                                ? "Mark as Available"
                                : "Mark as Used"
                            }
                          >
                            <User size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(name._id)}
                            className="p-1 text-red-400 hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {renderPagination()}

        {/* Statistics */}
        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0c171c] rounded-lg border border-[#212121] p-4">
            <h3 className="text-white font-medium mb-2">Total Names</h3>
            <p className="text-2xl font-bold text-blue-400">
              {totalStats.totalNames}
            </p>
          </div>
          <div className="bg-[#0c171c] rounded-lg border border-[#212121] p-4">
            <h3 className="text-white font-medium mb-2">Used Names</h3>
            <p className="text-2xl font-bold text-green-400">
              {totalStats.usedNames}
            </p>
          </div>
          <div className="bg-[#0c171c] rounded-lg border border-[#212121] p-4">
            <h3 className="text-white font-medium mb-2">Available Names</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {totalStats.availableNames}
            </p>
          </div>
        </div>

        {/* Guidelines */}
        <div className="mt-6 bg-[#0c171c] rounded-lg border border-[#212121] p-4">
          <h3 className="text-white font-medium mb-3">Upload Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="text-white font-medium mb-2">Format:</h4>
              <ul className="space-y-1">
                <li>• One name per line</li>
                <li>• Maximum 100 characters per name</li>
                <li>• Duplicate names will be skipped</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Features:</h4>
              <ul className="space-y-1">
                <li>• Automatic duplicate detection</li>
                <li>• Bulk status management</li>
                <li>• CSV export functionality</li>
                <li>• Search and filter options</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniqueNameHandle;
