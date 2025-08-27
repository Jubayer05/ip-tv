"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useEffect, useState } from "react";
import AffiliateFundTransfer from "./AffiliateManagement/AffiliateFundTransfer";

const AffiliateManagement = () => {
  const [loading, setLoading] = useState(false);
  const [pct, setPct] = useState(10);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data?.success) {
        setPct(Number(data.data?.affiliateCommissionPct || 10));
      } else {
        setError(data?.error || "Failed to load settings");
      }
    } catch (e) {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      setLoading(true);
      setError("");
      setSaved(false);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateCommissionPct: pct }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } else {
        setError(data?.error || "Failed to update settings");
      }
    } catch (e) {
      setError("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-secondary">
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Affiliate Management</h2>
        <p className="text-gray-300 text-sm mb-6">
          Set the commission percentage that referrers earn on a referred user's
          first completed order.
        </p>

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-gray-300 min-w-[160px]">
            Commission Percentage
          </label>
          <Input
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
            disabled={loading}
          />
          <span className="text-gray-400">% of order total</span>
        </div>

        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
        {saved && (
          <div className="mb-3 text-sm text-green-400">Settings saved</div>
        )}

        <div className="flex gap-3">
          <Button onClick={load} variant="outline" disabled={loading}>
            Refresh
          </Button>
          <Button onClick={save} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      <AffiliateFundTransfer />
    </div>
  );
};

export default AffiliateManagement;
