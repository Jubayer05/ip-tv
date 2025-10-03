"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import AffiliateFundTransfer from "./AffiliateManagement/AffiliateFundTransfer";

const AffiliateManagement = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [pct, setPct] = useState(10);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const ORIGINAL_TEXTS = {
    heading: "Affiliate Management",
    subtitle:
      "Set the commission percentage that referrers earn on a referred user's first completed order.",
    commissionPercentage: "Commission Percentage",
    orderTotal: "% of order total",
    settingsSaved: "Settings saved",
    refresh: "Refresh",
    save: "Save",
    saving: "Saving...",
    failedToLoadSettings: "Failed to load settings",
    failedToUpdateSettings: "Failed to update settings",
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

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data?.success) {
        setPct(Number(data.data?.affiliateCommissionPct || 10));
      } else {
        setError(data?.error || texts.failedToLoadSettings);
      }
    } catch (e) {
      setError(texts.failedToLoadSettings);
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
        setError(data?.error || texts.failedToUpdateSettings);
      }
    } catch (e) {
      setError(texts.failedToUpdateSettings);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-secondary">
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">{texts.heading}</h2>
        <p className="text-gray-300 text-sm mb-6">{texts.subtitle}</p>

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-gray-300 min-w-[160px]">
            {texts.commissionPercentage}
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
          <span className="text-gray-400">{texts.orderTotal}</span>
        </div>

        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
        {saved && (
          <div className="mb-3 text-sm text-green-400">
            {texts.settingsSaved}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={load} variant="outline" disabled={loading}>
            {texts.refresh}
          </Button>
          <Button onClick={save} disabled={loading}>
            {loading ? texts.saving : texts.save}
          </Button>
        </div>
      </div>
      <AffiliateFundTransfer />
    </div>
  );
};

export default AffiliateManagement;
