"use client";

import { parseCookies } from "nookies";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const LanguageContext = createContext(null);

const COOKIE_NAME = "googtrans";

const FALLBACK_LANGUAGES = [
  { code: "en", title: "English" },
  { code: "sv", title: "Swedish" },
  { code: "no", title: "Norwegian" },
  { code: "da", title: "Danish" },
  { code: "fi", title: "Finnish" },
  { code: "fr", title: "French" },
  { code: "de", title: "German" },
  { code: "es", title: "Spanish" },
  { code: "it", title: "Italian" },
  { code: "ru", title: "Russian" },
  { code: "tr", title: "Turkish" },
  { code: "ar", title: "Arabic" },
  { code: "hi", title: "Hindi" },
  { code: "zh", title: "Chinese" },
];

const normalizeDescriptor = (descriptor = {}) => {
  const code = descriptor.code ?? descriptor.name ?? "en";
  const title =
    descriptor.title ?? descriptor.name ?? descriptor.code ?? "English";
  return { code, name: title, title };
};

const getTranslationConfig = () =>
  typeof window !== "undefined"
    ? window.__GOOGLE_TRANSLATION_CONFIG__
    : undefined;

const isIpAddress = (host) => /^\d{1,3}(\.\d{1,3}){3}$/.test(host);

const getDomainCandidates = () => {
  if (typeof window === "undefined") return [undefined];
  const host = window.location.hostname;
  if (!host || host === "localhost" || isIpAddress(host)) {
    return [undefined];
  }
  const parts = host.split(".");
  const domains = new Set([undefined, host]);
  for (let i = 1; i < parts.length; i += 1) {
    domains.add("." + parts.slice(i).join("."));
  }
  return Array.from(domains);
};

const clearTranslationCookie = () => {
  if (typeof document === "undefined") return;
  const expires = "Thu, 01 Jan 1970 00:00:00 GMT";
  getDomainCandidates().forEach((domain) => {
    const domainSegment = domain ? `;domain=${domain}` : "";
    document.cookie = `${COOKIE_NAME}=;path=/;expires=${expires}${domainSegment}`;
  });
};

const writeTranslationCookie = (value) => {
  if (typeof document === "undefined") return;
  const expires = new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000
  ).toUTCString();
  getDomainCandidates().forEach((domain) => {
    const domainSegment = domain ? `;domain=${domain}` : "";
    document.cookie = `${COOKIE_NAME}=${value};path=/;expires=${expires}${domainSegment}`;
  });
};

const readLanguageFromCookie = () => {
  const cookies = parseCookies();
  const existing = cookies[COOKIE_NAME];
  if (!existing) return undefined;
  const split = existing.split("/");
  return split.length > 2 ? split[2] : undefined;
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(null);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [defaultLanguage, setDefaultLanguage] = useState("en");

  useEffect(() => {
    const initializeLanguages = async () => {
      // Try to get languages from database settings first
      let dbLanguages = null;
      try {
        const response = await fetch("/api/settings/languages");
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.availableLanguages) {
            // Filter only active languages
            dbLanguages = result.data.availableLanguages
              .filter((lang) => lang.isActive)
              .map((lang) => normalizeDescriptor({ code: lang.code, title: lang.name }));
            if (result.data.defaultLanguage) {
              setDefaultLanguage(result.data.defaultLanguage);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch language settings:", error);
      }

      // Fall back to config or hardcoded languages
      const config = getTranslationConfig();
      const normalizedLanguages = dbLanguages && dbLanguages.length > 0
        ? dbLanguages
        : config
          ? config.languages.map((item) =>
              normalizeDescriptor({ code: item.name, title: item.title })
            )
          : FALLBACK_LANGUAGES.map((item) => normalizeDescriptor(item));

      setAvailableLanguages(normalizedLanguages);

      if (!dbLanguages && config?.defaultLanguage) {
        setDefaultLanguage(config.defaultLanguage);
      }

      const cookieLang = readLanguageFromCookie();
      const startingCode =
        cookieLang ||
        config?.defaultLanguage ||
        normalizedLanguages[0]?.code ||
        "en";

      const selected =
        normalizedLanguages.find((lang) => lang.code === startingCode) ||
        normalizeDescriptor({ code: startingCode });

      setLanguageState(selected);
      setIsLanguageLoaded(true);
    };

    initializeLanguages();
  }, []);

  useEffect(() => {
    if (!language) return;
    if (typeof document !== "undefined") {
      const dir = language.code === "ar" ? "rtl" : "ltr";
      document.documentElement.setAttribute("dir", dir);
      document.documentElement.lang = language.code;
    }
  }, [language]);

  const setLanguage = useCallback(
    (langInput) => {
      const code =
        typeof langInput === "string"
          ? langInput
          : langInput?.code ?? langInput?.name;
      if (!code) return;

      const languagesList =
        availableLanguages.length > 0
          ? availableLanguages
          : FALLBACK_LANGUAGES.map((item) => normalizeDescriptor(item));

      const selected =
        languagesList.find((lang) => lang.code === code) ||
        normalizeDescriptor({ code });

      setLanguageState(selected);
      clearTranslationCookie();
      writeTranslationCookie(`/auto/${selected.code}`);

      if (typeof window !== "undefined") {
        window.location.reload();
      }
    },
    [availableLanguages]
  );

  const translate = useCallback((input) => {
    if (!input || (Array.isArray(input) && input.length === 0)) return input;

    const isArray = Array.isArray(input);
    const items = isArray ? input : [input];
    return isArray ? items : items[0];
  }, []);

  const value = useMemo(
    () => ({
      language:
        language ||
        normalizeDescriptor({
          code: defaultLanguage,
        }),
      setLanguage,
      languages: availableLanguages,
      translate,
      isLanguageLoaded,
      defaultLanguage,
    }),
    [
      language,
      setLanguage,
      availableLanguages,
      translate,
      isLanguageLoaded,
      defaultLanguage,
    ]
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
