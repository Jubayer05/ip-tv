"use client";
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
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingCode, setEditingCode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

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
          title: "Error",
          text: data.error || "Failed to save coupon",
          confirmButtonColor: "#44dcf3",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: editingCode ? "Updated!" : "Created!",
          text: `Coupon ${editingCode ? "updated" : "created"} successfully`,
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
        title: "Error",
        text: "An unexpected error occurred",
        confirmButtonColor: "#44dcf3",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (code) => {
    const result = await Swal.fire({
      title: "Delete Coupon?",
      text: `Are you sure you want to delete coupon "${code}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
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
            title: "Deleted!",
            text: "Coupon has been deleted successfully",
            confirmButtonColor: "#44dcf3",
            timer: 2000,
            showConfirmButton: false,
          });
          await loadCoupons();
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
    await loadCoupons();
  };

  return (
    <div className="p-4 text-white font-secondary">
      <h2 className="text-xl font-bold mb-4">Coupon Management</h2>

      <form onSubmit={onSearch} className="mb-4 flex gap-2">
        <input
          className="bg-black border border-white/20 rounded px-3 py-2"
          placeholder="Search by code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="cursor-pointer bg-primary px-4 rounded">
          Search
        </button>
      </form>

      <form
        onSubmit={submit}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-black/50 border border-white/10 p-4 rounded"
      >
        <div className="space-y-1">
          <label className="text-sm text-gray-300">Coupon Code *</label>
          <input
            name="code"
            placeholder="CODE"
            value={form.code}
            onChange={onChange}
            required
            disabled={!!editingCode}
            className="bg-black border border-white/20 rounded px-3 py-2 uppercase w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-300">Description</label>
          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={onChange}
            className="bg-black border border-white/20 rounded px-3 py-2 w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-300">Discount Type</label>
          <select
            name="discountType"
            value={form.discountType}
            onChange={onChange}
            className="bg-black border border-white/20 rounded px-3 py-2 w-full"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed ($)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-300">Discount Value *</label>
          <input
            type="number"
            name="discountValue"
            placeholder="Discount Value"
            value={form.discountValue}
            onChange={onChange}
            className="bg-black border border-white/20 rounded px-3 py-2 w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-300">Min Order Amount</label>
          <input
            type="number"
            name="minOrderAmount"
            placeholder="Min Order Amount"
            value={form.minOrderAmount}
            onChange={onChange}
            className="bg-black border border-white/20 rounded px-3 py-2 w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-300">Max Discount Amount</label>
          <input
            type="number"
            name="maxDiscountAmount"
            placeholder="Max Discount (0=none)"
            value={form.maxDiscountAmount}
            onChange={onChange}
            className="bg-black border border-white/20 rounded px-3 py-2 w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-300">Start Date</label>
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
            className="bg-black border border-white/20 rounded px-3 py-2 w-full text-white"
            placeholderText="Select start date"
            dateFormat="MMM dd, yyyy"
            isClearable
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-300">End Date</label>
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
            className="bg-black border border-white/20 rounded px-3 py-2 w-full text-white"
            placeholderText="Select end date"
            dateFormat="MMM dd, yyyy"
            isClearable
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-300">Usage Limit</label>
          <input
            type="number"
            name="usageLimit"
            placeholder="Usage Limit (0=unlimited)"
            value={form.usageLimit}
            onChange={onChange}
            className="bg-black border border-white/20 rounded px-3 py-2 w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-300">Status</label>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={onChange}
              className="rounded"
            />
            <span className="text-sm">Active</span>
          </label>
        </div>

        <div className="col-span-1 md:col-span-3 flex gap-2">
          <button
            disabled={saving}
            className="cursor-pointer bg-primary px-4 py-2 rounded"
          >
            {editingCode ? "Update" : "Create"}
          </button>
          {editingCode && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-white/10 px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Coupons ({coupons.length})</h3>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Value</th>
                  <th className="text-left p-2">Min</th>
                  <th className="text-left p-2">Max</th>
                  <th className="text-left p-2">Usage</th>
                  <th className="text-left p-2">Active</th>
                  <th className="text-left p-2">Valid Till</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.code} className="border-t border-white/10">
                    <td className="p-2 font-semibold">{c.code}</td>
                    <td className="p-2">{c.discountType}</td>
                    <td className="p-2">
                      {c.discountType === "percentage"
                        ? `${c.discountValue}%`
                        : `$${c.discountValue}`}
                    </td>
                    <td className="p-2">${c.minOrderAmount || 0}</td>
                    <td className="p-2">
                      {c.maxDiscountAmount ? `$${c.maxDiscountAmount}` : "-"}
                    </td>
                    <td className="p-2">
                      {c.usedCount || 0}/{c.usageLimit || "∞"}
                    </td>
                    <td className="p-2">{c.isActive ? "Yes" : "No"}</td>
                    <td className="p-2">
                      {c.endDate
                        ? new Date(c.endDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="bg-white/10 px-3 py-1 rounded"
                        onClick={() => startEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 px-3 py-1 rounded"
                        onClick={() => remove(c.code)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td className="p-3 text-center" colSpan={9}>
                      No coupons
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponManagement;
