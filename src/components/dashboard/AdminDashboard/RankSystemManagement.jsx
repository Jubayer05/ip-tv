"use client";
import TableCustom from "@/components/ui/TableCustom";
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
    spendingRange: "Spending Range",
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

  // Define columns for TableCustom
  const columns = [
    {
      title: texts.order,
      dataIndex: "order",
      key: "order",
      render: (order) => (
        <span className="text-white pl-2 text-xs sm:text-sm font-medium">
          {order}
        </span>
      ),
    },
    {
      title: texts.name,
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <div className="flex items-center">
          <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-primary mr-1 sm:mr-2 flex-shrink-0" />
          <span className="text-white text-xs sm:text-sm font-medium truncate">
            {name}
          </span>
        </div>
      ),
    },
    {
      title: texts.benefits,
      dataIndex: "benefits",
      key: "benefits",
      render: (benefits) => (
        <span className="text-gray-300 text-[10px] sm:text-xs max-w-xs truncate block">
          {benefits}
        </span>
      ),
    },
    {
      title: texts.spendingRange,
      key: "spendingRange",
      render: (_, record) => (
        <span className="text-gray-300 text-[10px] sm:text-xs">
          ${record.spending.min} - ${record.spending.max}
        </span>
      ),
    },
    {
      title: texts.discount,
      dataIndex: "discount",
      key: "discount",
      render: (discount) => (
        <span className="text-white text-[10px] sm:text-xs font-medium">
          {discount}%
        </span>
      ),
    },
    {
      title: texts.actions,
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-1 sm:space-x-2">
          <button
            onClick={() => handleEdit(record)}
            className="text-blue-400 hover:text-blue-300 transition-colors p-1"
            title={texts.edit}
          >
            <Edit size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => handleDelete(record._id)}
            className="text-red-400 hover:text-red-300 transition-colors p-1"
            title={texts.delete}
          >
            <Trash2 size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="text-white text-xs sm:text-sm">{texts.loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-secondary px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            {texts.title}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">{texts.subtitle}</p>
        </div>
        <button
          onClick={addNewRank}
          className="bg-primary hover:bg-primary/80 cursor-pointer text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm"
        >
          <Plus size={16} className="sm:w-5 sm:h-5" />
          {texts.addNew}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-black border border-[#212121] rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
            {editingId ? texts.edit : texts.addNew}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  {texts.name}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-2 sm:px-3 py-2 text-white focus:border-primary focus:outline-none text-xs sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
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
                  className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-2 sm:px-3 py-2 text-white focus:border-primary focus:outline-none text-xs sm:text-sm"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                {texts.benefits}
              </label>
              <textarea
                value={formData.benefits}
                onChange={(e) =>
                  setFormData({ ...formData, benefits: e.target.value })
                }
                className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-2 sm:px-3 py-2 text-white focus:border-primary focus:outline-none text-xs sm:text-sm"
                rows="3"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
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
                  className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-2 sm:px-3 py-2 text-white focus:border-primary focus:outline-none text-xs sm:text-sm"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
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
                  className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-2 sm:px-3 py-2 text-white focus:border-primary focus:outline-none text-xs sm:text-sm"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
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
                  className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-2 sm:px-3 py-2 text-white focus:border-primary focus:outline-none text-xs sm:text-sm"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
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
                  className="w-full bg-[#0E0E11] border border-white/15 rounded-lg px-2 sm:px-3 py-2 text-white focus:border-primary focus:outline-none text-xs sm:text-sm"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.earlyAccess}
                  onChange={(e) =>
                    setFormData({ ...formData, earlyAccess: e.target.checked })
                  }
                  className="rounded border-white/15 bg-[#0E0E11] text-primary focus:ring-primary w-3 h-3 sm:w-4 sm:h-4"
                />
                <span className="text-xs sm:text-sm text-gray-300">
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
                  className="rounded border-white/15 bg-[#0E0E11] text-primary focus:ring-primary w-3 h-3 sm:w-4 sm:h-4"
                />
                <span className="text-xs sm:text-sm text-gray-300">
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
                  className="rounded border-white/15 bg-[#0E0E11] text-primary focus:ring-primary w-3 h-3 sm:w-4 sm:h-4"
                />
                <span className="text-xs sm:text-sm text-gray-300">
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
                  className="rounded border-white/15 bg-[#0E0E11] text-primary focus:ring-primary w-3 h-3 sm:w-4 sm:h-4"
                />
                <span className="text-xs sm:text-sm text-gray-300">
                  {texts.exclusivePerks}
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
              <button
                type="submit"
                className="bg-primary hover:bg-primary/80 cursor-pointer text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm"
              >
                <Save size={16} className="sm:w-5 sm:h-5" />
                {texts.save}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm"
              >
                <X size={16} className="sm:w-5 sm:h-5" />
                {texts.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rank Systems Table */}
      <TableCustom
        title="Current Rank Systems"
        data={rankSystems}
        columns={columns}
        pageSize={5}
        showButton={false}
        rowKey="_id"
        className="overflow-x-scroll w-full"
      />
    </div>
  );
}
