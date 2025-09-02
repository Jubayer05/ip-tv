"use client";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all"); // all, published, draft
  const [editingBlog, setEditingBlog] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    image: "",
    details: "",
    authorName: "",
    tags: "",
    isPublished: false,
  });

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, filter]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      let url = `/api/blogs?page=${currentPage}&limit=10`;

      if (filter === "published") {
        url += "&published=true";
      } else if (filter === "draft") {
        url += "&published=false";
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setBlogs(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        console.error("Failed to fetch blogs:", data.error);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      title: "",
      slug: "",
      image: "",
      details: "",
      authorName: "",
      tags: "",
      isPublished: false,
    });
    setShowForm(true);
    setEditingBlog(null);
  };

  const handleEdit = (blog) => {
    setFormData({
      title: blog.title,
      slug: blog.slug,
      image: blog.image,
      details: blog.details,
      authorName: blog.authorName,
      tags: blog.tags.join(", "),
      isPublished: blog.isPublished,
    });
    setEditingBlog(blog._id);
    setShowForm(true);
  };

  // Add function to auto-generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  };

  // Auto-generate slug when title changes
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({ ...formData, title });

    // Auto-generate slug if slug field is empty or if user hasn't manually edited it
    if (!formData.slug || formData.slug === generateSlug(formData.title)) {
      setFormData((prev) => ({ ...prev, title, slug: generateSlug(title) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.image ||
      !formData.details ||
      !formData.authorName
    ) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill in all required fields.",
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      const url = editingBlog ? `/api/blogs/${editingBlog}` : "/api/blogs";
      const method = editingBlog ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: editingBlog ? "Blog Updated!" : "Blog Created!",
          text: data.message,
          timer: 2000,
          showConfirmButton: false,
        });

        setShowForm(false);
        setEditingBlog(null);
        fetchBlogs();
      } else {
        Swal.fire({
          icon: "error",
          title: "Operation Failed",
          text: data.error,
        });
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    }
  };

  const handleDelete = async (blogId) => {
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
        const response = await fetch(`/api/blogs/${blogId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Blog Deleted!",
            text: data.message,
            timer: 2000,
            showConfirmButton: false,
          });
          fetchBlogs();
        } else {
          Swal.fire({
            icon: "error",
            title: "Deletion Failed",
            text: data.error,
          });
        }
      } catch (error) {
        console.error("Error deleting blog:", error);
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Please try again later.",
        });
      }
    }
  };

  const togglePublishStatus = async (blogId, currentStatus) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublished: !currentStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: currentStatus ? "Blog Unpublished!" : "Blog Published!",
          text: data.message,
          timer: 2000,
          showConfirmButton: false,
        });
        fetchBlogs();
      } else {
        Swal.fire({
          icon: "error",
          title: "Operation Failed",
          text: data.error,
        });
      }
    } catch (error) {
      console.error("Error updating blog status:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    }
  };

  if (loading) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 w-full max-w-7xl mx-auto font-secondary">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400 text-sm text-center">
            Loading blogs...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 font-secondary">
      <h2 className="text-4xl font-bold text-white mb-4">Blog Management</h2>

      <div className="border border-[#212121] bg-black rounded-[15px] p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-white">Manage Blogs</h3>

          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="all">All Blogs</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>

            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2"
            >
              <FaPlus /> Create Blog
            </button>
          </div>
        </div>

        {/* Blog Form */}
        {showForm && (
          <div className="mb-8 bg-[#0c171c] rounded-lg border border-[#212121] p-6">
            <h4 className="text-xl font-semibold text-white mb-4">
              {editingBlog ? "Edit Blog" : "Create New Blog"}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-3 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Enter blog title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    placeholder="blog-url-slug"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL-friendly version of the title
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) =>
                      setFormData({ ...formData, authorName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Enter author name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Enter tags separated by commas"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Enter image URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content *
                </label>
                <RichTextEditor
                  value={formData.details}
                  onChange={(content) =>
                    setFormData({ ...formData, details: content })
                  }
                  placeholder="Write your blog content..."
                  className="bg-[#0c171c]"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.checked,
                      })
                    }
                    className="rounded border-white/15 bg-[#0c171c] text-cyan-500 focus:ring-cyan-400"
                  />
                  <span className="text-gray-300">Publish immediately</span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FaSave /> {editingBlog ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBlog(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Blogs List */}
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No blogs found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-[#0c171c] rounded-lg border border-[#212121] p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/64x64?text=No+Image";
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        {blog.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        By {blog.authorName} •{" "}
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {blog.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        blog.isPublished
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {blog.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        togglePublishStatus(blog._id, blog.isPublished)
                      }
                      className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                        blog.isPublished
                          ? "bg-yellow-600 text-white hover:bg-yellow-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {blog.isPublished ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      onClick={() => handleEdit(blog)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold flex items-center gap-1"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold flex items-center gap-1"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>

                  <div className="text-xs text-gray-500">Slug: {blog.slug}</div>
                </div>
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

export default BlogManagement;
