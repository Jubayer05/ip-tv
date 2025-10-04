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
    <div className="flex flex-col gap-3 sm:gap-4 font-secondary px-4 sm:px-6 lg:px-8">
      <div className="bg-black border border-[#212121] rounded-lg p-4 sm:p-6 text-white">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">
          {texts.heading}
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6">
          {texts.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <label className="text-xs sm:text-sm text-gray-300 min-w-0 sm:min-w-[160px]">
            {texts.commissionPercentage}
          </label>
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <Input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={pct}
              onChange={(e) => setPct(Number(e.target.value))}
              disabled={loading}
              className="flex-1 max-w-[120px] sm:max-w-none"
            />
            <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">
              {texts.orderTotal}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-2 sm:mb-3 text-xs sm:text-sm text-red-400">
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-2 sm:mb-3 text-xs sm:text-sm text-green-400">
            {texts.settingsSaved}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={load}
            variant="outline"
            disabled={loading}
            className="text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            {texts.refresh}
          </Button>
          <Button
            onClick={save}
            disabled={loading}
            className="text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            {loading ? texts.saving : texts.save}
          </Button>
        </div>
      </div>
      <AffiliateFundTransfer />
    </div>
  );
};

export default AffiliateManagement;
