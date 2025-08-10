"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);

const LANG_STORAGE_KEY = "app_lang";

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
];

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState({ code: "en", name: "English" });

  // Load saved language
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.code && parsed?.name) {
          setLanguage(parsed);
        }
      }
    } catch {}
  }, []);

  // Persist and set direction
  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(language));
    } catch {}
    if (typeof document !== "undefined") {
      const dir = language.code === "ar" ? "rtl" : "ltr";
      document.documentElement.setAttribute("dir", dir);
      document.documentElement.lang = language.code;
    }
  }, [language]);

  const translate = async (input) => {
    if (!input || (Array.isArray(input) && input.length === 0)) return input;
    const isArray = Array.isArray(input);
    const items = isArray ? input : [input];

    // Shortcut: no translation needed for English
    if (language.code === "en") {
      return isArray ? items : items[0];
    }

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: items,
          source: "auto",
          target: language.code,
          format: "text",
          alternatives: 3,
          api_key: "",
        }),
      });

      const data = await res.json();
      const out =
        data?.translations ?? (data?.translation ? [data.translation] : items);

      return isArray ? out : out[0];
    } catch {
      // Fallback to original text on error
      return isArray ? items : items[0];
    }
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: AVAILABLE_LANGUAGES,
      translate,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
