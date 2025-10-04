"use client";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useLanguage } from "@/contexts/LanguageContext";
import { Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const BlogManagement = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
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
  const [selectedFile, setSelectedFile] = useState(null);

  const ORIGINAL_TEXTS = {
    heading: "Blog Management",
    manageBlogs: "Manage Blogs",
    allBlogs: "All Blogs",
    published: "Published",
    drafts: "Drafts",
    createBlog: "Create Blog",
    editBlog: "Edit Blog",
    createNewBlog: "Create New Blog",
    title: "Title",
    slug: "Slug",
    authorName: "Author Name",
    tags: "Tags",
    image: "Image",
    content: "Content",
    publishImmediately: "Publish immediately",
    update: "Update",
    create: "Create",
    cancel: "Cancel",
    chooseImage: "Choose Image",
    currentImage: "Current image:",
    preview: "Preview:",
    maxFileSize: "Max file size: 5MB. Supported formats: JPG, PNG, GIF",
    urlFriendlyVersion: "URL-friendly version of the title",
    enterBlogTitle: "Enter blog title",
    blogUrlSlug: "blog-url-slug",
    enterAuthorName: "Enter author name",
    enterTagsSeparated: "Enter tags separated by commas",
    writeBlogContent: "Write your blog content...",
    specialNoteForCustomers: "Special note for customers",
    enterTheQuestion: "Enter the question",
    enterTheAnswer: "Enter the answer",
    displayOrder: "Display Order",
    active: "Active",
    noBlogsFound: "No blogs found.",
    loadingBlogs: "Loading blogs...",
    fileTooLarge: "File too large",
    pleaseSelectSmallerFile: "Please select a file smaller than 5MB",
    invalidFileType: "Invalid file type",
    pleaseSelectImageFile: "Please select an image file",
    validationError: "Validation Error",
    pleaseFillRequiredFields: "Please fill in all required fields.",
    blogUpdated: "Blog Updated!",
    blogCreated: "Blog Created!",
    operationFailed: "Operation Failed",
    networkError: "Network Error",
    pleaseTryAgainLater: "Please try again later.",
    areYouSure: "Are you sure?",
    actionCannotBeUndone: "This action cannot be undone!",
    yesDeleteIt: "Yes, delete it!",
    blogDeleted: "Blog Deleted!",
    deletionFailed: "Deletion Failed",
    blogUnpublished: "Blog Unpublished!",
    blogPublished: "Blog Published!",
    unpublish: "Unpublish",
    publish: "Publish",
    edit: "Edit",
    delete: "Delete",
    previous: "Previous",
    next: "Next",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = Object.values(ORIGINAL_TEXTS);
      const translated = await translate(items);
      if (!isMounted) return;

      const translatedTexts = {};
      Object.keys(ORIGINAL_TEXTS).forEach((key, index) => {
        translatedTexts[key] = translated[index];
      });
      setTexts(translatedTexts);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: texts.fileTooLarge,
          text: texts.pleaseSelectSmallerFile,
          confirmButtonColor: "#44dcf3",
        });
        return;
      }
      // Check file type
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: texts.invalidFileType,
          text: texts.pleaseSelectImageFile,
          confirmButtonColor: "#44dcf3",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/support/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        return data.url;
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
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
    setSelectedFile(null);
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
    setSelectedFile(null);
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

    if (!formData.title || !formData.details || !formData.authorName) {
      Swal.fire({
        icon: "error",
        title: texts.validationError,
        text: texts.pleaseFillRequiredFields,
      });
      return;
    }

    try {
      let imageUrl = formData.image; // Use existing image if editing

      // Upload new file if selected
      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile);
      }

      const payload = {
        ...formData,
        image: imageUrl,
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
          title: editingBlog ? texts.blogUpdated : texts.blogCreated,
          text: data.message,
          timer: 2000,
          showConfirmButton: false,
        });

        setShowForm(false);
        setEditingBlog(null);
        setSelectedFile(null);
        fetchBlogs();
      } else {
        Swal.fire({
          icon: "error",
          title: texts.operationFailed,
          text: data.error,
        });
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      Swal.fire({
        icon: "error",
        title: texts.networkError,
        text: texts.pleaseTryAgainLater,
      });
    }
  };

  const handleDelete = async (blogId) => {
    const result = await Swal.fire({
      title: texts.areYouSure,
      text: texts.actionCannotBeUndone,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: texts.yesDeleteIt,
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
            title: texts.blogDeleted,
            text: data.message,
            timer: 2000,
            showConfirmButton: false,
          });
          fetchBlogs();
        } else {
          Swal.fire({
            icon: "error",
            title: texts.deletionFailed,
            text: data.error,
          });
        }
      } catch (error) {
        console.error("Error deleting blog:", error);
        Swal.fire({
          icon: "error",
          title: texts.networkError,
          text: texts.pleaseTryAgainLater,
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
          title: currentStatus ? texts.blogUnpublished : texts.blogPublished,
          text: data.message,
          timer: 2000,
          showConfirmButton: false,
        });
        fetchBlogs();
      } else {
        Swal.fire({
          icon: "error",
          title: texts.operationFailed,
          text: data.error,
        });
      }
    } catch (error) {
      console.error("Error updating blog status:", error);
      Swal.fire({
        icon: "error",
        title: texts.networkError,
        text: texts.pleaseTryAgainLater,
      });
    }
  };

  if (loading) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] mt-4 sm:mt-6 w-full max-w-7xl mx-auto font-secondary">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400 text-sm text-center">
            {texts.loadingBlogs}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 font-secondary px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">{texts.heading}</h2>

      <div className="border border-[#212121] bg-black rounded-[15px] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h3 className="text-xl sm:text-2xl font-semibold text-white">
            {texts.manageBlogs}
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 sm:px-4 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors text-xs sm:text-sm w-full sm:w-auto"
            >
              <option value="all">{texts.allBlogs}</option>
              <option value="published">{texts.published}</option>
              <option value="draft">{texts.drafts}</option>
            </select>

            <button
              onClick={handleCreate}
              className="px-3 sm:px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start"
            >
              <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" /> {texts.createBlog}
            </button>
          </div>
        </div>

        {/* Blog Form */}
        {showForm && (
          <div className="mb-6 sm:mb-8 bg-[#0c171c] rounded-lg border border-[#212121] p-4 sm:p-6">
            <h4 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
              {editingBlog ? texts.editBlog : texts.createNewBlog}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    {texts.title} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-3 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                    placeholder={texts.enterBlogTitle}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    {texts.slug} *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                    placeholder={texts.blogUrlSlug}
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {texts.urlFriendlyVersion}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    {texts.authorName} *
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) =>
                      setFormData({ ...formData, authorName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                    placeholder={texts.enterAuthorName}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    {texts.tags}
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                    placeholder={texts.enterTagsSeparated}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {texts.image} *
                </label>

                {/* File Upload Section */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 sm:px-4 py-2 rounded cursor-pointer transition-colors text-xs sm:text-sm"
                    >
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                      {texts.chooseImage}
                    </label>
                    {selectedFile && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="text-gray-300 break-all">
                          {selectedFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-red-400 cursor-pointer hover:text-red-300"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Show current image if editing and no new file selected */}
                  {editingBlog && formData.image && !selectedFile && (
                    <div className="mt-2">
                      <p className="text-xs sm:text-sm text-gray-400 mb-2">
                        {texts.currentImage}
                      </p>
                      <img
                        src={formData.image}
                        alt="Current blog image"
                        className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded border border-gray-600"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Show preview of selected file */}
                  {selectedFile && (
                    <div className="mt-2">
                      <p className="text-xs sm:text-sm text-gray-400 mb-2">
                        {texts.preview}
                      </p>
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded border border-gray-600"
                      />
                    </div>
                  )}

                  <p className="text-[10px] sm:text-xs text-gray-400">{texts.maxFileSize}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  {texts.content} *
                </label>
                <RichTextEditor
                  value={formData.details}
                  onDataChange={(content) =>
                    setFormData({ ...formData, details: content })
                  }
                  placeholder={texts.writeBlogContent}
                  className="bg-[#0c171c]"
                />
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4">
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
                    className="rounded border-white/15 bg-[#0c171c] text-cyan-500 focus:ring-cyan-400 w-3 h-3 sm:w-4 sm:h-4"
                  />
                  <span className="text-gray-300 text-xs sm:text-sm">
                    {texts.publishImmediately}
                  </span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2 text-xs sm:text-sm justify-center"
                >
                  <FaSave className="w-3 h-3 sm:w-4 sm:h-4" /> {editingBlog ? texts.update : texts.create}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBlog(null);
                  }}
                  className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-2 text-xs sm:text-sm justify-center"
                >
                  <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" /> {texts.cancel}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Blogs List */}
        {blogs.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-400 text-base sm:text-lg">{texts.noBlogsFound}</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-[#0c171c] rounded-lg border border-[#212121] p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-3 sm:mb-4 gap-3">
                  <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm sm:text-lg break-words">
                        {blog.title}
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        By {blog.authorName} •{" "}
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                        {blog.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-cyan-500/20 text-cyan-400 text-[10px] sm:text-xs rounded-full border border-cyan-500/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                        blog.isPublished
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {blog.isPublished ? texts.published : texts.drafts}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        togglePublishStatus(blog._id, blog.isPublished)
                      }
                      className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold transition-colors ${
                        blog.isPublished
                          ? "bg-yellow-600 text-white hover:bg-yellow-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {blog.isPublished ? texts.unpublish : texts.publish}
                    </button>

                    <button
                      onClick={() => handleEdit(blog)}
                      className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs sm:text-sm font-semibold flex items-center gap-1"
                    >
                      <FaEdit className="w-2 h-2 sm:w-3 sm:h-3 sm:mr-1" /> {texts.edit}
                    </button>

                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs sm:text-sm font-semibold flex items-center gap-1"
                    >
                      <FaTrash className="w-2 h-2 sm:w-3 sm:h-3 sm:mr-1" /> {texts.delete}
                    </button>
                  </div>

                  <div className="text-[10px] sm:text-xs text-gray-500 break-all">Slug: {blog.slug}</div>
                </div>
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
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors text-xs sm:text-sm"
              >
                {texts.previous}
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 border border-white/15 rounded-lg transition-colors text-xs sm:text-sm ${
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
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-[#0c171c] border border-white/15 rounded-lg text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors text-xs sm:text-sm"
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

export default BlogManagement;
