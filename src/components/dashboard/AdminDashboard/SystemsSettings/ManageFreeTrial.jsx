"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import { CheckCircle, Clock, Play, Shield, Star } from "lucide-react";
import { useEffect, useState } from "react";

const ManageFreeTrial = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [freeTrialContent, setFreeTrialContent] = useState({
    title: "Start Your Free Trial",
    description:
      "Experience premium IPTV content for 24 hours - completely free!",
    features: [
      {
        id: 1,
        title: "24 Hours Free",
        description: "Full access to all channels and features",
        icon: "clock",
      },
      {
        id: 2,
        title: "Premium Quality",
        description: "HD and 4K content with no buffering",
        icon: "star",
      },
      {
        id: 3,
        title: "No Commitment",
        description: "Cancel anytime, no hidden fees",
        icon: "shield",
      },
    ],
    includedTitle: "What's Included in Your Free Trial?",
    includedItems: [
      "Access to all channels in your selected template",
      "HD and 4K quality streaming",
      "24/7 customer support",
      "No credit card required",
    ],
  });

  const iconMap = {
    clock: Clock,
    star: Star,
    shield: Shield,
    play: Play,
    checkCircle: CheckCircle,
  };

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Free Trial Management",
    subtitle: "Manage your free trial content from admin panel",
    mainTitle: "Main Title",
    description: "Description",
    features: "Features",
    title: "Title",
    descriptionLabel: "Description",
    icon: "Icon",
    clock: "Clock",
    star: "Star",
    shield: "Shield",
    play: "Play",
    includedSectionTitle: "Included Section Title",
    includedItems: "Included Items",
    remove: "Remove",
    addItem: "Add Item",
    refresh: "Refresh",
    updating: "Updating...",
    updateContent: "Update Content",
    freeTrialContentUpdatedSuccess: "Free trial content updated successfully!",
    failedToLoadSettings: "Failed to load settings",
    failedToUpdateFreeTrialContent: "Failed to update free trial content",
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
      const response = await apiCall("/api/admin/settings", "GET");
      if (response.success && response.data.freeTrialContent) {
        setFreeTrialContent(response.data.freeTrialContent);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setError(texts.failedToLoadSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (field, value) => {
    setFreeTrialContent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    setFreeTrialContent((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? { ...feature, [field]: value } : feature
      ),
    }));
  };

  const handleIncludedItemChange = (index, value) => {
    setFreeTrialContent((prev) => ({
      ...prev,
      includedItems: prev.includedItems.map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const addIncludedItem = () => {
    setFreeTrialContent((prev) => ({
      ...prev,
      includedItems: [...prev.includedItems, ""],
    }));
  };

  const removeIncludedItem = (index) => {
    setFreeTrialContent((prev) => ({
      ...prev,
      includedItems: prev.includedItems.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const response = await apiCall("/api/admin/settings", "PUT", {
        freeTrialContent: freeTrialContent,
      });

      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } else {
        setError(response.error || texts.failedToUpdateFreeTrialContent);
      }
    } catch (error) {
      console.error("Failed to update free trial content:", error);
      setError(texts.failedToUpdateFreeTrialContent);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-secondary">
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <h2 className="text-3xl text-center font-bold mb-4">{texts.heading}</h2>
        <p className="text-gray-300 text-sm mb-6 text-center">
          {texts.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Title and Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold text-sm mb-2">
                {texts.mainTitle}
              </label>
              <input
                type="text"
                value={freeTrialContent.title}
                onChange={(e) => handleContentChange("title", e.target.value)}
                className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md text-white focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-white font-semibold text-sm mb-2">
                {texts.description}
              </label>
              <textarea
                value={freeTrialContent.description}
                onChange={(e) =>
                  handleContentChange("description", e.target.value)
                }
                className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
                disabled={loading}
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">
              {texts.features}
            </h3>
            {freeTrialContent.features.map((feature, index) => (
              <div
                key={feature.id}
                className="border border-[#333] rounded-lg p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white font-semibold text-sm mb-2">
                      {texts.title}
                    </label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) =>
                        handleFeatureChange(index, "title", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md text-white focus:outline-none focus:border-blue-500"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold text-sm mb-2">
                      {texts.descriptionLabel}
                    </label>
                    <input
                      type="text"
                      value={feature.description}
                      onChange={(e) =>
                        handleFeatureChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md text-white focus:outline-none focus:border-blue-500"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold text-sm mb-2">
                      {texts.icon}
                    </label>
                    <select
                      value={feature.icon}
                      onChange={(e) =>
                        handleFeatureChange(index, "icon", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md text-white focus:outline-none focus:border-blue-500"
                      disabled={loading}
                    >
                      <option value="clock">{texts.clock}</option>
                      <option value="star">{texts.star}</option>
                      <option value="shield">{texts.shield}</option>
                      <option value="play">{texts.play}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* What's Included Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold text-sm mb-2">
                {texts.includedSectionTitle}
              </label>
              <input
                type="text"
                value={freeTrialContent.includedTitle}
                onChange={(e) =>
                  handleContentChange("includedTitle", e.target.value)
                }
                className="w-full px-3 py-2 bg-[#212121] border border-[#333] rounded-md text-white focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-white font-semibold text-sm mb-2">
                {texts.includedItems}
              </label>
              {freeTrialContent.includedItems.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) =>
                      handleIncludedItemChange(index, e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-[#212121] border border-[#333] rounded-md text-white focus:outline-none focus:border-blue-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => removeIncludedItem(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    disabled={loading}
                  >
                    {texts.remove}
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addIncludedItem}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                disabled={loading}
              >
                {texts.addItem}
              </button>
            </div>
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}
          {saved && (
            <div className="text-sm text-green-400 text-center">
              {texts.freeTrialContentUpdatedSuccess}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading}
              className="px-4 py-2 border border-[#333] text-white rounded-md hover:bg-[#212121] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {texts.refresh}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? texts.updating : texts.updateContent}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageFreeTrial;
