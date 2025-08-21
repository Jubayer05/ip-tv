"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const ContactForm = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    description: "",
  });

  // Original text constants
  const ORIGINAL_TEXTS = {
    labels: {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      subject: "Subject",
      description: "Description",
    },
    placeholders: {
      firstName: "Enter your first name",
      lastName: "Enter your last name",
      email: "Enter your email here",
      subject: "Write your contact reason here",
      description: "Type your message here",
    },
    required: "*",
    button: "Submit Request",
  };

  // State for translated content
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        const items = [
          ...Object.values(ORIGINAL_TEXTS.labels),
          ...Object.values(ORIGINAL_TEXTS.placeholders),
          ORIGINAL_TEXTS.button,
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const labelsCount = Object.keys(ORIGINAL_TEXTS.labels).length;
        const placeholdersCount = Object.keys(
          ORIGINAL_TEXTS.placeholders
        ).length;

        const tLabels = translated.slice(0, labelsCount);
        const tPlaceholders = translated.slice(
          labelsCount,
          labelsCount + placeholdersCount
        );
        const tButton = translated[translated.length - 1];

        setTexts({
          labels: {
            firstName: tLabels[0],
            lastName: tLabels[1],
            email: tLabels[2],
            subject: tLabels[3],
            description: tLabels[4],
          },
          placeholders: {
            firstName: tPlaceholders[0],
            lastName: tPlaceholders[1],
            email: tPlaceholders[2],
            subject: tPlaceholders[3],
            description: tPlaceholders[4],
          },
          required: ORIGINAL_TEXTS.required,
          button: tButton,
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
  };

  return (
    <div className="w-full px-4 md:px-0">
      <div className="bg-black p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-white/15 font-secondary w-full max-w-2xl lg:ml-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* First Name and Last Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-white text-xs sm:text-sm font-medium mb-2">
                {texts.labels.firstName}
              </label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={texts.placeholders.firstName}
                className="text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-white text-xs sm:text-sm font-medium mb-2">
                {texts.labels.lastName}
              </label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={texts.placeholders.lastName}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              {texts.labels.email}{" "}
              <span className="text-red-500">{texts.required}</span>
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={texts.placeholders.email}
              required
              className="text-xs sm:text-sm"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              {texts.labels.subject}{" "}
              <span className="text-red-500">{texts.required}</span>
            </label>
            <Input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder={texts.placeholders.subject}
              required
              className="text-xs sm:text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white text-xs sm:text-sm font-medium mb-2">
              {texts.labels.description}{" "}
              <span className="text-red-500">{texts.required}</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={texts.placeholders.description}
              required
              rows={4}
              className="w-full bg-[#0C171C] text-white placeholder-white/50 border border-white/10 rounded-[10px] sm:rounded-[15px] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none transition-all duration-200"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2 text-xs sm:text-sm py-3 sm:py-4"
            onClick={handleSubmit}
          >
            <span>{texts.button}</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
