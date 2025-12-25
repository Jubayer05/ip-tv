"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Edit,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const PaymentMethodsManagement = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    gateway: "",
    name: "",
    isActive: false,
    apiKey: "",
    apiSecret: "",
    merchantId: "",
    businessId: "",
    webhookSecret: "",
    ipnSecret: "",
    allowedIps: [],
    minAmount: 1,
    bonusSettings: [],
    feeSettings: {
      isActive: false,
      feePercentage: 0,
      feeType: "percentage",
      fixedAmount: 0,
    },
    description: "",
    logo: "",
    imageUrl: "",
    sortOrder: 0,
  });

  // Add state for showing/hiding passwords - renamed to avoid conflict
  const [showApiKeyPassword, setShowApiKeyPassword] = useState(false);
  const [showApiSecretPassword, setShowApiSecretPassword] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [showIpnSecret, setShowIpnSecret] = useState(false);

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Payment Methods Management",
    addPaymentMethod: "Add Payment Method",
    loading: "Loading...",
    active: "Active",
    inactive: "Inactive",
    gateway: "Gateway",
    minAmount: "Min Amount",
    merchantIdBusinessId: "Polygon Wallet Address",
    bonusSettings: "Bonus Settings",
    serviceFee: "Service Fee",
    fee: "fee",
    fixedFee: "fixed fee",
    edit: "Edit",
    delete: "Delete",
    editPaymentMethod: "Edit Payment Method",
    addPaymentMethodModal: "Add Payment Method",
    selectGateway: "Select Gateway",
    name: "Name",
    apiKey: "API Key",
    apiSecret: "API Secret",
    businessId: "Business ID",
    merchantId: "Polygon Wallet Address",
    webhookSecret: "Webhook Secret",
    ipnSecret: "IPN Secret",
    allowedIps: "Allowed IPs (Optional)",
    allowedIpsPlaceholder: "Enter one IP address per line (e.g., 192.168.1.1)",
    webhookSecretHelp: "Required for secure webhook verification (HMAC-SHA256)",
    ipnSecretHelp: "Required for NOWPayments IPN verification (HMAC-SHA512)",
    allowedIpsHelp: "Restrict webhook callbacks to specific IP addresses for additional security",
    minAmountLabel: "Min Amount",
    bonusSettingsLabel: "Bonus Settings",
    addBonus: "Add Bonus",
    minAmountPlaceholder: "Enter minimum amount",
    bonusPlaceholder: "Enter bonus percentage",
    removeBonusSetting: "Remove bonus setting",
    enableServiceFee: "Enable Service Fee",
    feeType: "Fee Type",
    percentage: "Percentage (%)",
    fixedAmount: "Fixed Amount ($)",
    feePercentage: "Fee Percentage (%)",
    feePercentagePlaceholder: "Enter fee percentage",
    fixedFeeAmount: "Fixed Fee Amount ($)",
    fixedFeePlaceholder: "Enter fixed fee amount",
    active: "Active",
    update: "Update",
    create: "Create",
    cancel: "Cancel",
    success: "Success",
    paymentSettingUpdated: "Payment setting updated!",
    paymentSettingCreated: "Payment setting created!",
    error: "Error",
    areYouSure: "Are you sure?",
    permanentlyDelete: "This will permanently delete the payment setting!",
    yesDeleteIt: "Yes, delete it!",
    deleted: "Deleted!",
    paymentSettingDeleted: "Payment setting has been deleted.",
    failedToFetchSettings: "Failed to fetch payment settings",
    failedToSaveSetting: "Failed to save payment setting",
    failedToDeleteSetting: "Failed to delete payment setting",
    failedToUpdateStatus: "Failed to update status",
    uploadImage: "Upload Image",
    imagePreview: "Image Preview",
    removeImage: "Remove Image",
    uploadingImage: "Uploading...",
    imageUploaded: "Image uploaded successfully!",
    imageUploadFailed: "Failed to upload image",
    imageDeleted: "Image deleted successfully!",
    imageDeleteFailed: "Failed to delete image",
    selectImageFile: "Select Image File",
    imageRequirements: "Supported formats: JPEG, PNG, WebP. Max size: 5MB",
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
    {
      value: "paygate",
      label: "PayGate",
      logo: "/payment_logo/paygate.png",
    },
    {
      value: "volet",
      label: "Volet",
      logo: "/payment_logo/volet.png",
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
      Swal.fire(texts.error, texts.failedToFetchSettings, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire(
        texts.error,
        "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
        "error"
      );
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      Swal.fire(
        texts.error,
        "File size too large. Maximum size is 5MB.",
        "error"
      );
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/payment-settings/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: data.url,
        }));
        Swal.fire(texts.success, texts.imageUploaded, "success");
      } else {
        Swal.fire(texts.error, data.error || texts.imageUploadFailed, "error");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      Swal.fire(texts.error, texts.imageUploadFailed, "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.imageUrl) return;

    try {
      const response = await fetch(
        `/api/payment-settings/upload-image?imageUrl=${encodeURIComponent(
          formData.imageUrl
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: "",
        }));
        Swal.fire(texts.success, texts.imageDeleted, "success");
      } else {
        Swal.fire(texts.error, data.error || texts.imageDeleteFailed, "error");
      }
    } catch (error) {
      console.error("Image delete error:", error);
      Swal.fire(texts.error, texts.imageDeleteFailed, "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("📤 Submitting payment settings:", {
        gateway: formData.gateway,
        name: formData.name,
        hasWebhookSecret: !!formData.webhookSecret,
        webhookSecretLength: formData.webhookSecret?.length || 0,
        hasIpnSecret: !!formData.ipnSecret,
        ipnSecretLength: formData.ipnSecret?.length || 0,
        hasBusinessId: !!formData.businessId,
      });

      // ✅ Build the payload - send ALL formData
      const payload = { ...formData };

      console.log("📦 Complete payload:", {
        gateway: payload.gateway,
        name: payload.name,
        apiKey: payload.apiKey ? "***" + payload.apiKey.slice(-4) : "NOT SET",
        webhookSecret: payload.webhookSecret ? `SET (${payload.webhookSecret.length} chars) ***${payload.webhookSecret.slice(-4)}` : "NOT SET",
        ipnSecret: payload.ipnSecret ? `SET (${payload.ipnSecret.length} chars)` : "NOT SET",
        businessId: payload.businessId || "NOT SET",
        merchantId: payload.merchantId || "NOT SET",
      });

      const url = editingSetting
        ? `/api/payment-settings/${editingSetting._id}`
        : "/api/payment-settings";

      const method = editingSetting ? "PUT" : "POST";

      console.log("🌐 Calling:", method, url);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("📥 Server response:", {
        success: data.success,
        hasData: !!data.data,
        hasWebhookSecret: !!data.data?.webhookSecret,
        webhookSecretStored: data.data?.webhookSecret ? "YES ✅" : "NO ❌",
        error: data.error,
      });

      if (data.success) {
        Swal.fire(
          texts.success,
          editingSetting
            ? texts.paymentSettingUpdated
            : texts.paymentSettingCreated,
          "success"
        );
        setShowModal(false);
        setEditingSetting(null);
        resetForm();
        fetchSettings();
      } else {
        Swal.fire(texts.error, data.error, "error");
      }
    } catch (error) {
      console.error("❌ Error saving setting:", error);
      Swal.fire(texts.error, texts.failedToSaveSetting, "error");
    }
  };

  const handleEdit = (setting) => {
    setEditingSetting(setting);
    setFormData({
      ...setting,
      businessId: setting.businessId || setting.merchantId || "",
      webhookSecret: setting.webhookSecret || "",
      ipnSecret: setting.ipnSecret || "",
      allowedIps: setting.allowedIps || [],
      bonusSettings: (setting.bonusSettings || []).map((bonus) => ({
        minAmount: bonus.minAmount || 0,
        bonusPercentage: bonus.bonusPercentage || 0,
        isActive: bonus.isActive !== undefined ? bonus.isActive : true,
      })),
      feeSettings: {
        isActive: setting.feeSettings?.isActive || false,
        feePercentage: setting.feeSettings?.feePercentage || 0,
        feeType: setting.feeSettings?.feeType || "percentage",
        fixedAmount: setting.feeSettings?.fixedAmount || 0,
      },
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: texts.areYouSure,
      text: texts.permanentlyDelete,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: texts.yesDeleteIt,
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/payment-settings/${id}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire(texts.deleted, texts.paymentSettingDeleted, "success");
          fetchSettings();
        } else {
          Swal.fire(texts.error, data.error, "error");
        }
      } catch (error) {
        console.error("Error deleting setting:", error);
        Swal.fire(texts.error, texts.failedToDeleteSetting, "error");
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
        Swal.fire(texts.error, data.error, "error");
      }
    } catch (error) {
      console.error("Error toggling active status:", error);
      Swal.fire(texts.error, texts.failedToUpdateStatus, "error");
    }
  };

  const addBonusSetting = () => {
    setFormData((prev) => ({
      ...prev,
      bonusSettings: [
        ...prev.bonusSettings,
        { minAmount: 0, bonusPercentage: 0, isActive: true },
      ],
    }));
  };

  const removeBonusSetting = (index) => {
    setFormData((prev) => ({
      ...prev,
      bonusSettings: prev.bonusSettings.filter((_, i) => i !== index),
    }));
  };

  const updateBonusSetting = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      bonusSettings: prev.bonusSettings.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const resetForm = () => {
    setFormData({
      gateway: "",
      name: "",
      isActive: false,
      apiKey: "",
      apiSecret: "",
      merchantId: "",
      businessId: "",
      webhookSecret: "",
      ipnSecret: "",
      allowedIps: [],
      minAmount: 1,
      bonusSettings: [],
      feeSettings: {
        isActive: false,
        feePercentage: 0,
        feeType: "percentage",
        fixedAmount: 0,
      },
      description: "",
      logo: "",
      imageUrl: "",
      sortOrder: 0,
    });
  };

  // Field visibility and labels by gateway
  const showApiKey = [
    "stripe",
    "plisio",
    "hoodpay",
    "nowpayment",
    "changenow",
    "cryptomus",
    "volet",
  ].includes(formData.gateway);
  const showApiSecret = ["stripe", "volet"].includes(formData.gateway);
  const showMerchantId = [
    "hoodpay",
    "changenow",
    "cryptomus",
    "paygate",
    "volet",
  ].includes(formData.gateway);
  const showBusinessId = ["hoodpay", "volet"].includes(formData.gateway);
  const showWebhookSecretField = ["hoodpay", "stripe", "volet"].includes(formData.gateway);
  const showIpnSecretField = formData.gateway === "nowpayment";
  const showAllowedIpsField = ["hoodpay", "stripe", "volet"].includes(formData.gateway);
  const merchantLabel =
    formData.gateway === "hoodpay" ? texts.businessId : 
    formData.gateway === "volet" ? "Volet Account Email" : texts.merchantId;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {texts.heading}
        </h2>
        <button
          onClick={() => {
            setEditingSetting(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-xs sm:text-sm"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          {texts.addPaymentMethod}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {settings
          .filter((s) =>
            [
              "stripe",
              "plisio",
              "hoodpay",
              "nowpayment",
              "changenow",
              "cryptomus",
              "paygate",
              "volet",
            ].includes(s.gateway)
          )
          .map((setting) => {
            const gatewayInfo = gatewayOptions.find(
              (g) => g.value === setting.gateway
            );
            return (
              <div
                key={setting._id}
                className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Display custom image if available, otherwise use default logo */}
                    {setting.imageUrl ? (
                      <img
                        src={setting.imageUrl}
                        alt={setting.name}
                        className="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded"
                      />
                    ) : gatewayInfo?.logo ? (
                      <img
                        src={gatewayInfo.logo}
                        alt={setting.name}
                        className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                      />
                    ) : (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded flex items-center justify-center">
                        <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      </div>
                    )}
                    <h3 className="text-sm sm:text-lg font-semibold text-white">
                      {setting.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => toggleActive(setting._id, setting.isActive)}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      setting.isActive
                        ? "bg-green-600 text-green-100"
                        : "bg-gray-600 text-gray-300"
                    }`}
                  >
                    {setting.isActive ? texts.active : texts.inactive}
                  </button>
                </div>

                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                  <p>
                    <span className="font-medium text-gray-400">
                      {texts.gateway}:
                    </span>{" "}
                    <span className="text-white">{setting.gateway}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-400">
                      {texts.minAmount}:
                    </span>{" "}
                    <span className="text-white">${setting.minAmount}</span>
                  </p>
                  {setting.merchantId && (
                    <p>
                      <span className="font-medium text-gray-400 break-all">
                        {texts.merchantIdBusinessId}:
                      </span>{" "}
                      <span className="text-white wrap-break-word break-all">
                        {setting.merchantId}
                      </span>
                    </p>
                  )}
                </div>

                {/* Bonus Settings Display */}
                {setting.bonusSettings && setting.bonusSettings.length > 0 && (
                  <div className="mt-3 sm:mt-4">
                    <h4 className="font-medium text-xs sm:text-sm text-gray-400 mb-2">
                      {texts.bonusSettings}:
                    </h4>
                    <div className="space-y-1">
                      {setting.bonusSettings.map((bonus, index) => (
                        <div
                          key={index}
                          className="text-[10px] sm:text-xs text-gray-300"
                        >
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

                {/* Fee Settings Display */}
                {setting.feeSettings && setting.feeSettings.isActive && (
                  <div className="mt-3 sm:mt-4">
                    <h4 className="font-medium text-xs sm:text-sm text-gray-400 mb-2">
                      {texts.serviceFee}:
                    </h4>
                    <div className="text-[10px] sm:text-xs text-gray-300">
                      {setting.feeSettings.feeType === "percentage" ? (
                        <span>
                          <span className="text-red-400">
                            {setting.feeSettings.feePercentage}% {texts.fee}
                          </span>
                          <span className="text-gray-500 ml-1">
                            (e.g., $100 → $
                            {(
                              100 +
                              (100 * setting.feeSettings.feePercentage) / 100
                            ).toFixed(2)}
                            )
                          </span>
                        </span>
                      ) : (
                        <span>
                          <span className="text-red-400">
                            ${setting.feeSettings.fixedAmount} {texts.fixedFee}
                          </span>
                          <span className="text-gray-500 ml-1">
                            (e.g., $100 → $
                            {(100 + setting.feeSettings.fixedAmount).toFixed(2)}
                            )
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
                  <button
                    onClick={() => handleEdit(setting)}
                    className="flex-1 bg-blue-600 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm hover:bg-blue-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    {texts.edit}
                  </button>
                  <button
                    onClick={() => handleDelete(setting._id)}
                    className="flex-1 bg-red-600 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm hover:bg-red-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    {texts.delete}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                {editingSetting
                  ? texts.editPaymentMethod
                  : texts.addPaymentMethodModal}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                    {texts.gateway} *
                  </label>
                  <select
                    value={formData.gateway}
                    onChange={(e) => {
                      const newGateway = e.target.value;
                      const currentGateway = formData.gateway;

                      // Only clear fields if gateway actually changed
                      if (newGateway !== currentGateway) {
                        setFormData((prev) => ({
                          ...prev,
                          gateway: newGateway,
                          apiKey: "",
                          apiSecret: "",
                          merchantId: "",
                        }));
                      } else {
                        // Just update the gateway if it's the same
                        setFormData((prev) => ({
                          ...prev,
                          gateway: newGateway,
                        }));
                      }
                    }}
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    required
                    disabled={!!editingSetting}
                  >
                    <option value="">{texts.selectGateway}</option>
                    {gatewayOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                    {texts.name} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    required
                  />
                </div>

                {/* Image Upload Section */}
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                    {texts.uploadImage}
                  </label>
                  <div className="space-y-2 sm:space-y-3">
                    {/* Image Preview */}
                    {formData.imageUrl && (
                      <div className="relative">
                        <img
                          src={formData.imageUrl}
                          alt="Payment method preview"
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain bg-gray-800 rounded-lg border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs hover:bg-red-700"
                        >
                          <X className="w-2 h-2 sm:w-3 sm:h-3" />
                        </button>
                      </div>
                    )}

                    {/* File Upload */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <label className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-xs sm:text-sm">
                        <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                        {uploadingImage
                          ? texts.uploadingImage
                          : texts.selectImageFile}
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                      {uploadingImage && (
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
                      )}
                    </div>

                    <p className="text-[10px] sm:text-xs text-gray-400">
                      {texts.imageRequirements}
                    </p>
                  </div>
                </div>

                {showApiKey && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      {formData.gateway === "volet" ? "SCI Password *" : formData.gateway === "stripe" ? "Secret Key" : texts.apiKey + " *"}
                    </label>
                    <div className="relative">
                      <input
                        // type={showApiKeyPassword ? "text" : "password"}
                        type="text"
                        value={formData.apiKey}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            apiKey: e.target.value,
                          }))
                        }
                        className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                        required
                        placeholder={formData.gateway === "stripe" ? "sk_test_51..." : ""}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowApiKeyPassword(!showApiKeyPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                      >
                        {showApiKeyPassword ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {formData.gateway === "volet" && (
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        Your Volet SCI Password for signature generation
                      </p>
                    )}
                    {formData.gateway === "stripe" && (
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        Enter your Stripe Secret Key (starts with sk_test_ or sk_live_) - used for server-side API calls
                      </p>
                    )}
                  </div>
                )}

                {showApiSecret && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      {formData.gateway === "volet" ? "API Security Word *" : formData.gateway === "stripe" ? "Publishable Key" : texts.apiSecret}
                    </label>
                    <div className="relative">
                      <input
                        type={showApiSecretPassword ? "text" : "password"}
                        value={formData.apiSecret}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            apiSecret: e.target.value,
                          }))
                        }
                        className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        required={formData.gateway === "stripe"}
                        disabled={formData.gateway === "nowpayment"}
                        placeholder={formData.gateway === "nowpayment" ? "Not required for NOWPayments" : formData.gateway === "volet" ? "Volet API Security Word for webhook verification" : formData.gateway === "stripe" ? "pk_test_51..." : ""}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowApiSecretPassword(!showApiSecretPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white disabled:opacity-50"
                        disabled={formData.gateway === "nowpayment"}
                      >
                        {showApiSecretPassword ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {formData.gateway === "nowpayment" && (
                      <p className="text-xs text-red-400 mt-1">
                        API Secret is not required for NOWPayments
                      </p>
                    )}
                    {formData.gateway === "volet" && (
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        API Security Word for webhook signature verification
                      </p>
                    )}
                    {formData.gateway === "stripe" && (
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        Enter your Stripe Publishable Key (starts with pk_test_ or pk_live_) - used for frontend checkout
                      </p>
                    )}
                  </div>
                )}

                {showMerchantId && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      {merchantLabel} *
                    </label>
                    <input
                      type="text"
                      value={formData.merchantId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          merchantId: e.target.value,
                          // For HoodPay, also update businessId field
                          ...(formData.gateway === "hoodpay" && {
                            businessId: e.target.value,
                          }),
                        }))
                      }
                      className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      required
                    />
                    {formData.gateway === "volet" && (
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        Your Volet account email (ac_account_email)
                      </p>
                    )}
                  </div>
                )}

                {showBusinessId && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      {formData.gateway === "volet" ? "SCI Name *" : texts.businessId + " *"}
                    </label>
                    <input
                      type="text"
                      value={formData.businessId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          businessId: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      required
                    />
                    {formData.gateway === "volet" && (
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        Your Volet SCI name (ac_sci_name) from your Volet merchant settings
                      </p>
                    )}
                  </div>
                )}

                {showWebhookSecretField && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      {formData.gateway === "stripe" ? `${texts.webhookSecret} (Optional)` : `${texts.webhookSecret} *`}
                    </label>
                    <div className="relative">
                      <input
                        type={showWebhookSecret ? "text" : "password"}
                        value={formData.webhookSecret}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            webhookSecret: e.target.value,
                          }))
                        }
                        className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                        required={formData.gateway !== "stripe"}
                        placeholder={formData.gateway === "stripe" ? "whsec_... (optional - can add later)" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                      >
                        {showWebhookSecret ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                      {formData.gateway === "stripe" 
                        ? "Optional: Get from Stripe Dashboard → Developers → Webhooks. Needed for automatic payment status updates. You can add this later."
                        : texts.webhookSecretHelp}
                    </p>
                  </div>
                )}

                {showIpnSecretField && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      {texts.ipnSecret} *
                    </label>
                    <div className="relative">
                      <input
                        type={showIpnSecret ? "text" : "password"}
                        value={formData.ipnSecret}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            ipnSecret: e.target.value,
                          }))
                        }
                        className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowIpnSecret(!showIpnSecret)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                      >
                        {showIpnSecret ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                      {texts.ipnSecretHelp}
                    </p>
                  </div>
                )}

                {showAllowedIpsField && (
                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      {texts.allowedIps}
                    </label>
                    <textarea
                      value={(formData.allowedIps || []).join("\n")}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          allowedIps: e.target.value
                            .split("\n")
                            .map((ip) => ip.trim())
                            .filter((ip) => ip.length > 0),
                        }))
                      }
                      placeholder={texts.allowedIpsPlaceholder}
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    />
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                      {texts.allowedIpsHelp}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                    {texts.minAmountLabel} *
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
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Bonus Settings */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300">
                    {texts.bonusSettingsLabel}
                  </label>
                  <button
                    type="button"
                    onClick={addBonusSetting}
                    className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
                  >
                    + {texts.addBonus}
                  </button>
                </div>

                <div className="space-y-2 sm:space-y-3">
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
                            placeholder={texts.minAmountPlaceholder}
                            value={bonus.minAmount || 0}
                            onChange={(e) =>
                              updateBonusSetting(
                                index,
                                "minAmount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            placeholder={texts.bonusPlaceholder}
                            value={bonus.bonusPercentage || 0}
                            onChange={(e) =>
                              updateBonusSetting(
                                index,
                                "bonusPercentage",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeBonusSetting(index)}
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded"
                            title={texts.removeBonusSetting}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee Settings */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="feeActive"
                    checked={formData.feeSettings.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        feeSettings: {
                          ...prev.feeSettings,
                          isActive: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 text-xs sm:text-sm"
                  />
                  <label
                    htmlFor="feeActive"
                    className="text-xs sm:text-sm font-medium text-gray-300"
                  >
                    {texts.enableServiceFee}
                  </label>
                </div>

                {formData.feeSettings.isActive && (
                  <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 space-y-2 sm:space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        {texts.feeType}
                      </label>
                      <select
                        value={formData.feeSettings.feeType}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            feeSettings: {
                              ...prev.feeSettings,
                              feeType: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="percentage">{texts.percentage}</option>
                        <option value="fixed">{texts.fixedAmount}</option>
                      </select>
                    </div>

                    {formData.feeSettings.feeType === "percentage" ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          {texts.feePercentage}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder={texts.feePercentagePlaceholder}
                          value={formData.feeSettings.feePercentage || 0}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              feeSettings: {
                                ...prev.feeSettings,
                                feePercentage: parseFloat(e.target.value) || 0,
                              },
                            }))
                          }
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          {texts.fixedFeeAmount}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={texts.fixedFeePlaceholder}
                          value={formData.feeSettings.fixedAmount || 0}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              feeSettings: {
                                ...prev.feeSettings,
                                fixedAmount: parseFloat(e.target.value) || 0,
                              },
                            }))
                          }
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}
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
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 text-xs sm:text-sm"
                />
                <label
                  htmlFor="isActive"
                  className="text-xs sm:text-sm font-medium text-gray-300"
                >
                  {texts.active}
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                  {editingSetting ? texts.update : texts.create}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 text-xs sm:text-sm"
                >
                  {texts.cancel}
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
