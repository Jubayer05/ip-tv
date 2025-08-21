"use client";

import Button from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useEffect, useState } from "react";

const FaqStillQuestion = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original text constants
  const ORIGINAL_TEXTS = {
    title: "Still have questions?",
    subtitle:
      "Visit our Contact Page or Submit a Ticket for personalized support.",
    button: "Contact Us Now",
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
    <div className="text-white pt-16 px-8 font-secondary">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h2 className="text-3xl uppercase md:text-5xl font-bold mb-6 tracking-wide text-center">
          {texts.title}{" "}
        </h2>
        <p className="text-white text-sm font-bold max-w-3xl mx-auto leading-relaxed text-center">
          {texts.subtitle}
        </p>
        <div className="flex justify-center">
          <Link href="/support/contact">
            <Button className="mt-10">{texts.button}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FaqStillQuestion;
