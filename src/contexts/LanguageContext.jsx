"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);

const LANG_STORAGE_KEY = "app_lang";

const AVAILABLE_LANGUAGES = [
  { code: "ar", name: "Arabic" },
  { code: "en", name: "English" },
  { code: "zh", name: "Chinese" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ru", name: "Russian" },
  { code: "tr", name: "Turkish" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
];

export function LanguageProvider({ children }) {
  // Start with null to indicate language hasn't been loaded yet
  const [language, setLanguage] = useState(null);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.code && parsed?.name) {
          setLanguage(parsed);
        } else {
          // If saved language is invalid, set to English
          setLanguage({ code: "en", name: "English" });
        }
      } else {
        // If no saved language, set to English
        setLanguage({ code: "en", name: "English" });
      }
      setIsLanguageLoaded(true);
    } catch (error) {
      // If there's an error, fallback to English
      console.error("Error loading language from localStorage:", error);
      setLanguage({ code: "en", name: "English" });
      setIsLanguageLoaded(true);
    }
  }, []);

  // Persist and set direction only after language is set
  useEffect(() => {
    if (!language) return; // Don't run until language is set

    try {
      localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(language));
    } catch (error) {
      console.error("Error saving language to localStorage:", error);
    }

    if (typeof document !== "undefined") {
      const dir = language.code === "ar" ? "rtl" : "ltr";
      document.documentElement.setAttribute("dir", dir);
      document.documentElement.lang = language.code;
    }
  }, [language]);

  const translate = async (input) => {
    // Don't translate until language is loaded
    if (!isLanguageLoaded || !language) {
      return input;
    }

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
    } catch (error) {
      console.error("Translation error:", error);
      // Fallback to original text on error
      return isArray ? items : items[0];
    }
  };

  const value = useMemo(
    () => ({
      language: language || { code: "en", name: "English" }, // Provide fallback for components
      setLanguage,
      languages: AVAILABLE_LANGUAGES,
      translate,
      isLanguageLoaded,
    }),
    [language, isLanguageLoaded]
  );

  // Don't render children until language is loaded to prevent flash
  if (!isLanguageLoaded || !language) {
    return (
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    );
  }

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
