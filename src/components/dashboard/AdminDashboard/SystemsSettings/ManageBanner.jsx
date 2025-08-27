"use client";
import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";

const ManageBanner = () => {
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Initialize with complete banner structure
  const [banners, setBanners] = useState({
    home: {
      heading1: "",
      heading2: "",
      paragraph: "",
      placeholder: "",
      buttonText: "",
    },
    about: {
      heading1: "",
      heading2: "",
      paragraph: "",
    },
    affiliate: {
      heading1: "",
      heading2: "",
      paragraph: "",
    },
    blog: {
      heading1: "",
      heading2: "",
      paragraph: "",
    },
    contact: {
      heading1: "",
      heading2: "",
      paragraph: "",
    },
    faq: {
      heading1: "",
      heading2: "",
      paragraph: "",
      buttonText: "",
    },
    pricing: {
      heading1: "",
      heading2: "",
      paragraph: "",
      buttonText: "",
      trialNote: "",
    },
    privacy: {
      heading1: "",
      heading2: "",
      paragraph: "",
    },
    terms: {
      heading1: "",
      heading2: "",
      paragraph: "",
    },
    knowledge: {
      heading1: "",
      heading2: "",
      paragraph: "",
    },
    explore: {
      heading1: "",
      heading2: "",
      paragraph: "",
      watchNow: "",
      myWishlist: "",
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/api/admin/settings", "GET");
      if (response.success && response.data.banners) {
        // Merge fetched data with default structure to ensure all fields exist
        const updatedBanners = { ...banners };
        Object.keys(response.data.banners).forEach((page) => {
          if (updatedBanners[page]) {
            updatedBanners[page] = {
              ...updatedBanners[page],
              ...response.data.banners[page],
            };
          }
        });
        setBanners(updatedBanners);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleBannerChange = (page, field, value) => {
    setBanners((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const payload = { banners: banners };

      const response = await apiCall("/api/admin/settings", "PUT", payload);

      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);

        // Refresh the data to confirm it was saved
        setTimeout(() => {
          fetchSettings();
        }, 1000);
      } else {
        setError(response.error || "Failed to update banners");
      }
    } catch (error) {
      console.error("💥 Banner update error:", error);
      setError("Failed to update banners");
    } finally {
      setLoading(false);
    }
  };

  const bannerPages = [
    { key: "home", label: "Home Page", hasButton: true },
    { key: "about", label: "About Page", hasButton: false },
    { key: "affiliate", label: "Affiliate Page", hasButton: false },
    { key: "blog", label: "Blog Page", hasButton: false },
    { key: "contact", label: "Contact Page", hasButton: false },
    { key: "faq", label: "FAQ Page", hasButton: true },
    {
      key: "pricing",
      label: "Pricing Page",
      hasButton: true,
      hasTrialNote: true,
    },
    { key: "privacy", label: "Privacy Page", hasButton: false },
    { key: "terms", label: "Terms Page", hasButton: false },
    { key: "knowledge", label: "Knowledge Base", hasButton: false },
    {
      key: "explore",
      label: "Explore Page",
      hasButton: true,
      hasWatchNow: true,
    },
  ];

  return (
    <div className="flex flex-col gap-4 font-secondary">
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <h2 className="text-3xl text-center font-bold mb-4">
          Banner Content Management
        </h2>
        <p className="text-gray-300 text-sm mb-6">
          Manage banner content for different pages. Each banner has a heading
          (with normal and highlighted parts) and a paragraph.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {bannerPages.map((page) => (
            <div key={page.key} className="border border-[#333] rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-white">
                {page.label}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">
                    Heading Part 1 (Normal)
                  </label>
                  <input
                    type="text"
                    value={banners[page.key]?.heading1 || ""}
                    onChange={(e) =>
                      handleBannerChange(page.key, "heading1", e.target.value)
                    }
                    placeholder="Enter heading part 1"
                    className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">
                    Heading Part 2 (Highlighted)
                  </label>
                  <input
                    type="text"
                    value={banners[page.key]?.heading2 || ""}
                    onChange={(e) =>
                      handleBannerChange(page.key, "heading2", e.target.value)
                    }
                    placeholder="Enter heading part 2"
                    className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm text-gray-300">Paragraph</label>
                <textarea
                  value={banners[page.key]?.paragraph || ""}
                  onChange={(e) =>
                    handleBannerChange(page.key, "paragraph", e.target.value)
                  }
                  placeholder="Enter paragraph text"
                  rows={3}
                  className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                />
              </div>

              {page.hasButton && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">
                      Input Placeholder
                    </label>
                    <input
                      type="text"
                      value={banners[page.key]?.placeholder || ""}
                      onChange={(e) =>
                        handleBannerChange(
                          page.key,
                          "placeholder",
                          e.target.value
                        )
                      }
                      placeholder="Enter input placeholder"
                      className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Button Text</label>
                    <input
                      type="text"
                      value={banners[page.key]?.buttonText || ""}
                      onChange={(e) =>
                        handleBannerChange(
                          page.key,
                          "buttonText",
                          e.target.value
                        )
                      }
                      placeholder="Enter button text"
                      className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              )}

              {page.hasTrialNote && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm text-gray-300">Trial Note</label>
                  <input
                    type="text"
                    value={banners[page.key]?.trialNote || ""}
                    onChange={(e) =>
                      handleBannerChange(page.key, "trialNote", e.target.value)
                    }
                    placeholder="Enter trial note text"
                    className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                </div>
              )}

              {page.hasWatchNow && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">
                      Watch Now Button
                    </label>
                    <input
                      type="text"
                      value={banners[page.key]?.watchNow || ""}
                      onChange={(e) =>
                        handleBannerChange(page.key, "watchNow", e.target.value)
                      }
                      placeholder="Enter watch now button text"
                      className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">
                      My Wishlist Button
                    </label>
                    <input
                      type="text"
                      value={banners[page.key]?.myWishlist || ""}
                      onChange={(e) =>
                        handleBannerChange(
                          page.key,
                          "myWishlist",
                          e.target.value
                        )
                      }
                      placeholder="Enter wishlist button text"
                      className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {error && <div className="text-sm text-red-400">{error}</div>}
          {saved && (
            <div className="text-sm text-green-400">Settings saved</div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading}
              className="px-4 py-2 border border-[#333] text-white rounded-md hover:bg-[#212121] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refresh
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageBanner;
