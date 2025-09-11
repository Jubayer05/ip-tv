"use client";
import { Edit, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const PaymentMethodsManagement = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});
  const [formData, setFormData] = useState({
    gateway: "",
    name: "",
    isActive: false,
    apiKey: "",
    apiSecret: "",
    merchantId: "",
    minAmount: 1,
    bonusSettings: [], // Changed from discountSettings
    description: "",
    logo: "",
    sortOrder: 0,
  });

  const gatewayOptions = [
    { value: "stripe", label: "Stripe", logo: "/payment_logo/stripe.png" },
    { value: "plisio", label: "Plisio", logo: "/payment_logo/plisio.png" },
    { value: "hoodpay", label: "HoodPay", logo: "/payment_logo/hoodpay.jpeg" },
    {
      value: "nowpayment",
      label: "NOWPayments",
      logo: "/payment_logo/now_payments.png",
    },
    {
      value: "changenow",
      label: "ChangeNOW",
      logo: "/payment_logo/changenow.png",
    },
    {
      value: "cryptomus",
      label: "Cryptomus",
      logo: "/payment_logo/cryptomus.png",
    },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payment-settings");
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      Swal.fire("Error", "Failed to fetch payment settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingSetting
        ? `/api/payment-settings/${editingSetting._id}`
        : "/api/payment-settings";

      const method = editingSetting ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire(
          "Success",
          editingSetting
            ? "Payment setting updated!"
            : "Payment setting created!",
          "success"
        );
        setShowModal(false);
        setEditingSetting(null);
        resetForm();
        fetchSettings();
      } else {
        Swal.fire("Error", data.error, "error");
      }
    } catch (error) {
      console.error("Error saving setting:", error);
      Swal.fire("Error", "Failed to save payment setting", "error");
    }
  };

  const handleEdit = (setting) => {
    setEditingSetting(setting);
    setFormData({
      ...setting,
      bonusSettings: (setting.bonusSettings || []).map(bonus => ({
        minAmount: bonus.minAmount || 0,
        bonusPercentage: bonus.bonusPercentage || 0,
        isActive: bonus.isActive !== undefined ? bonus.isActive : true,
      })),
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the payment setting!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/payment-settings/${id}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire("Deleted!", "Payment setting has been deleted.", "success");
          fetchSettings();
        } else {
          Swal.fire("Error", data.error, "error");
        }
      } catch (error) {
        console.error("Error deleting setting:", error);
        Swal.fire("Error", "Failed to delete payment setting", "error");
      }
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      const response = await fetch(`/api/payment-settings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await response.json();

      if (data.success) {
        fetchSettings();
      } else {
        Swal.fire("Error", data.error, "error");
      }
    } catch (error) {
      console.error("Error toggling active status:", error);
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      gateway: "",
      name: "",
      isActive: false,
      apiKey: "",
      apiSecret: "",
      merchantId: "",
      minAmount: 1,
      bonusSettings: [], // Changed from discountSettings
      description: "",
      logo: "",
      sortOrder: 0,
    });
  };

  const addBonusSetting = () => {
    // Changed from addDiscountSetting
    setFormData((prev) => ({
      ...prev,
      bonusSettings: [
        // Changed from discountSettings
        ...prev.bonusSettings,
        { 
          minAmount: 0, 
          bonusPercentage: 0, 
          isActive: true 
        }, // Changed from discountPercentage
      ],
    }));
  };

  const removeBonusSetting = (index) => {
    // Changed from removeDiscountSetting
    setFormData((prev) => ({
      ...prev,
      bonusSettings: prev.bonusSettings.filter((_, i) => i !== index), // Changed from discountSettings
    }));
  };

  const updateBonusSetting = (index, field, value) => {
    // Changed from updateDiscountSetting
    setFormData((prev) => ({
      ...prev,
      bonusSettings: prev.bonusSettings.map(
        (
          setting,
          i // Changed from discountSettings
        ) => (i === index ? { ...setting, [field]: value } : setting)
      ),
    }));
  };

  const toggleSecretVisibility = (id) => {
    setShowSecrets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          Payment Methods Management
        </h2>
        <button
          onClick={() => {
            setEditingSetting(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Payment Method
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settings.map((setting) => {
          const gatewayInfo = gatewayOptions.find(
            (g) => g.value === setting.gateway
          );
          return (
            <div
              key={setting._id}
              className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {gatewayInfo?.logo && (
                    <img
                      src={gatewayInfo.logo}
                      alt={setting.name}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-white">
                    {setting.name}
                  </h3>
                </div>
                <button
                  onClick={() => toggleActive(setting._id, setting.isActive)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    setting.isActive
                      ? "bg-green-600 text-green-100"
                      : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {setting.isActive ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-gray-400">Gateway:</span>{" "}
                  <span className="text-white">{setting.gateway}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-400">Min Amount:</span>{" "}
                  <span className="text-white">${setting.minAmount}</span>
                </p>
                {setting.merchantId && (
                  <p>
                    <span className="font-medium text-gray-400">
                      Merchant ID / Business ID:
                    </span>{" "}
                    <span className="text-white">{setting.merchantId}</span>
                  </p>
                )}
              </div>

              {/* Bonus Settings Display */}
              {setting.bonusSettings && setting.bonusSettings.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm text-gray-400 mb-2">
                    Bonus Settings:
                  </h4>
                  <div className="space-y-1">
                    {setting.bonusSettings.map((bonus, index) => (
                      <div key={index} className="text-xs text-gray-300">
                        <span className="text-gray-400">
                          ${bonus.minAmount}+
                        </span>{" "}
                        <span className="text-gray-500">→</span>{" "}
                        <span className="text-green-400">
                          {bonus.bonusPercentage}% bonus
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(setting)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1 transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(setting._id)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 flex items-center justify-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingSetting ? "Edit Payment Method" : "Add Payment Method"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Gateway *
                  </label>
                  <select
                    value={formData.gateway}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gateway: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingSetting}
                  >
                    <option value="">Select Gateway</option>
                    {gatewayOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    API Key *
                  </label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        apiKey: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={formData.apiSecret}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        apiSecret: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Merchant ID / Business ID
                  </label>
                  <input
                    type="text"
                    value={formData.merchantId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        merchantId: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Min Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.minAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minAmount: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Bonus Settings */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Bonus Settings
                  </label>
                  <button
                    type="button"
                    onClick={addBonusSetting}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    + Add Bonus
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.bonusSettings.map((bonus, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 p-3 rounded-lg border border-gray-600"
                    >
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Min Amount ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Enter minimum amount"
                            value={bonus.minAmount || 0} // Ensure controlled input
                            onChange={(e) =>
                              updateBonusSetting(
                                index,
                                "minAmount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Bonus (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="Enter bonus percentage"
                            value={bonus.bonusPercentage || 0} // Ensure controlled input
                            onChange={(e) =>
                              updateBonusSetting(
                                index,
                                "bonusPercentage",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeBonusSetting(index)}
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded"
                            title="Remove bonus setting"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-300"
                >
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingSetting ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsManagement;
