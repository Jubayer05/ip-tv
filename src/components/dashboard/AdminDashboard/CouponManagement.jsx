"use client";
import TableCustom from "@/components/ui/TableCustom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";

const initialForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  startDate: "",
  endDate: "",
  usageLimit: 0,
  isActive: true,
};

const CouponManagement = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingCode, setEditingCode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const ORIGINAL_TEXTS = {
    heading: "Coupon Management",
    searchByCode: "Search by code",
    search: "Search",
    couponCode: "Coupon Code",
    description: "Description",
    discountType: "Discount Type",
    percentage: "Percentage (%)",
    fixed: "Fixed ($)",
    discountValue: "Discount Value",
    minOrderAmount: "Min Order Amount",
    maxDiscountAmount: "Max Discount Amount",
    maxDiscountNone: "Max Discount (0=none)",
    startDate: "Start Date",
    endDate: "End Date",
    selectStartDate: "Select start date",
    selectEndDate: "Select end date",
    usageLimit: "Usage Limit",
    usageLimitUnlimited: "Usage Limit (0=unlimited)",
    status: "Status",
    active: "Active",
    update: "Update",
    create: "Create",
    cancel: "Cancel",
    coupons: "Coupons",
    loading: "Loading...",
    code: "Code",
    type: "Type",
    value: "Value",
    min: "Min",
    max: "Max",
    usage: "Usage",
    validTill: "Valid Till",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    noCoupons: "No coupons",
    deleteCoupon: "Delete Coupon?",
    areYouSureDelete:
      'Are you sure you want to delete coupon "{code}"? This action cannot be undone.',
    yesDeleteIt: "Yes, delete it!",
    cancelAction: "Cancel",
    deleted: "Deleted!",
    couponDeletedSuccessfully: "Coupon has been deleted successfully",
    error: "Error",
    deleteFailed: "Delete failed",
    unexpectedError: "An unexpected error occurred",
    errorTitle: "Error",
    failedToSaveCoupon: "Failed to save coupon",
    updated: "Updated!",
    created: "Created!",
    couponUpdated: "Coupon updated successfully",
    couponCreated: "Coupon created successfully",
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

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const q = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/coupons${q}`);
      const data = await res.json();
      if (data.success) setCoupons(data.coupons || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const startEdit = (c) => {
    setEditingCode(c.code);
    setForm({
      code: c.code,
      description: c.description || "",
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscountAmount: c.maxDiscountAmount || 0,
      startDate: c.startDate ? c.startDate.slice(0, 16) : "",
      endDate: c.endDate ? c.endDate.slice(0, 16) : "",
      usageLimit: c.usageLimit || 0,
      isActive: !!c.isActive,
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingCode(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount),
        maxDiscountAmount: Number(form.maxDiscountAmount),
        usageLimit: Number(form.usageLimit),
        startDate: form.startDate
          ? new Date(form.startDate).toISOString()
          : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      };

      let res;
      if (editingCode) {
        res = await fetch(`/api/coupons/${encodeURIComponent(editingCode)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!data.success) {
        Swal.fire({
          icon: "error",
          title: texts.errorTitle,
          text: data.error || texts.failedToSaveCoupon,
          confirmButtonColor: "#44dcf3",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: editingCode ? texts.updated : texts.created,
          text: editingCode ? texts.couponUpdated : texts.couponCreated,
          confirmButtonColor: "#44dcf3",
          timer: 2000,
          showConfirmButton: false,
        });
        await loadCoupons();
        resetForm();
      }
    } catch (e2) {
      console.error(e2);
      Swal.fire({
        icon: "error",
        title: texts.errorTitle,
        text: texts.unexpectedError,
        confirmButtonColor: "#44dcf3",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (code) => {
    const result = await Swal.fire({
      title: texts.deleteCoupon,
      text: texts.areYouSureDelete.replace("{code}", code),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: texts.yesDeleteIt,
      cancelButtonText: texts.cancelAction,
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/coupons/${encodeURIComponent(code)}`, {
          method: "DELETE",
        });
        const data = await res.json().catch(() => ({}));
        if (data.success || res.status === 200) {
          Swal.fire({
            icon: "success",
            title: texts.deleted,
            text: texts.couponDeletedSuccessfully,
            confirmButtonColor: "#44dcf3",
            timer: 2000,
            showConfirmButton: false,
          });
          await loadCoupons();
        } else {
          Swal.fire({
            icon: "error",
            title: texts.errorTitle,
            text: data.error || texts.deleteFailed,
            confirmButtonColor: "#44dcf3",
          });
        }
      } catch (e) {
        console.error(e);
        Swal.fire({
          icon: "error",
          title: texts.errorTitle,
          text: texts.unexpectedError,
          confirmButtonColor: "#44dcf3",
        });
      }
    }
  };

  const onSearch = async (e) => {
    e.preventDefault();
    await loadCoupons();
  };

  // Define columns for TableCustom
  const columns = [
    {
      title: texts.code,
      dataIndex: "code",
      key: "code",
      render: (code) => (
        <span className="text-white text-xs sm:text-sm font-semibold">
          {code}
        </span>
      ),
    },
    {
      title: texts.type,
      dataIndex: "discountType",
      key: "discountType",
      render: (type) => (
        <span className="text-gray-300 text-[10px] sm:text-xs capitalize">
          {type}
        </span>
      ),
    },
    {
      title: texts.value,
      key: "value",
      render: (_, record) => (
        <span className="text-white text-[10px] sm:text-xs">
          {record.discountType === "percentage"
            ? `${record.discountValue}%`
            : `$${record.discountValue}`}
        </span>
      ),
    },
    {
      title: texts.min,
      key: "min",
      render: (_, record) => (
        <span className="text-gray-300 text-[10px] sm:text-xs">
          ${record.minOrderAmount || 0}
        </span>
      ),
    },
    {
      title: texts.max,
      key: "max",
      render: (_, record) => (
        <span className="text-gray-300 text-[10px] sm:text-xs">
          {record.maxDiscountAmount ? `$${record.maxDiscountAmount}` : "-"}
        </span>
      ),
    },
    {
      title: texts.usage,
      key: "usage",
      render: (_, record) => (
        <span className="text-gray-300 text-[10px] sm:text-xs">
          {record.usedCount || 0}/{record.usageLimit || "∞"}
        </span>
      ),
    },
    {
      title: texts.active,
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <span
          className={`text-[10px] sm:text-xs px-2 py-1 rounded-full ${
            isActive
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {isActive ? "Yes" : "No"}
        </span>
      ),
    },
    {
      title: texts.validTill,
      dataIndex: "endDate",
      key: "endDate",
      render: (endDate) => (
        <span className="text-gray-300 text-[10px] sm:text-xs">
          {endDate ? new Date(endDate).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      title: texts.actions,
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-1 sm:gap-2">
          <button
            className="bg-white/10 hover:bg-white/20 px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs transition-colors"
            onClick={() => startEdit(record)}
          >
            {texts.edit}
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs transition-colors"
            onClick={() => remove(record.code)}
          >
            {texts.delete}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-4 text-white font-secondary">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">
        {texts.heading}
      </h2>

      <form
        onSubmit={onSearch}
        className="mb-3 sm:mb-4 flex flex-col sm:flex-row gap-2"
      >
        <input
          className="bg-black border border-white/20 rounded px-2 sm:px-3 py-2 text-xs sm:text-sm flex-1"
          placeholder={texts.searchByCode}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="cursor-pointer bg-primary px-3 sm:px-4 py-2 rounded text-xs sm:text-sm">
          {texts.search}
        </button>
      </form>

      <form
        onSubmit={submit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-black/50 border border-white/10 p-3 sm:p-4 rounded mb-4 sm:mb-6"
      >
        <div className="space-y-1">
          <label className="text-xs sm:text-sm text-gray-300">
            {texts.couponCode} *
          </label>
          <input
            name="code"
            placeholder="CODE"
            value={form.code}
            onChange={onChange}
            required
            disabled={!!editingCode}
            className="bg-black border border-white/20 rounded px-2 sm:px-3 py-2 uppercase w-full text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-sm text-gray-300">
            {texts.description}
          </label>
          <input
            name="description"
            placeholder={texts.description}
            value={form.description}
            onChange={onChange}
            className="bg-black border border-white/20 rounded px-2 sm:px-3 py-2 w-full text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-sm text-gray-300">
            {texts.discountType}
          </label>
          <select
            name="discountType"
            value={form.discountType}
            onChange={onChange}
            className="bg-black border border-white/20 rounded px-2 sm:px-3 py-2 w-full text-xs sm:text-sm"
          >
            <option value="percentage">{texts.percentage}</option>
            <option value="fixed">{texts.fixed}</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-sm text-gray-300">
            {texts.discountValue} *
          </label>
          <input
            type="number"
            name="discountValue"
            placeholder={texts.discountValue}
            value={form.discountValue}
            onChange={onChange}
            className="bg-black border border-white/20 rounded px-2 sm:px-3 py-2 w-full text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-sm text-gray-300">
            {texts.minOrderAmount}
          </label>
          <input
            type="number"
            name="minOrderAmount"
            placeholder={texts.minOrderAmount}
            value={form.minOrderAmount}
            onChange={onChange}
            className="bg-black border border-white/20 rounded px-2 sm:px-3 py-2 w-full text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-sm text-gray-300">
            {texts.maxDiscountAmount}
          </label>
          <input
            type="number"
            name="maxDiscountAmount"
            placeholder={texts.maxDiscountNone}
            value={form.maxDiscountAmount}
            onChange={onChange}
            className="bg-black border border-white/20 rounded px-2 sm:px-3 py-2 w-full text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-sm text-gray-300">
            {texts.startDate}
          </label>
          <DatePicker
            selected={form.startDate ? new Date(form.startDate) : null}
            onChange={(date) =>
              onChange({
                target: {
                  name: "startDate",
                  value: date ? date.toISOString() : "",
                },
              })
            }
            className="bg-black border border-white/20 rounded px-2 sm:px-3 py-2 w-full text-white text-xs sm:text-sm"
            placeholderText={texts.selectStartDate}
            dateFormat="MMM dd, yyyy"
            isClearable
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-sm text-gray-300">
            {texts.endDate}
          </label>
          <DatePicker
            selected={form.endDate ? new Date(form.endDate) : null}
            onChange={(date) =>
              onChange({
                target: {
                  name: "endDate",
                  value: date ? date.toISOString() : "",
                },
              })
            }
            className="bg-black border border-white/20 rounded px-2 sm:px-3 py-2 w-full text-white text-xs sm:text-sm"
            placeholderText={texts.selectEndDate}
            dateFormat="MMM dd, yyyy"
            isClearable
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-sm text-gray-300">
            {texts.usageLimit}
          </label>
          <input
            type="number"
            name="usageLimit"
            placeholder={texts.usageLimitUnlimited}
            value={form.usageLimit}
            onChange={onChange}
            className="bg-black border border-white/20 rounded px-2 sm:px-3 py-2 w-full text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-sm text-gray-300">
            {texts.status}
          </label>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={onChange}
              className="rounded w-3 h-3 sm:w-4 sm:h-4"
            />
            <span className="text-xs sm:text-sm">{texts.active}</span>
          </label>
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row gap-2">
          <button
            disabled={saving}
            className="cursor-pointer bg-primary px-3 sm:px-4 py-2 rounded text-xs sm:text-sm"
          >
            {editingCode ? texts.update : texts.create}
          </button>
          {editingCode && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-white/10 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm"
            >
              {texts.cancel}
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 sm:mt-6">
        <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
          {texts.coupons} ({coupons.length})
        </h3>
        {loading ? (
          <div className="text-center py-4 sm:py-8">
            <div className="text-xs sm:text-sm">{texts.loading}</div>
          </div>
        ) : (
          <TableCustom
            title=""
            data={coupons}
            columns={columns}
            pageSize={5}
            showButton={false}
            rowKey="code"
            className="overflow-x-scroll w-full"
          />
        )}
      </div>
    </div>
  );
};

export default CouponManagement;
