"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function MainWrapper({ children }) {
  const { language, isLanguageLoaded } = useLanguage();

  // Apply -mt-[30px] only if language is not English
  const mainClassName =
    isLanguageLoaded && language?.code !== "en"
      ? "min-h-screen -mt-[30px]"
      : "min-h-screen";

  return <main className={mainClassName}>{children}</main>;
}
