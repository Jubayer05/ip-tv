"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { usePathname } from "next/navigation";

const HreflangTags = () => {
  const pathname = usePathname();
  const { languages } = useLanguage();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cheapstreamtv.com";

  // Default supported languages if context not loaded yet
  const supportedLanguages = languages?.length > 0
    ? languages
    : [
        { code: "en", name: "English" },
        { code: "es", name: "Spanish" },
        { code: "fr", name: "French" },
        { code: "de", name: "German" },
        { code: "pt", name: "Portuguese" },
      ];

  const currentUrl = `${baseUrl}${pathname}`;

  return (
    <>
      {/* x-default for unspecified language */}
      <link rel="alternate" hrefLang="x-default" href={currentUrl} />

      {/* Alternate language versions */}
      {supportedLanguages.map((lang) => (
        <link
          key={lang.code}
          rel="alternate"
          hrefLang={lang.code}
          href={currentUrl}
        />
      ))}
    </>
  );
};

export default HreflangTags;
