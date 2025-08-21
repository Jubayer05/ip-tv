"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UserForm() {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original text constants
  const ORIGINAL_TEXTS = {
    title: "User Form",
    subtitle: "User management form",
    button: "Go Home",
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
          ORIGINAL_TEXTS.title,
          ORIGINAL_TEXTS.subtitle,
          ORIGINAL_TEXTS.button,
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const [tTitle, tSubtitle, tButton] = translated;

        setTexts({
          title: tTitle,
          subtitle: tSubtitle,
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">{texts.title}</h1>
      <p className="text-gray-600 mb-6">{texts.subtitle}</p>
      <Link
        href="/"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {texts.button}
      </Link>
    </div>
  );
}
