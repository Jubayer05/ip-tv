"use client";
import useDebounce from "@/hooks/useDebounce";
import { Edit, HelpCircle, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const initialForm = {
  question: "",
  answer: "",
  category: "general",
  isActive: true,
  order: 0,
};

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const categories = [
    { value: "general", label: "General" },
    { value: "billing", label: "Billing & Payments" },
    { value: "technical", label: "Technical Support" },
    { value: "account", label: "Account Management" },
    { value: "streaming", label: "Streaming & Content" },
    { value: "other", label: "Other" },
  ];

  const loadFAQs = async (qStr = "") => {
    try {
      setLoading(true);
      const qParam = qStr ? `?search=${encodeURIComponent(qStr)}` : "";
      const res = await fetch(`/api/admin/faq${qParam}`);
      const data = await res.json();

      let next = data.success ? data.faqs || [] : [];

      // Client-side word-by-word OR matching (ignores order)
      // Client-side word-by-word OR matching (ignores order)
      // Client-side word-by-word OR matching (shows docs matching ANY word)
      if (qStr) {
        const words = qStr.toLowerCase().trim().split(/\s+/).filter(Boolean);
        if (words.length) {
          next = next.filter((f) => {
            const q = (f.question || "").toLowerCase();
            const a = (f.answer || "").toLowerCase();
            const content = `${q} ${a}`;
            // Show docs that contain ANY of the search words
            return words.some((word) => content.includes(word));
          });
        }
      }

      setFaqs(next);
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load FAQs",
        confirmButtonColor: "#44dcf3",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFAQs(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const startEdit = (faq) => {
    setEditingId(faq._id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "general",
      isActive: !!faq.isActive,
      order: faq.order || 0,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        order: Number(form.order),
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/admin/faq/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!data.success) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Failed to save FAQ",
          confirmButtonColor: "#44dcf3",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: editingId ? "Updated!" : "Created!",
          text: `FAQ ${editingId ? "updated" : "created"} successfully`,
          confirmButtonColor: "#44dcf3",
          timer: 2000,
          showConfirmButton: false,
        });
        await loadFAQs();
        resetForm();
      }
    } catch (e2) {
      console.error(e2);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred",
        confirmButtonColor: "#44dcf3",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id, question) => {
    const result = await Swal.fire({
      title: "Delete FAQ?",
      text: `Are you sure you want to delete "${question}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/faq/${id}`, {
          method: "DELETE",
        });
        const data = await res.json().catch(() => ({}));
        if (data.success || res.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "FAQ has been deleted successfully",
            confirmButtonColor: "#44dcf3",
            timer: 2000,
            showConfirmButton: false,
          });
          await loadFAQs();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.error || "Delete failed",
            confirmButtonColor: "#44dcf3",
          });
        }
      } catch (e) {
        console.error(e);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred",
          confirmButtonColor: "#44dcf3",
        });
      }
    }
  };

  const onSearch = async (e) => {
    e.preventDefault();
    await loadFAQs();
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/faq/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await loadFAQs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-secondary">
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">FAQ Management</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/80 text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            {showForm ? "Cancel" : "Add New FAQ"}
          </button>
        </div>
      </div>

      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <form onSubmit={onSearch} className="flex gap-2">
          <input
            className="flex-1 bg-black border border-[#212121] rounded px-3 py-2 text-white"
            placeholder="Search FAQs by question or answer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
          >
            <Search size={20} />
          </button>
        </form>
      </div>

      {showForm && (
        <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit FAQ" : "Add New FAQ"}
          </h3>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  name="question"
                  value={form.question}
                  onChange={onChange}
                  className="w-full bg-black border border-[#212121] rounded px-3 py-2 text-white"
                  placeholder="Enter the question"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  className="w-full bg-black border border-[#212121] rounded px-3 py-2 text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Answer</label>
              <textarea
                name="answer"
                value={form.answer}
                onChange={onChange}
                rows={4}
                className="w-full bg-black border border-[#212121] rounded px-3 py-2 text-white resize-vertical"
                placeholder="Enter the answer"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={form.order}
                  onChange={onChange}
                  className="w-full bg-black border border-[#212121] rounded px-3 py-2 text-white"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={onChange}
                  className="w-4 h-4 text-primary bg-black border-[#212121] rounded"
                />
                <label className="text-sm text-gray-300">Active</label>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/80 text-black px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update FAQ" : "Create FAQ"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading FAQs...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-8">
            <HelpCircle size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-gray-300">No FAQs found</p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-primary hover:bg-primary/80 text-black px-4 py-2 rounded-lg transition-colors"
              >
                Add Your First FAQ
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq._id}
                className={`rounded-lg p-4 border border-[#212121] ${
                  faq.isActive ? "" : "opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-gray-800 text-xs px-2 py-1 rounded">
                        {categories.find((c) => c.value === faq.category)
                          ?.label || faq.category}
                      </span>
                      {faq.order > 0 && (
                        <span className="text-gray-400 text-xs">
                          Order: {faq.order}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          faq.isActive
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {faq.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg mb-2">
                      {faq.question}
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(faq._id, faq.isActive)}
                      className={`p-2 rounded transition-colors ${
                        faq.isActive
                          ? "bg-red-900/50 hover:bg-red-900 text-red-300"
                          : "bg-green-900/50 hover:bg-green-900 text-green-300"
                      }`}
                      title={faq.isActive ? "Deactivate" : "Activate"}
                    >
                      {faq.isActive ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => startEdit(faq)}
                      className="p-2 bg-blue-900/50 hover:bg-blue-900 text-blue-300 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => remove(faq._id, faq.question)}
                      className="p-2 bg-red-900/50 hover:bg-red-900 text-red-300 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQManagement;
