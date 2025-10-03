"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";
import ReactCountryFlag from "react-country-flag";

const langToCountry = {
  en: "GB",
  sv: "SE",
  no: "NO",
  da: "DK",
  fi: "FI",
  fr: "FR",
  de: "DE",
  es: "ES",
  it: "IT",
  ru: "RU",
  tr: "TR",
  ar: "SA",
  hi: "IN",
  zh: "CN",
};

const LanguageSwitcher = () => {
  const { language, setLanguage, languages, isLanguageLoaded } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handleLanguageChange = (code) => {
    const selected = languages.find((l) => l.code === code);
    if (selected) {
      setLanguage(selected);
      setOpen(false);
    }
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!isLanguageLoaded) return null;

  const currentCountry = langToCountry[language.code] || "GB";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-transparent text-white border border-gray-600 rounded px-3 py-1 text-sm hover:border-primary focus:outline-none"
      >
        <ReactCountryFlag
          countryCode={currentCountry}
          svg
          style={{ width: "1.1rem", height: "1.1rem" }}
          aria-label={language.name}
        />
        <span>{language.name}</span>
      </button>

      {open && (
        <div className="absolute mt-2 w-48 max-h-64 overflow-auto rounded border border-gray-600 bg-gray-900 shadow-lg z-50">
          {languages.map((lang) => {
            const cc = langToCountry[lang.code] || "GB";
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-white hover:bg-gray-800 text-sm"
              >
                <ReactCountryFlag
                  countryCode={cc}
                  svg
                  style={{ width: "1rem", height: "1rem" }}
                  aria-label={lang.name}
                />
                <span>{lang.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
