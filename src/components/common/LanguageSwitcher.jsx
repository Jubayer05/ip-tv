"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { language, setLanguage, isLanguageLoaded } = useLanguage();

  // For future multi-language support
  const languages = [
    { code: "en", name: "English", flag: "����" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "����" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italiano", flag: "��🇹" },
    { code: "pt", name: "Português", flag: "🇵��" },
  ];

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  if (!isLanguageLoaded) return null;

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="bg-transparent text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-primary"
      >
        {languages.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            className="bg-gray-800 text-white"
          >
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
