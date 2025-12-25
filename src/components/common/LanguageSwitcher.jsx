"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const {
    language,
    languages,
    setLanguage,
    isLanguageLoaded,
    defaultLanguage,
  } = useLanguage();

  if (!isLanguageLoaded || !language || languages.length === 0) return null;

  return (
    <div className="text-center notranslate">
      {languages.map((ld) => {
        const code = ld.code;
        const title = ld.title || ld.name || code;
        const isCurrent =
          language.code === code ||
          (language.code === "auto" && defaultLanguage === code);

        if (isCurrent) {
          return (
            <span key={code} className="mx-3 text-orange-300">
              {title}
            </span>
          );
        }

        return (
          <a
            key={code}
            onClick={() => setLanguage(code)}
            className="mx-3 text-blue-300 cursor-pointer hover:underline"
          >
            {title}
          </a>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
