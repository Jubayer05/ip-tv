"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart3, X } from "lucide-react";
import { useEffect, useState } from "react";

const ShowModalUrlTracking = ({ urlTrackingId, isOpen, onClose }) => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all"); // 1day, 7days, 30days, all
  const [clicks, setClicks] = useState([]);
  const [stats, setStats] = useState(null);

  const ORIGINAL_TEXTS = {
    title: "Click Tracking Details",
    loading: "Loading...",
    totalClicks: "Total Clicks",
    uniqueVisitors: "Unique Visitors",
    byPlatform: "By Platform",
    byCountry: "By Country",
    byBrowser: "By Browser",
    byOS: "By Operating System",
    visitorId: "Visitor ID",
    clickCount: "Clicks",
    platform: "Platform",
    deviceType: "Device Type",
    browser: "Browser",
    os: "OS",
    country: "Country",
    firstClick: "First Click",
    lastClick: "Last Click",
    oneDay: "1 Day",
    sevenDays: "7 Days",
    oneMonth: "1 Month",
    allTime: "All Time",
    summary: "Summary",
    details: "Click Details",
    close: "Close",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!isLanguageLoaded) {
          if (mounted) setTexts(ORIGINAL_TEXTS);
          return;
        }
        const values = Object.values(ORIGINAL_TEXTS);
        const translated = await translate(values);
        const keys = Object.keys(ORIGINAL_TEXTS);
        const result = keys.reduce((acc, key, idx) => {
          acc[key] = translated?.[idx] || ORIGINAL_TEXTS[key];
          return acc;
        }, {});
        if (mounted) setTexts(result);
      } catch {
        if (mounted) setTexts(ORIGINAL_TEXTS);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isLanguageLoaded, language?.code]);

  const fetchAnalytics = async () => {
    if (!urlTrackingId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/url-tracking/analytics/${urlTrackingId}?period=${period}`
      );
      const data = await response.json();

      if (data.success) {
        setClicks(data.data.clicks);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && urlTrackingId) {
      fetchAnalytics();
    }
  }, [isOpen, urlTrackingId, period]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  const formatVisitorId = (id) => {
    if (!id) return "N/A";
    return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {texts.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setPeriod("1day")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === "1day"
                ? "bg-cyan-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {texts.oneDay}
          </button>
          <button
            onClick={() => setPeriod("7days")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === "7days"
                ? "bg-cyan-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {texts.sevenDays}
          </button>
          <button
            onClick={() => setPeriod("30days")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === "30days"
                ? "bg-cyan-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {texts.oneMonth}
          </button>
          <button
            onClick={() => setPeriod("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === "all"
                ? "bg-cyan-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {texts.allTime}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white">{texts.loading}</div>
          </div>
        ) : (
          <>
            {/* Summary Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                {texts.summary}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">
                    {texts.totalClicks}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalClicks || 0}
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">
                    {texts.uniqueVisitors}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.uniqueVisitors || 0}
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">
                    {texts.byPlatform}
                  </p>
                  <div className="space-y-1">
                    {stats?.byPlatform &&
                      Object.entries(stats.byPlatform)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([platform, count]) => (
                          <p key={platform} className="text-white text-sm">
                            {platform}: {count}
                          </p>
                        ))}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">
                    {texts.byCountry}
                  </p>
                  <div className="space-y-1">
                    {stats?.byCountry &&
                      Object.entries(stats.byCountry)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([country, count]) => (
                          <p key={country} className="text-white text-sm">
                            {country}: {count}
                          </p>
                        ))}
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2 font-semibold">
                    {texts.byBrowser}
                  </p>
                  <div className="space-y-1">
                    {stats?.byBrowser &&
                      Object.entries(stats.byBrowser)
                        .sort((a, b) => b[1] - a[1])
                        .map(([browser, count]) => (
                          <div
                            key={browser}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-300">{browser}</span>
                            <span className="text-white font-semibold">
                              {count}
                            </span>
                          </div>
                        ))}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2 font-semibold">
                    {texts.byOS}
                  </p>
                  <div className="space-y-1">
                    {stats?.byOS &&
                      Object.entries(stats.byOS)
                        .sort((a, b) => b[1] - a[1])
                        .map(([os, count]) => (
                          <div
                            key={os}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-300">{os}</span>
                            <span className="text-white font-semibold">
                              {count}
                            </span>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Table */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                {texts.details}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-700/50">
                      <th className="px-4 py-2 text-left text-gray-300 text-sm font-semibold">
                        {texts.visitorId}
                      </th>
                      <th className="px-4 py-2 text-left text-gray-300 text-sm font-semibold">
                        {texts.clickCount}
                      </th>
                      <th className="px-4 py-2 text-left text-gray-300 text-sm font-semibold">
                        {texts.platform}
                      </th>
                      <th className="px-4 py-2 text-left text-gray-300 text-sm font-semibold">
                        {texts.deviceType}
                      </th>
                      <th className="px-4 py-2 text-left text-gray-300 text-sm font-semibold">
                        {texts.browser}
                      </th>
                      <th className="px-4 py-2 text-left text-gray-300 text-sm font-semibold">
                        {texts.os}
                      </th>
                      <th className="px-4 py-2 text-left text-gray-300 text-sm font-semibold">
                        {texts.country}
                      </th>
                      <th className="px-4 py-2 text-left text-gray-300 text-sm font-semibold">
                        {texts.firstClick}
                      </th>
                      <th className="px-4 py-2 text-left text-gray-300 text-sm font-semibold">
                        {texts.lastClick}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clicks.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          No data available for this period
                        </td>
                      </tr>
                    ) : (
                      clicks.map((click, index) => (
                        <tr
                          key={click._id || index}
                          className="border-t border-gray-700 hover:bg-gray-700/30"
                        >
                          <td className="px-4 py-2 text-white text-sm font-mono">
                            {formatVisitorId(click.visitorId)}
                          </td>
                          <td className="px-4 py-2 text-white text-sm">
                            {click.clickCount}
                          </td>
                          <td className="px-4 py-2 text-gray-300 text-sm">
                            {click.deviceInfo?.platform || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-gray-300 text-sm">
                            {click.deviceInfo?.deviceType || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-gray-300 text-sm">
                            {click.deviceInfo?.browser || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-gray-300 text-sm">
                            {click.deviceInfo?.os || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-gray-300 text-sm">
                            {click.location?.country || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-gray-400 text-xs">
                            {formatDate(click.firstClickAt)}
                          </td>
                          <td className="px-4 py-2 text-gray-400 text-xs">
                            {formatDate(click.lastClickAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            {texts.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowModalUrlTracking;
