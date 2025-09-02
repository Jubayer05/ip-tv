"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Crown, Edit, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function RankSystemManagement() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [rankSystems, setRankSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    benefits: "",
    spending: { min: 0, max: 0 },
    discount: 0,
    bonusDevices: 0,
    earlyAccess: false,
    vipSupport: false,
    customCoupons: false,
    exclusivePerks: false,
    order: 1,
  });

  const ORIGINAL_TEXTS = {
    title: "Rank System Management",
    subtitle: "Manage user ranks, benefits, and progression rules",
    addNew: "Add New Rank",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    name: "Rank Name",
    benefits: "Benefits Description",
    minSpending: "Min Spending ($)",
    maxSpending: "Max Spending ($)",
    discount: "Discount (%)",
    bonusDevices: "Bonus Devices",
    earlyAccess: "Early Access to Sales",
    vipSupport: "VIP Support",
    customCoupons: "Custom Coupon Codes",
    exclusivePerks: "Exclusive Perks",
    order: "Display Order",
    actions: "Actions",
    noRanks: "No rank systems found",
    loading: "Loading...",
    deleteConfirm: "Are you sure you want to delete this rank?",
    success: "Success",
    error: "Error",
    created: "Rank system created successfully",
    updated: "Rank system updated successfully",
    deleted: "Rank system deleted successfully",
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
    fetchRankSystems();
  }, []);

  const fetchRankSystems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/rank-system");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setRankSystems(data.data);
      } else {
        console.error("API Error:", data.error);
        // Show error message with SweetAlert2
        Swal.fire({
          title: "Error!",
          text: data.error || "Failed to fetch rank systems",
          icon: "error",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error fetching rank systems:", error);
      // Show error message with SweetAlert2
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch rank systems. Please check your connection and try again.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/admin/rank-system/${editingId}`
        : "/api/admin/rank-system";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Show success message with SweetAlert2
        Swal.fire({
          title: "Success!",
          text: editingId
            ? "Rank system updated successfully!"
            : "Rank system created successfully!",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
          timer: 3000,
          timerProgressBar: true,
        }).then(() => {
          setShowForm(false);
          setEditingId(null);
          resetForm();
          fetchRankSystems();
        });
      } else {
        // Show error message with SweetAlert2
        Swal.fire({
          title: "Error!",
          text: data.error || "Failed to save rank system",
          icon: "error",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error saving rank system:", error);
      // Show error message with SweetAlert2
      Swal.fire({
        title: "Error!",
        text: "Failed to save rank system. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
    }
  };

  const handleEdit = (rank) => {
    setEditingId(rank._id);
    setFormData({
      name: rank.name,
      benefits: rank.benefits,
      spending: rank.spending,
      discount: rank.discount,
      bonusDevices: rank.bonusDevices || 0,
      earlyAccess: rank.earlyAccess || false,
      vipSupport: rank.vipSupport || false,
      customCoupons: rank.customCoupons || false,
      exclusivePerks: rank.exclusivePerks || false,
      order: rank.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    // Show confirmation dialog with SweetAlert2
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/admin/rank-system/${id}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          // Show success message
          Swal.fire({
            title: "Deleted!",
            text: "Rank system has been deleted successfully.",
            icon: "success",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
            timer: 3000,
            timerProgressBar: true,
          }).then(() => {
            fetchRankSystems();
          });
        } else {
          // Show error message
          Swal.fire({
            title: "Error!",
            text: data.error || "Failed to delete rank system",
            icon: "error",
            confirmButtonColor: "#d33",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error("Error deleting rank system:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete rank system. Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      benefits: "",
      spending: { min: 0, max: 0 },
      discount: 0,
      bonusDevices: 0,
      earlyAccess: false,
      vipSupport: false,
      customCoupons: false,
      exclusivePerks: false,
      order: 1,
    });
  };

  const addNewRank = () => {
    setEditingId(null);
    resetForm();
    setFormData((prev) => ({ ...prev, order: rankSystems.length + 1 }));
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">{texts.loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-secondary">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">{texts.title}</h1>
          <p className="text-gray-400">{texts.subtitle}</p>
        </div>
        <button
          onClick={addNewRank}
          className="bg-primary hover:bg-primary/80 cursor-pointer text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          {texts.addNew}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-black border border-[#212121] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {editingId ? texts.edit : texts.addNew}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {texts.name}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {texts.order}
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value),
                    })
                  }
                  className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {texts.benefits}
              </label>
              <textarea
                value={formData.benefits}
                onChange={(e) =>
                  setFormData({ ...formData, benefits: e.target.value })
                }
                className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                rows="3"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {texts.minSpending}
                </label>
                <input
                  type="number"
                  value={formData.spending.min}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      spending: {
                        ...formData.spending,
                        min: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {texts.maxSpending}
                </label>
                <input
                  type="number"
                  value={formData.spending.max}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      spending: {
                        ...formData.spending,
                        max: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {texts.discount}
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {texts.bonusDevices}
                </label>
                <input
                  type="number"
                  value={formData.bonusDevices}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bonusDevices: parseInt(e.target.value),
                    })
                  }
                  className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.earlyAccess}
                  onChange={(e) =>
                    setFormData({ ...formData, earlyAccess: e.target.checked })
                  }
                  className="rounded border-white/15 bg-[#0E0E11] text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-300">
                  {texts.earlyAccess}
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.vipSupport}
                  onChange={(e) =>
                    setFormData({ ...formData, vipSupport: e.target.checked })
                  }
                  className="rounded border-white/15 bg-[#0E0E11] text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-300">
                  {texts.vipSupport}
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.customCoupons}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customCoupons: e.target.checked,
                    })
                  }
                  className="rounded border-white/15 bg-[#0E0E11] text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-300">
                  {texts.customCoupons}
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.exclusivePerks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      exclusivePerks: e.target.checked,
                    })
                  }
                  className="rounded border-white/15 bg-[#0E0E11] text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-300">
                  {texts.exclusivePerks}
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-primary hover:bg-primary/80 cursor-pointer text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save size={20} />
                {texts.save}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <X size={20} />
                {texts.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rank Systems List */}
      <div className="bg-black border border-[#212121] rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">
            Current Rank Systems
          </h3>
        </div>

        {rankSystems.length === 0 ? (
          <div className="p-6 text-center text-gray-400">{texts.noRanks}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0E0E11] border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {texts.order}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {texts.name}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {texts.benefits}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Spending Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {texts.discount}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {texts.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {rankSystems.map((rank) => (
                  <tr
                    key={rank._id}
                    className="hover:bg-[#0E0E11] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {rank.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Crown className="w-5 h-5 text-primary mr-2" />
                        <span className="text-sm font-medium text-white">
                          {rank.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                      {rank.benefits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${rank.spending.min} - ${rank.spending.max}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {rank.discount}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(rank)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(rank._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
