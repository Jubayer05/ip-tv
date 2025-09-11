"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

export default function TermsOfUseSection() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("Terms and Conditions");
  const [loading, setLoading] = useState(true);

  // Fetch terms and conditions content from backend
  const fetchTermsAndConditions = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "/api/settings/legal-content?type=termsAndConditions"
      );
      const data = await res.json();
      if (data.success && data.data) {
        setTitle(data.data.title || "Terms and Conditions");
        setContent(data.data.content || "");
      }
    } catch (error) {
      console.error("Error fetching terms and conditions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTermsAndConditions();
  }, []);

  // Translate content if needed
  useEffect(() => {
    if (!isLanguageLoaded || language.code === "en" || !content) return;

    let isMounted = true;
    (async () => {
      try {
        const translatedContent = await translate(content);
        if (isMounted) {
          setContent(translatedContent);
        }
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate, content]);

  if (loading) {
    return (
      <div className="font-secondary text-white p-8 lg:p-12 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-400">Loading terms and conditions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-secondary text-white p-8 lg:p-12 max-w-6xl mx-auto">
      <h1 className="text-2xl lg:text-4xl font-bold uppercase mb-6 md:mb-8 tracking-wide">
        {title}
      </h1>

      {content ? (
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="text-gray-400 text-center py-12">
          <p>Terms and conditions content is not available at the moment.</p>
          <p className="text-sm mt-2">
            Please check back later or contact support.
          </p>
        </div>
      )}
    </div>
  );
}
