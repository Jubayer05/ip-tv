"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";

const ManageBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
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

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Banner Content Management",
    subtitle:
      "Manage banner content for different pages. Each banner has a heading (with normal and highlighted parts) and a paragraph.",
    homePage: "Home Page",
    aboutPage: "About Page",
    affiliatePage: "Affiliate Page",
    blogPage: "Blog Page",
    contactPage: "Contact Page",
    faqPage: "FAQ Page",
    pricingPage: "Pricing Page",
    privacyPage: "Privacy Page",
    termsPage: "Terms Page",
    knowledgeBase: "Knowledge Base",
    explorePage: "Explore Page",
    headingPart1: "Heading Part 1 (Normal)",
    headingPart2: "Heading Part 2 (Highlighted)",
    paragraph: "Paragraph",
    inputPlaceholder: "Input Placeholder",
    buttonText: "Button Text",
    trialNote: "Trial Note",
    watchNowButton: "Watch Now Button",
    myWishlistButton: "My Wishlist Button",
    headingPart1Placeholder: "Enter heading part 1",
    headingPart2Placeholder: "Enter heading part 2",
    paragraphPlaceholder: "Enter paragraph text",
    inputPlaceholderPlaceholder: "Enter input placeholder",
    buttonTextPlaceholder: "Enter button text",
    trialNotePlaceholder: "Enter trial note text",
    watchNowPlaceholder: "Enter watch now button text",
    wishlistPlaceholder: "Enter wishlist button text",
    refresh: "Refresh",
    saving: "Saving...",
    save: "Save",
    settingsSaved: "Settings saved",
    failedToLoadSettings: "Failed to load settings",
    failedToUpdateBanners: "Failed to update banners",
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/api/admin/settings?nocache=true", "GET");
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
      setError(texts.failedToLoadSettings);
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
        setError(response.error || texts.failedToUpdateBanners);
      }
    } catch (error) {
      console.error("💥 Banner update error:", error);
      setError(texts.failedToUpdateBanners);
    } finally {
      setLoading(false);
    }
  };

  const bannerPages = [
    { key: "home", label: texts.homePage, hasButton: true },
    { key: "about", label: texts.aboutPage, hasButton: false },
    { key: "affiliate", label: texts.affiliatePage, hasButton: false },
    { key: "blog", label: texts.blogPage, hasButton: false },
    { key: "contact", label: texts.contactPage, hasButton: false },
    { key: "faq", label: texts.faqPage, hasButton: true },
    {
      key: "pricing",
      label: texts.pricingPage,
      hasButton: true,
      hasTrialNote: true,
    },
    { key: "privacy", label: texts.privacyPage, hasButton: false },
    { key: "terms", label: texts.termsPage, hasButton: false },
    { key: "knowledge", label: texts.knowledgeBase, hasButton: false },
    {
      key: "explore",
      label: texts.explorePage,
      hasButton: true,
      hasWatchNow: true,
    },
  ];

  return (
    <div className="flex flex-col gap-4 font-secondary px-4 sm:px-6 lg:px-8">
      <div className="bg-black border border-[#212121] rounded-lg p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl md:text-3xl text-center font-bold mb-3 sm:mb-4">
          {texts.heading}
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6">
          {texts.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {bannerPages.map((page) => (
            <div
              key={page.key}
              className="border border-[#333] rounded-lg p-3 sm:p-4"
            >
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
                {page.label}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm text-gray-300">
                    {texts.headingPart1}
                  </label>
                  <input
                    type="text"
                    value={banners[page.key]?.heading1 || ""}
                    onChange={(e) =>
                      handleBannerChange(page.key, "heading1", e.target.value)
                    }
                    placeholder={texts.headingPart1Placeholder}
                    className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm text-gray-300">
                    {texts.headingPart2}
                  </label>
                  <input
                    type="text"
                    value={banners[page.key]?.heading2 || ""}
                    onChange={(e) =>
                      handleBannerChange(page.key, "heading2", e.target.value)
                    }
                    placeholder={texts.headingPart2Placeholder}
                    className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-3 sm:mt-4 space-y-2">
                <label className="text-xs sm:text-sm text-gray-300">
                  {texts.paragraph}
                </label>
                <textarea
                  value={banners[page.key]?.paragraph || ""}
                  onChange={(e) =>
                    handleBannerChange(page.key, "paragraph", e.target.value)
                  }
                  placeholder={texts.paragraphPlaceholder}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-xs sm:text-sm"
                />
              </div>

              {page.hasButton && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm text-gray-300">
                      {texts.inputPlaceholder}
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
                      placeholder={texts.inputPlaceholderPlaceholder}
                      className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm text-gray-300">
                      {texts.buttonText}
                    </label>
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
                      placeholder={texts.buttonTextPlaceholder}
                      className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {page.hasTrialNote && (
                <div className="mt-3 sm:mt-4 space-y-2">
                  <label className="text-xs sm:text-sm text-gray-300">
                    {texts.trialNote}
                  </label>
                  <input
                    type="text"
                    value={banners[page.key]?.trialNote || ""}
                    onChange={(e) =>
                      handleBannerChange(page.key, "trialNote", e.target.value)
                    }
                    placeholder={texts.trialNotePlaceholder}
                    className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-xs sm:text-sm"
                  />
                </div>
              )}

              {page.hasWatchNow && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm text-gray-300">
                      {texts.watchNowButton}
                    </label>
                    <input
                      type="text"
                      value={banners[page.key]?.watchNow || ""}
                      onChange={(e) =>
                        handleBannerChange(page.key, "watchNow", e.target.value)
                      }
                      placeholder={texts.watchNowPlaceholder}
                      className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm text-gray-300">
                      {texts.myWishlistButton}
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
                      placeholder={texts.wishlistPlaceholder}
                      className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {error && (
            <div className="text-xs sm:text-sm text-red-400">{error}</div>
          )}
          {saved && (
            <div className="text-xs sm:text-sm text-green-400">
              {texts.settingsSaved}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 border border-[#333] text-white rounded-md hover:bg-[#212121] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {texts.refresh}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {loading ? texts.saving : texts.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageBanner;
