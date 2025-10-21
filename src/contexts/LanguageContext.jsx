"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);

const LANG_STORAGE_KEY = "app_lang";

// Replace the hardcoded AVAILABLE_LANGUAGES with a function that fetches from backend
const fetchAvailableLanguages = async () => {
  try {
    const response = await fetch("/api/settings/languages");
    const data = await response.json();

    if (data.success && data.data.availableLanguages) {
      return data.data.availableLanguages.filter((lang) => lang.isActive);
    }

    // Fallback to hardcoded languages if API fails
    return [
      { code: "en", name: "English", flag: "🇬🇧" },
      { code: "sv", name: "Swedish", flag: "🇸🇪" },
      { code: "no", name: "Norwegian", flag: "🇳🇴" },
      { code: "da", name: "Danish", flag: "🇩🇰" },
      { code: "fi", name: "Finnish", flag: "🇫🇮" },
      { code: "fr", name: "French", flag: "🇫🇷" },
      { code: "de", name: "German", flag: "🇩🇪" },
      { code: "es", name: "Spanish", flag: "🇪🇸" },
      { code: "it", name: "Italian", flag: "🇮🇹" },
      { code: "ru", name: "Russian", flag: "🇷🇺" },
      { code: "tr", name: "Turkish", flag: "🇹🇷" },
      { code: "ar", name: "Arabic", flag: "🇸🇦" },
      { code: "hi", name: "Hindi", flag: "🇮🇳" },
      { code: "zh", name: "Chinese", flag: "🇨🇳" },
    ];
  } catch (error) {
    console.error("Error fetching languages from backend:", error);
    // Return fallback languages
    return [
      { code: "en", name: "English", flag: "🇬🇧" },
      { code: "sv", name: "Swedish", flag: "🇸🇪" },
      { code: "no", name: "Norwegian", flag: "🇳🇴" },
      { code: "da", name: "Danish", flag: "🇩🇰" },
      { code: "fi", name: "Finnish", flag: "🇫🇮" },
      { code: "fr", name: "French", flag: "🇫🇷" },
      { code: "de", name: "German", flag: "🇩🇪" },
      { code: "es", name: "Spanish", flag: "🇪🇸" },
      { code: "it", name: "Italian", flag: "🇮🇹" },
      { code: "ru", name: "Russian", flag: "🇷🇺" },
      { code: "tr", name: "Turkish", flag: "🇹🇷" },
      { code: "ar", name: "Arabic", flag: "🇸🇦" },
      { code: "hi", name: "Hindi", flag: "🇮🇳" },
      { code: "zh", name: "Chinese", flag: "🇨🇳" },
    ];
  }
};

// Update the LanguageProvider component
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(null);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  // Load available languages and saved language on mount
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const languages = await fetchAvailableLanguages();
        setAvailableLanguages(languages);

        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.code && parsed?.name) {
            // Check if saved language is still available
            const isAvailable = languages.some(
              (lang) => lang.code === parsed.code
            );
            if (isAvailable) {
              setLanguage(parsed);
            } else {
              // If saved language is not available, set to first available language
              setLanguage(
                languages[0] || { code: "en", name: "English", flag: "🇬🇧" }
              );
            }
          } else {
            setLanguage(
              languages[0] || { code: "en", name: "English", flag: "🇬🇧" }
            );
          }
        } else {
          setLanguage(
            languages[0] || { code: "en", name: "English", flag: "🇬🇧" }
          );
        }
        setIsLanguageLoaded(true);
      } catch (error) {
        console.error("Error loading languages:", error);
        setLanguage({ code: "en", name: "English", flag: "🇬🇧" });
        setIsLanguageLoaded(true);
      }
    };

    loadLanguages();
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
        }),
      });

      if (!res.ok) {
        throw new Error(`Translation API error: ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

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
      language: language || { code: "en", name: "English", flag: "🇬🇧" },
      setLanguage,
      languages: availableLanguages,
      translate,
      isLanguageLoaded,
    }),
    [language, availableLanguages, isLanguageLoaded]
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
